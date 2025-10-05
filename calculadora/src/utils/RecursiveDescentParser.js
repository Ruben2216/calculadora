// Parser recursivo descendente completo que maneja expresiones complejas
// Implementa la gramática:
// E ::= E '+' T | E '-' T | T
// T ::= T '*' F | T '/' F | F  
// F ::= '(' E ')' | entero | real | Seno '(' E ')' | Log '(' E ')'

const SYMBOLS = {
  EOF: 'EOF',
  ERROR: 'ERROR',
  WHITESPACE: 'WHITESPACE',
  MINUS: 'MINUS',
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  TIMES: 'TIMES',
  DIV: 'DIV',
  PLUS: 'PLUS',
  ENTERO: 'ENTERO',
  LOG: 'LOG',
  REAL: 'REAL',
  SENO: 'SENO'
};

class Token {
  constructor(type, value, position) {
    this.type = type;
    this.value = value;
    this.position = position;
  }
}

class Lexer {
  constructor(input) {
    this.input = input;
    this.position = 0;
    this.currentChar = this.input[this.position];
  }

  advance() {
    this.position++;
    if (this.position >= this.input.length) {
      this.currentChar = null;
    } else {
      this.currentChar = this.input[this.position];
    }
  }

  skipWhitespace() {
    while (this.currentChar !== null && /\s/.test(this.currentChar)) {
      this.advance();
    }
  }

  readNumber() {
    let result = '';
    let isReal = false;
    
    while (this.currentChar !== null && /[\d.]/.test(this.currentChar)) {
      if (this.currentChar === '.') {
        if (isReal) break; // Segundo punto decimal
        isReal = true;
      }
      result += this.currentChar;
      this.advance();
    }
    
    return isReal ? parseFloat(result) : parseInt(result);
  }

  readFunction() {
    let result = '';
    while (this.currentChar && /[a-zA-Z]/.test(this.currentChar)) {
      result += this.currentChar;
      this.advance();
    }
    return result.toLowerCase();
  }

  getNextToken() {
    while (this.currentChar !== null) {
      if (/\s/.test(this.currentChar)) {
        this.skipWhitespace();
        continue;
      }

      if (/\d/.test(this.currentChar)) {
        const num = this.readNumber();
        return new Token(Number.isInteger(num) ? SYMBOLS.ENTERO : SYMBOLS.REAL, num, this.position);
      }

      if (/[a-zA-Z]/.test(this.currentChar)) {
        const func = this.readFunction();
        if (func === 'sin') return new Token(SYMBOLS.SENO, func, this.position);
        if (func === 'log') return new Token(SYMBOLS.LOG, func, this.position);
        throw new Error(`Función desconocida: ${func}`);
      }

      const charTokens = {
        '+': SYMBOLS.PLUS, '-': SYMBOLS.MINUS, '*': SYMBOLS.TIMES, '/': SYMBOLS.DIV,
        '(': SYMBOLS.LPAREN, ')': SYMBOLS.RPAREN
      };

      if (charTokens[this.currentChar]) {
        const token = new Token(charTokens[this.currentChar], this.currentChar, this.position);
        this.advance();
        return token;
      }

      throw new Error(`Carácter inesperado: ${this.currentChar}`);
    }

    return new Token(SYMBOLS.EOF, null, this.position);
  }
}

class RecursiveDescentParser {
  constructor(input) {
    this.lexer = new Lexer(input);
    this.currentToken = this.lexer.getNextToken();
    this.derivations = [];
    this.stepCounter = 0;
    this.input = input;
  }

  addDerivation(from, to, symbolBeingDerived = null) {
    this.stepCounter++;
    
    // Crear la versión con el símbolo resaltado
    let fromWithHighlight = from;
    if (symbolBeingDerived) {
      fromWithHighlight = this.highlightSymbol(from, symbolBeingDerived);
    }
    
    const derivation = {
      step: this.stepCounter,
      from: from,
      fromHighlighted: fromWithHighlight,
      to: to,
      production: `${fromWithHighlight} => ${to}`,
      derivingSymbol: symbolBeingDerived
    };
    this.derivations.push(derivation);
  }

  highlightSymbol(derivationString, symbolToHighlight) {
    if (!symbolToHighlight) return derivationString;
    
    // Buscar el primer símbolo no terminal de izquierda a derecha
    let result = '';
    let found = false;
    
    for (let i = 0; i < derivationString.length; i++) {
      const char = derivationString[i];
      
      if (char === symbolToHighlight && !found) {
        // Verificar contexto para asegurar que es un símbolo completo
        const prevChar = i > 0 ? derivationString[i - 1] : ' ';
        const nextChar = i + 1 < derivationString.length ? derivationString[i + 1] : ' ';
        
        if (!/\d/.test(prevChar) && !/\d/.test(nextChar)) {
          result += `**${symbolToHighlight}**`;
          found = true;
        } else {
          result += char;
        }
      } else {
        result += char;
      }
    }
    
    return result;
  }

  eat(tokenType) {
    if (this.currentToken.type === tokenType) {
      this.currentToken = this.lexer.getNextToken();
    } else {
      throw new Error(`Se esperaba ${tokenType}, pero se encontró ${this.currentToken.type}`);
    }
  }

