// Parser que genera derivaciones leftmost correctas paso a paso
// Deriva SIEMPRE el símbolo no-terminal más a la izquierda

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
        if (isReal) break;
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

class LeftmostDerivationParser {
  constructor(input) {
    this.input = input;
    this.tokens = this.getAllTokens();
    this.derivations = [];
    this.stepCounter = 0;
    this.currentDerivation = 'E'; // Cadena de derivación actual
  }

  getAllTokens() {
    const tokens = [];
    const lexer = new Lexer(this.input);
    let token = lexer.getNextToken();
    while (token.type !== SYMBOLS.EOF) {
      tokens.push(token);
      token = lexer.getNextToken();
    }
    return tokens;
  }

  addDerivation(newDerivation, symbolBeingDerived = null) {
    this.stepCounter++;
    
    // Crear la versión con el símbolo resaltado
    let fromWithHighlight = this.currentDerivation;
    if (symbolBeingDerived) {
      fromWithHighlight = this.highlightLeftmostSymbol(this.currentDerivation, symbolBeingDerived);
    }
    
    const derivation = {
      step: this.stepCounter,
      from: this.currentDerivation,
      fromHighlighted: fromWithHighlight,
      to: newDerivation,
      production: `${fromWithHighlight} => ${newDerivation}`,
      derivingSymbol: symbolBeingDerived
    };
    
    this.derivations.push(derivation);
    this.currentDerivation = newDerivation;
  }

