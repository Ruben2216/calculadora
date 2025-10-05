// Parser recursivo descendente completo que maneja cualquier expresión
// Nuevo parser: construye un AST fiable y luego genera derivaciones leftmost desde ese AST.
// Esto evita inconsistencias entre análisis (lexer) y generación de producciones.

const SYMBOLS = {
  EOF: 'EOF',
  MINUS: 'MINUS',
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  TIMES: 'TIMES',
  DIV: 'DIV',
  PLUS: 'PLUS',
  ENTERO: 'ENTERO',
  REAL: 'REAL',
  SENO: 'SENO',
  LOG: 'LOG'
};

class Token {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }
}

class Lexer {
  constructor(input) {
    this.input = input;
    this.pos = 0;
    this.currentChar = this.input[this.pos] || null;
  }

  advance() {
    this.pos++;
    this.currentChar = this.pos < this.input.length ? this.input[this.pos] : null;
  }

  skipWhitespace() {
    while (this.currentChar !== null && /\s/.test(this.currentChar)) {
      this.advance();
    }
  }

  readNumber() {
    let s = '';
    let seenDot = false;
    while (this.currentChar !== null && /[0-9.]/.test(this.currentChar)) {
      if (this.currentChar === '.') {
        if (seenDot) break;
        seenDot = true;
      }
      s += this.currentChar;
      this.advance();
    }
    return seenDot ? parseFloat(s) : parseInt(s, 10);
  }

  readWord() {
    let s = '';
    while (this.currentChar !== null && /[a-zA-Z]/.test(this.currentChar)) {
      s += this.currentChar;
      this.advance();
    }
    return s.toLowerCase();
  }

  getNextToken() {
    this.skipWhitespace();
    if (this.currentChar === null) return new Token(SYMBOLS.EOF, null);

    const c = this.currentChar;
    if (/[0-9]/.test(c)) {
      const num = this.readNumber();
      return new Token(Number.isInteger(num) ? SYMBOLS.ENTERO : SYMBOLS.REAL, num);
    }

    if (/[a-zA-Z]/.test(c)) {
      const w = this.readWord();
      if (w === 'sin' || w === 'seno') return new Token(SYMBOLS.SENO, w);
      if (w === 'log') return new Token(SYMBOLS.LOG, w);
      throw new Error(`Función desconocida: ${w}`);
    }

    // Single-char tokens
    this.advance();
    switch (c) {
      case '+': return new Token(SYMBOLS.PLUS, c);
      case '-': return new Token(SYMBOLS.MINUS, c);
      case '*': return new Token(SYMBOLS.TIMES, c);
      case '/': return new Token(SYMBOLS.DIV, c);
      case '(': return new Token(SYMBOLS.LPAREN, c);
      case ')': return new Token(SYMBOLS.RPAREN, c);
      default: throw new Error(`Carácter inesperado: ${c}`);
    }
  }
}

// AST node helpers
function NumberNode(value) { return { type: 'Number', value }; }
function BinaryNode(op, left, right) { return { type: 'Binary', op, left, right }; }
function FuncNode(name, expr) { return { type: 'Func', name, expr }; }

class Parser {
  constructor(input) {
    this.lexer = new Lexer(input);
    this.currentToken = this.lexer.getNextToken();
  }

  eat(type) {
    if (this.currentToken.type === type) {
      this.currentToken = this.lexer.getNextToken();
    } else {
      throw new Error(`Se esperaba ${type}, pero se encontró ${this.currentToken.type}`);
    }
  }

  // Grammar:
  // E -> T ((+|-) T)*
  // T -> F ((*|/) F)*
  // F -> (E) | number | func (E)

  parseF() {
    const t = this.currentToken;
    if (t.type === SYMBOLS.LPAREN) {
      this.eat(SYMBOLS.LPAREN);
      const node = this.parseE();
      this.eat(SYMBOLS.RPAREN);
      return node;
    }
    if (t.type === SYMBOLS.ENTERO || t.type === SYMBOLS.REAL) {
      this.eat(t.type);
      return NumberNode(t.value);
    }
    if (t.type === SYMBOLS.SENO || t.type === SYMBOLS.LOG) {
      const name = t.value;
      this.eat(t.type);
      this.eat(SYMBOLS.LPAREN);
      const expr = this.parseE();
      this.eat(SYMBOLS.RPAREN);
      return FuncNode(name, expr);
    }
    throw new Error(`Token inesperado en F: ${t.type}`);
  }

  parseT() {
    let node = this.parseF();
    while (this.currentToken.type === SYMBOLS.TIMES || this.currentToken.type === SYMBOLS.DIV) {
      const op = this.currentToken.value;
      const opType = this.currentToken.type;
      this.eat(opType);
      const right = this.parseF();
      node = BinaryNode(op, node, right);
    }
    return node;
  }

  parseE() {
    let node = this.parseT();
    while (this.currentToken.type === SYMBOLS.PLUS || this.currentToken.type === SYMBOLS.MINUS) {
      const op = this.currentToken.value;
      const opType = this.currentToken.type;
      this.eat(opType);
      const right = this.parseT();
      node = BinaryNode(op, node, right);
    }
    return node;
  }
}

// Generator de derivaciones leftmost desde AST
class LeftmostGenerator {
  constructor(ast) {
    this.ast = ast;
    this.steps = [];
    this.current = ['E']; // as array of symbols/terminals
  }