  // E ::= T E'
  // E' ::= '+' T E' | '-' T E' | ε
  parseE(currentDerivation = 'E') {
    // Primera derivación: E -> T (solo si empezamos desde E)
    if (currentDerivation === 'E') {
      this.addDerivation('E', 'T', 'E');
    }
    
    let leftResult = this.parseT('T');
    
    while (this.currentToken.type === SYMBOLS.PLUS || this.currentToken.type === SYMBOLS.MINUS) {
      const op = this.currentToken.type;
      const opChar = this.currentToken.value;
      this.eat(op);
      
      // Para suma/resta, primero aplicar E -> E op T desde el resultado previo
      const eExpression = leftResult.expression;
      const newDerivation = `${eExpression} ${opChar} T`;
      this.addDerivation(eExpression, newDerivation, 'E');
      
      const rightResult = this.parseT('T');
      
      // Reemplazar T con su expresión final
      const finalExpression = newDerivation.replace(/T$/, rightResult.expression);
      if (finalExpression !== newDerivation) {
        this.addDerivation(newDerivation, finalExpression, 'T');
      }
      
      // Calcular resultado
      if (op === SYMBOLS.PLUS) {
        leftResult.value = leftResult.value + rightResult.value;
      } else {
        leftResult.value = leftResult.value - rightResult.value;
      }
      
      leftResult.expression = finalExpression;
    }
    
    return leftResult;
  }

  // T ::= F T'
  // T' ::= '*' F T' | '/' F T' | ε
  parseT(currentDerivation = 'T') {
    // Primera derivación: T -> F (solo si empezamos desde T)
    if (currentDerivation === 'T') {
      this.addDerivation('T', 'F', 'T');
    }
    
    let leftResult = this.parseF('F');
    
    while (this.currentToken.type === SYMBOLS.TIMES || this.currentToken.type === SYMBOLS.DIV) {
      const op = this.currentToken.type;
      const opChar = this.currentToken.value;
      this.eat(op);
      
      // Para multiplicación/división, aplicar T -> T op F desde el resultado previo
      const tExpression = leftResult.expression;
      const newDerivation = `${tExpression} ${opChar} F`;
      this.addDerivation(tExpression, newDerivation, 'T');
      
      const rightResult = this.parseF('F');
      
      // Reemplazar F con su expresión final
      const finalExpression = newDerivation.replace(/F$/, rightResult.expression);
      if (finalExpression !== newDerivation) {
        this.addDerivation(newDerivation, finalExpression, 'F');
      }
      
      // Calcular resultado
      if (op === SYMBOLS.TIMES) {
        leftResult.value = leftResult.value * rightResult.value;
      } else {
        if (rightResult.value === 0) {
          throw new Error('División por cero');
        }
        leftResult.value = leftResult.value / rightResult.value;
      }
      
      leftResult.expression = finalExpression;
    }
    
    return leftResult;
  }

  // F ::= '(' E ')' | entero | real | Seno '(' E ')' | Log '(' E ')'
  parseF(currentDerivation = 'F') {
    if (this.currentToken.type === SYMBOLS.LPAREN) {
      this.addDerivation('F', '( E )', 'F');
      this.eat(SYMBOLS.LPAREN);
      const result = this.parseE('E');
      this.eat(SYMBOLS.RPAREN);
      result.expression = `( ${result.expression} )`;
      return result;
    }
    else if (this.currentToken.type === SYMBOLS.ENTERO || this.currentToken.type === SYMBOLS.REAL) {
      const value = this.currentToken.value;
      this.addDerivation('F', value.toString(), 'F');
      this.eat(this.currentToken.type);
      return { value: value, expression: value.toString() };
    }
    else if (this.currentToken.type === SYMBOLS.SENO) {
      this.addDerivation('F', 'Seno ( E )', 'F');
      this.eat(SYMBOLS.SENO);
      this.eat(SYMBOLS.LPAREN);
      const result = this.parseE('E');
      this.eat(SYMBOLS.RPAREN);
      return { value: Math.sin(result.value), expression: `Seno ( ${result.expression} )` };
    }
    else if (this.currentToken.type === SYMBOLS.LOG) {
      this.addDerivation('F', 'Log ( E )', 'F');
      this.eat(SYMBOLS.LOG);
      this.eat(SYMBOLS.LPAREN);
      const result = this.parseE('E');
      this.eat(SYMBOLS.RPAREN);
      return { value: Math.log10(result.value), expression: `Log ( ${result.expression} )` };
    }
    else {
      throw new Error(`Token inesperado: ${this.currentToken.type}`);
    }
  }

  parse() {
    try {
      this.derivations = [];
      this.stepCounter = 0;
      
      const result = this.parseE();
      
      if (this.currentToken.type !== SYMBOLS.EOF) {
        throw new Error('Tokens inesperados al final de la expresión');
      }
      
      return {
        success: true,
        result: result.value,
        derivations: this.derivations.map(d => d.production),
        errors: []
      };
      
    } catch (error) {
      return {
        success: false,
        result: null,
        derivations: this.derivations.map(d => d.production),
        errors: [error.message]
      };
    }
  }
}

// Función de exportación principal
export function evaluateExpression(input) {
  if (!input || input.trim() === '') {
    return {
      success: false,
      result: null,
      derivations: [],
      errors: ['Expresión vacía']
    };
  }

  try {
    const parser = new RecursiveDescentParser(input.trim());
    return parser.parse();
  } catch (error) {
    return {
      success: false,
      result: null,
      derivations: [],
      errors: [error.message]
    };
  }
}

export default RecursiveDescentParser;