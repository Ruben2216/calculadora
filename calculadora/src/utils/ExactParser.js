// Parser que genera EXACTAMENTE las derivaciones especificadas
// Para "35 * sin(35)" debe mostrar:
// E => T
// T => T * F  
// T => F (Produce el 35 a la izquierda del *)
// F => entero
// F => Seno ( E ) (Produce la estructura seno(...) a la derecha del *)
// E => T (Dentro del paréntesis) 
// T => F
// F => entero (Produce el 35 dentro del paréntesis)

const SYMBOLS = {
  EOF: 0, ERROR: 1, WHITESPACE: 2, MINUS: 3, LPAREN: 4, RPAREN: 5,
  TIMES: 6, DIV: 7, PLUS: 8, ENTERO: 9, LOG: 10, REAL: 11, SENO: 12
};

class Token {
  constructor(type, value, position = 0) {
    this.type = type;
    this.value = value;
    this.position = position;
  }
}

class Lexer {
  constructor(input) {
    this.input = input;
    this.position = 0;
    this.currentChar = this.input[this.position] || null;
  }

  advance() {
    this.position++;
    this.currentChar = this.position >= this.input.length ? null : this.input[this.position];
  }

  skipWhitespace() {
    while (this.currentChar && /\s/.test(this.currentChar)) {
      this.advance();
    }
  }

  readNumber() {
    let result = '';
    let isReal = false;
    
    while (this.currentChar && (/\d/.test(this.currentChar) || this.currentChar === '.')) {
      if (this.currentChar === '.') {
        if (isReal) break;
        isReal = true;
      }
      result += this.currentChar;
      this.advance();
    }
    
    const value = isReal ? parseFloat(result) : parseInt(result, 10);
    const type = isReal ? SYMBOLS.REAL : SYMBOLS.ENTERO;
    return new Token(type, value);
  }

  readIdentifier() {
    let result = '';
    while (this.currentChar && /[a-zA-Z]/.test(this.currentChar)) {
      result += this.currentChar;
      this.advance();
    }
    
    switch (result.toLowerCase()) {
      case 'sin': return new Token(SYMBOLS.SENO, 'sin');
      case 'log': return new Token(SYMBOLS.LOG, 'log');
      default: return new Token(SYMBOLS.ERROR, result);
    }
  }

  getNextToken() {
    while (this.currentChar !== null) {
      if (/\s/.test(this.currentChar)) {
        this.skipWhitespace();
        continue;
      }
      if (/\d/.test(this.currentChar)) return this.readNumber();
      if (/[a-zA-Z]/.test(this.currentChar)) return this.readIdentifier();

      const char = this.currentChar;
      this.advance();

      switch (char) {
        case '+': return new Token(SYMBOLS.PLUS, '+');
        case '-': return new Token(SYMBOLS.MINUS, '-');
        case '*': return new Token(SYMBOLS.TIMES, '*');
        case '/': return new Token(SYMBOLS.DIV, '/');
        case '(': return new Token(SYMBOLS.LPAREN, '(');
        case ')': return new Token(SYMBOLS.RPAREN, ')');
        default: return new Token(SYMBOLS.ERROR, char);
      }
    }
    return new Token(SYMBOLS.EOF, null);
  }
}

class ExactParser {
  constructor(lexer) {
    this.lexer = lexer;
    this.currentToken = this.lexer.getNextToken();
    this.errors = [];
    this.derivations = [];
    this.derivationHistory = []; // Historial completo de todas las derivaciones
    this.stepCounter = 0;
    this.derivationString = 'E'; // String de derivación actual
  }

  error(message) {
    const errorMessage = `Error: ${message}`;
    this.errors.push(errorMessage);
    throw new Error(errorMessage);
  }

  addDerivation(newString) {
    this.stepCounter++;
    const derivation = {
      step: this.stepCounter,
      from: this.derivationString,
      to: newString,
      production: `${this.derivationString} => ${newString}`,
      timestamp: new Date().toLocaleTimeString()
    };
    
    this.derivations.push(derivation);
    this.derivationHistory.push(derivation);
    this.derivationString = newString; // Actualizar la cadena de derivación
  }

  // Método para obtener el historial completo
  getDerivationHistory() {
    return this.derivationHistory;
  }

  // Método para limpiar el historial
  clearHistory() {
    this.derivationHistory = [];
    this.derivations = [];
    this.stepCounter = 0;
  }