  // Helper: produce string from current array
  currentString() {
    return this.current.join(' ');
  }

  // Replace first occurrence of symbol (like 'E','T','F') with replacement array
  replaceFirst(symbol, replacementArray) {
    for (let i = 0; i < this.current.length; i++) {
      if (this.current[i] === symbol) {
        this.current = [
          ...this.current.slice(0, i),
          ...replacementArray,
          ...this.current.slice(i + 1)
        ];
        return true;
      }
    }
    return false;
  }

  // Wrap symbol with highlight (first occurrence)
  highlightFirst(symbol) {
    let found = false;
    const parts = this.current.map((tok) => {
      if (!found && tok === symbol) {
        found = true;
        return `**${tok}**`;
      }
      return tok;
    });
    return parts.join(' ');
  }

  addStep(symbolBeingDerived) {
    const stepObj = {
      from: this.currentString(),
      fromHighlighted: this.highlightFirst(symbolBeingDerived),
      to: this.currentString()
    };
    // production string will be built externally when replacement occurs
    this.steps.push(stepObj);
  }

  // Expand routines guided by AST nodes
  generate() {
    // Start expanding root as E
    this.expandE(this.ast);
    return this.steps;
  }

  expandE(node) {
    if (node.type === 'Binary' && (node.op === '+' || node.op === '-')) {
      // E -> E op T
      this.replaceFirst('E', ['E', node.op, 'T']);
      this.steps.push({ from: 'E', fromHighlighted: '**E**', to: this.currentString(), derivingSymbol: 'E' });

      // Expand left (as E)
      this.expandE(node.left);

      // Now expand right as T
      this.expandT(node.right);
    } else {
      // E -> T
      this.replaceFirst('E', ['T']);
      this.steps.push({ from: 'E', fromHighlighted: '**E**', to: this.currentString(), derivingSymbol: 'E' });
      this.expandT(node);
    }
  }

  expandT(node) {
    if (node.type === 'Binary' && (node.op === '*' || node.op === '/')) {
      // T -> T op F
      this.replaceFirst('T', ['T', node.op, 'F']);
      this.steps.push({ from: 'T', fromHighlighted: '**T**', to: this.currentString(), derivingSymbol: 'T' });

      // Expand left (as T)
      this.expandT(node.left);

      // Expand right as F
      this.expandF(node.right);
    } else {
      // T -> F
      this.replaceFirst('T', ['F']);
      this.steps.push({ from: 'T', fromHighlighted: '**T**', to: this.currentString(), derivingSymbol: 'T' });
      this.expandF(node);
    }
  }

  expandF(node) {
    if (node.type === 'Number') {
      // F -> number
      this.replaceFirst('F', [node.value.toString()]);
      this.steps.push({ from: 'F', fromHighlighted: '**F**', to: this.currentString(), derivingSymbol: 'F' });
    } else if (node.type === 'Func') {
      // F -> name ( E )
      this.replaceFirst('F', [node.name, '(', 'E', ')']);
      this.steps.push({ from: 'F', fromHighlighted: '**F**', to: this.currentString(), derivingSymbol: 'F' });
      // Expand inner E
      this.expandE(node.expr);
    } else {
      // Parenthesized: node is an expression
      // F -> ( E )
      this.replaceFirst('F', ['(', 'E', ')']);
      this.steps.push({ from: 'F', fromHighlighted: '**F**', to: this.currentString(), derivingSymbol: 'F' });
      // Expand inner E
      this.expandE(node);
    }
  }
}

// Exported function: parse input, build AST, generate leftmost derivations and evaluate
export function evaluateExpression(input) {
  if (!input || input.trim() === '') {
    return { success: false, result: null, derivations: [], errors: ['Expresión vacía'] };
  }

  try {
    const parser = new Parser(input.trim());
    const ast = parser.parseE();
    // Ensure no trailing tokens
    if (parser.currentToken.type !== SYMBOLS.EOF) {
      throw new Error('Tokens inesperados al final de la expresión');
    }

    // Evaluate AST
    function evalNode(n) {
      if (n.type === 'Number') return n.value;
      if (n.type === 'Func') {
        const v = evalNode(n.expr);
        if (n.name === 'sin' || n.name === 'seno') return Math.sin(v);
        if (n.name === 'log') return Math.log10(v);
        return v;
      }
      if (n.type === 'Binary') {
        const a = evalNode(n.left);
        const b = evalNode(n.right);
        switch (n.op) {
          case '+': return a + b;
          case '-': return a - b;
          case '*': return a * b;
          case '/': if (b === 0) throw new Error('División por cero'); return a / b;
        }
      }
      throw new Error('Nodo desconocido');
    }

    const value = evalNode(ast);

    // Generate derivations leftmost
    const gen = new LeftmostGenerator(ast);
    const steps = gen.generate();

    // Convert steps into desired object format (add step numbers and production text)
    const derivations = steps.map((s, i) => ({
      step: i + 1,
      from: s.from,
      fromHighlighted: s.fromHighlighted,
      to: s.to,
      production: `${s.fromHighlighted} => ${s.to}`,
      derivingSymbol: (s.fromHighlighted.match(/\*\*(E|T|F)\*\*/) || [null, null])[1]
    }));

    return { success: true, result: value, derivations, errors: [] };
  } catch (err) {
    return { success: false, result: null, derivations: [], errors: [err.message] };
  }
}

export default null;