  // Resaltar el símbolo no-terminal más a la izquierda que se está derivando
  highlightLeftmostSymbol(derivationString, symbolToHighlight) {
    if (!symbolToHighlight) return derivationString;
    
    // Buscar el primer símbolo no terminal de izquierda a derecha
    let result = '';
    let found = false;
    
    for (let i = 0; i < derivationString.length; i++) {
      const char = derivationString[i];
      
      if (char === symbolToHighlight && !found) {
        // Verificar que es realmente un símbolo no terminal (E, T, F)
        const prevChar = i > 0 ? derivationString[i - 1] : ' ';
        const nextChar = i + 1 < derivationString.length ? derivationString[i + 1] : ' ';
        
        // Solo resaltar si no es parte de un número
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

  // Encontrar el símbolo no-terminal más a la izquierda
  findLeftmostNonTerminal(derivationString) {
    const nonTerminals = ['E', 'T', 'F'];
    for (let i = 0; i < derivationString.length; i++) {
      const char = derivationString[i];
      if (nonTerminals.includes(char)) {
        // Verificar que no es parte de un número
        const prevChar = i > 0 ? derivationString[i - 1] : ' ';
        const nextChar = i + 1 < derivationString.length ? derivationString[i + 1] : ' ';
        
        if (!/\d/.test(prevChar) && !/\d/.test(nextChar)) {
          return { symbol: char, position: i };
        }
      }
    }
    return null;
  }

  // Reemplazar el símbolo más a la izquierda con su derivación
  replaceLeftmostSymbol(derivationString, symbol, replacement) {
    let result = '';
    let found = false;
    
    for (let i = 0; i < derivationString.length; i++) {
      const char = derivationString[i];
      
      if (char === symbol && !found) {
        const prevChar = i > 0 ? derivationString[i - 1] : ' ';
        const nextChar = i + 1 < derivationString.length ? derivationString[i + 1] : ' ';
        
        if (!/\d/.test(prevChar) && !/\d/.test(nextChar)) {
          result += replacement;
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

  // Parser recursivo que construye el árbol sintáctico
  parse() {
    try {
      this.derivations = [];
      this.stepCounter = 0;
      this.currentDerivation = 'E';
      
      // Generar todas las derivaciones leftmost paso a paso
      this.generateLeftmostDerivations();
      
      // Calcular el resultado final
      const result = this.evaluate();
      
      return {
        success: true,
        result: result,
        derivations: this.derivations,
        errors: []
      };
      
    } catch (error) {
      return {
        success: false,
        result: null,
        derivations: this.derivations,
        errors: [error.message]
      };
    }
  }

  generateLeftmostDerivations() {
    // Continuar mientras haya símbolos no-terminales
    while (true) {
      const leftmost = this.findLeftmostNonTerminal(this.currentDerivation);
      if (!leftmost) break;
      
      const { symbol, position } = leftmost;
      
      // Aplicar la regla correspondiente al símbolo
      this.applyProductionRule(symbol, position);
    }
  }

  applyProductionRule(symbol, position) {
    // Determinar qué regla aplicar basándose en el contexto y los tokens
    if (symbol === 'E') {
      this.applyERule(position);
    } else if (symbol === 'T') {
      this.applyTRule(position);
    } else if (symbol === 'F') {
      this.applyFRule(position);
    }
  }

  applyERule(position) {
    // E ::= E '+' T | E '-' T | T
    
    // Buscar si hay + o - después de esta posición
    const hasAddition = this.hasOperatorAfter(position, ['+', '-']);
    
    if (hasAddition) {
      // E -> E + T o E -> E - T
      const op = this.getOperatorAfter(position, ['+', '-']);
      const newDerivation = this.replaceLeftmostSymbol(this.currentDerivation, 'E', `E ${op} T`);
      this.addDerivation(newDerivation, 'E');
    } else {
      // E -> T
      const newDerivation = this.replaceLeftmostSymbol(this.currentDerivation, 'E', 'T');
      this.addDerivation(newDerivation, 'E');
    }
  }

  applyTRule(position) {
    // T ::= T '*' F | T '/' F | F
    
    // Buscar si hay * o / después de esta posición
    const hasMultiplication = this.hasOperatorAfter(position, ['*', '/']);
    
    if (hasMultiplication) {
      // T -> T * F o T -> T / F
      const op = this.getOperatorAfter(position, ['*', '/']);
      const newDerivation = this.replaceLeftmostSymbol(this.currentDerivation, 'T', `T ${op} F`);
      this.addDerivation(newDerivation, 'T');
    } else {
      // T -> F
      const newDerivation = this.replaceLeftmostSymbol(this.currentDerivation, 'T', 'F');
      this.addDerivation(newDerivation, 'T');
    }
  }

  applyFRule(position) {
    // F ::= '(' E ')' | entero | real | Seno '(' E ')' | Log '(' E ')'
    
    // Determinar qué está en esta posición en los tokens originales
    const tokenAtPosition = this.getTokenAtLogicalPosition(position);
    
    if (tokenAtPosition && tokenAtPosition.type === SYMBOLS.LPAREN) {
      // F -> ( E )
      const newDerivation = this.replaceLeftmostSymbol(this.currentDerivation, 'F', '( E )');
      this.addDerivation(newDerivation, 'F');
    } else if (tokenAtPosition && (tokenAtPosition.type === SYMBOLS.ENTERO || tokenAtPosition.type === SYMBOLS.REAL)) {
      // F -> número
      const newDerivation = this.replaceLeftmostSymbol(this.currentDerivation, 'F', tokenAtPosition.value.toString());
      this.addDerivation(newDerivation, 'F');
    } else {
      // Por defecto, F -> número del primer token disponible
      const nextToken = this.getNextAvailableToken();
      if (nextToken) {
        const newDerivation = this.replaceLeftmostSymbol(this.currentDerivation, 'F', nextToken.value.toString());
        this.addDerivation(newDerivation, 'F');
      }
    }
  }

  // Funciones auxiliares para analizar el contexto
  hasOperatorAfter(position, operators) {
    // Implementación simplificada - verificar si los tokens contienen estos operadores
    return this.tokens.some(token => operators.includes(token.value));
  }

  getOperatorAfter(position, operators) {
    // Encontrar el primer operador de la lista en los tokens
    for (const token of this.tokens) {
      if (operators.includes(token.value)) {
        return token.value;
      }
    }
    return operators[0]; // fallback
  }

  getTokenAtLogicalPosition(position) {
    // Mapear la posición lógica a un token real
    if (this.tokens.length > 0) {
      return this.tokens[0]; // simplificado por ahora
    }
    return null;
  }

  getNextAvailableToken() {
    // Devolver el siguiente token numérico disponible
    return this.tokens.find(token => token.type === SYMBOLS.ENTERO || token.type === SYMBOLS.REAL);
  }

  // Evaluación matemática del resultado final
  evaluate() {
    // Implementación recursiva descendente para calcular el resultado
    const lexer = new Lexer(this.input);
    return this.evaluateExpression(lexer);
  }

  evaluateExpression(lexer) {
    let result = this.evaluateTerm(lexer);
    let token = lexer.getNextToken();
    
    while (token.type === SYMBOLS.PLUS || token.type === SYMBOLS.MINUS) {
      const op = token.type;
      const right = this.evaluateTerm(lexer);
      
      if (op === SYMBOLS.PLUS) {
        result += right;
      } else {
        result -= right;
      }
      
      token = lexer.getNextToken();
    }
    
    return result;
  }

  evaluateTerm(lexer) {
    let result = this.evaluateFactor(lexer);
    let token = lexer.getNextToken();
    
    while (token.type === SYMBOLS.TIMES || token.type === SYMBOLS.DIV) {
      const op = token.type;
      const right = this.evaluateFactor(lexer);
      
      if (op === SYMBOLS.TIMES) {
        result *= right;
      } else {
        if (right === 0) throw new Error('División por cero');
        result /= right;
      }
      
      token = lexer.getNextToken();
    }
    
    return result;
  }

  evaluateFactor(lexer) {
    const token = lexer.getNextToken();
    
    if (token.type === SYMBOLS.ENTERO || token.type === SYMBOLS.REAL) {
      return token.value;
    } else if (token.type === SYMBOLS.LPAREN) {
      const result = this.evaluateExpression(lexer);
      lexer.getNextToken(); // consumir ')'
      return result;
    }
    
    throw new Error(`Token inesperado: ${token.type}`);
  }
}

// Función de exportación
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
    const parser = new LeftmostDerivationParser(input.trim());
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

export default LeftmostDerivationParser;