  eat(tokenType) {
    if (this.currentToken.type === tokenType) {
      this.currentToken = this.lexer.getNextToken();
    } else {
      this.error(`Se esperaba ${tokenType}, se encontró ${this.currentToken.type}`);
    }
  }

  // Análisis completo de la expresión para determinar estructura
  analyzeTokens() {
    const tokens = [];
    const tempLexer = new Lexer(this.lexer.input);
    let token = tempLexer.getNextToken();
    
    while (token.type !== SYMBOLS.EOF) {
      tokens.push(token);
      token = tempLexer.getNextToken();
    }
    
    return tokens;
  }

  parseE() {
    // Análisis para determinar qué producción usar
    const hasAddSub = this.hasOperationAtLevel(['PLUS', 'MINUS']);
    
    if (hasAddSub) {
      this.addDerivation('E + T');
      const leftResult = this.parseE();
      const op = this.currentToken.type;
      this.eat(op);
      const rightResult = this.parseT();
      return op === SYMBOLS.PLUS ? leftResult + rightResult : leftResult - rightResult;
    } else {
      this.addDerivation('T');
      return this.parseT();
    }
  }

  parseT() {
    const tokens = this.analyzeTokens();
    
    // Determinar si hay operaciones de multiplicación/división
    const hasTimes = tokens.some(t => t.type === SYMBOLS.TIMES);
    const hasDiv = tokens.some(t => t.type === SYMBOLS.DIV);
    
    if (hasTimes) {
      this.addDerivation('T', 'T * F');
    } else if (hasDiv) {
      this.addDerivation('T', 'T / F');
    } else {
      this.addDerivation('T', 'F');
    }

    let result = this.parseF();

    while (this.currentToken.type === SYMBOLS.TIMES || this.currentToken.type === SYMBOLS.DIV) {
      if (this.currentToken.type === SYMBOLS.TIMES) {
        this.addDerivation('T', 'F');
        this.eat(SYMBOLS.TIMES);
        const rightOperand = this.parseF();
        result = result * rightOperand;
      } else {
        this.addDerivation('T', 'F');
        this.eat(SYMBOLS.DIV);
        const divisor = this.parseF();
        if (divisor === 0) {
          this.error('División por cero');
        }
        result = result / divisor;
      }
    }

    return result;
  }

  parseF() {
    const token = this.currentToken;

    if (token.type === SYMBOLS.ENTERO) {
      this.addDerivation('F', 'entero');
      this.eat(SYMBOLS.ENTERO);
      return token.value;
    } else if (token.type === SYMBOLS.REAL) {
      this.addDerivation('F', 'real');
      this.eat(SYMBOLS.REAL);
      return token.value;
    } else if (token.type === SYMBOLS.LPAREN) {
      this.addDerivation('F', '( E )');
      this.eat(SYMBOLS.LPAREN);
      const result = this.parseE();
      this.eat(SYMBOLS.RPAREN);
      return result;
    } else if (token.type === SYMBOLS.SENO) {
      this.addDerivation('F', 'Seno ( E )');
      this.eat(SYMBOLS.SENO);
      this.eat(SYMBOLS.LPAREN);
      
      const arg = this.parseE();
      
      this.eat(SYMBOLS.RPAREN);
      return Math.sin(arg);
    } else if (token.type === SYMBOLS.LOG) {
      this.addDerivation('F', 'Log ( E )');
      this.eat(SYMBOLS.LOG);
      this.eat(SYMBOLS.LPAREN);
      
      const arg = this.parseE();
      
      this.eat(SYMBOLS.RPAREN);
      return Math.log10(arg);
    } else {
      this.error(`Token inesperado: ${token.value}`);
    }
  }

  parse() {
    try {
      this.derivations = [];
      this.stepCounter = 0;
      
      const result = this.parseE();
      
      if (this.currentToken.type !== SYMBOLS.EOF) {
        this.error('Caracteres extra al final');
      }
      
      return {
        success: true,
        result: result,
        errors: [],
        productions: this.derivations
      };
    } catch (error) {
      return {
        success: false,
        result: null,
        errors: this.errors.length > 0 ? this.errors : [error.message],
        productions: this.derivations
      };
    }
  }
}

export function evaluateExpression(expression) {
  try {
    const normalized = expression.replace(/sin\(/g, 'sin(').replace(/log\(/g, 'log(');
    const lexer = new Lexer(normalized);
    const parser = new ExactParser(lexer);
    return parser.parse();
  } catch (error) {
    return {
      success: false,
      result: null,
      errors: [error.message],
      productions: []
    };
  }
}

export { SYMBOLS, Token, Lexer, ExactParser };