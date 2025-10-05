// Parser que genera derivaciones EXACTAS paso a paso por la izquierda
// Para "15 * 3" debe mostrar:
// E => T
// T => T * F  
// T => F (derivamos el T de la izquierda)
// F => 15 (el F de la izquierda se convierte en terminal)
// F => 3 (derivamos el F de la derecha)

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
  constructor(lexer) {
    this.lexer = lexer;
    this.currentToken = this.lexer.getNextToken();
    this.errors = [];
    this.derivations = [];
    this.stepCounter = 0;
    this.tokens = this.getAllTokens();
    this.tokenIndex = 0;
  }

  getAllTokens() {
    const tokens = [];
    const tempLexer = new Lexer(this.lexer.input);
    let token = tempLexer.getNextToken();
    while (token.type !== SYMBOLS.EOF) {
      tokens.push(token);
      token = tempLexer.getNextToken();
    }
    return tokens;
  }

  addDerivation(from, to) {
    this.stepCounter++;
    const derivation = {
      step: this.stepCounter,
      from: from,
      to: to,
      production: `${from} => ${to}`
    };
    this.derivations.push(derivation);
  }

  error(message) {
    const errorMessage = `Error: ${message}`;
    this.errors.push(errorMessage);
    throw new Error(errorMessage);
  }

  eat(tokenType) {
    if (this.currentToken.type === tokenType) {
      this.currentToken = this.lexer.getNextToken();
    } else {
      this.error(`Se esperaba ${tokenType}, se encontró ${this.currentToken.type}`);
    }
  }

  // Generar derivaciones paso a paso siguiendo la gramática
  generateDerivations() {
    this.addDerivation('E', 'T');
    
    // Si hay suma o resta
    if (this.hasAddOrSubtract()) {
      this.addDerivation('E', 'E + T'); // o E - T según corresponda
      
      // Derivar la parte izquierda (E)
      this.addDerivation('E', 'T');
      this.addDerivation('T', 'F');
      
      const firstToken = this.tokens[0];
      if (firstToken.type === SYMBOLS.ENTERO) {
        this.addDerivation('F', firstToken.value.toString());
      } else if (firstToken.type === SYMBOLS.REAL) {
        this.addDerivation('F', firstToken.value.toString());
      }
      
      // Derivar la parte derecha (T)
      this.addDerivation('T', 'F');
      const thirdToken = this.tokens[2]; // después del operador
      if (thirdToken.type === SYMBOLS.ENTERO) {
        this.addDerivation('F', thirdToken.value.toString());
      } else if (thirdToken.type === SYMBOLS.REAL) {
        this.addDerivation('F', thirdToken.value.toString());
      }
    }
    // Si hay multiplicación o división
    else if (this.hasMultiplyOrDivide()) {
      this.addDerivation('T', 'T * F'); // o T / F
      this.addDerivation('T', 'F');
      
      // Derivar el primer número
      const firstToken = this.tokens[0];
      if (firstToken.type === SYMBOLS.ENTERO) {
        this.addDerivation('F', firstToken.value.toString());
      } else if (firstToken.type === SYMBOLS.REAL) {
        this.addDerivation('F', firstToken.value.toString());
      }
      
      // Derivar el segundo número  
      const thirdToken = this.tokens[2]; // después del operador
      if (thirdToken.type === SYMBOLS.ENTERO) {
        this.addDerivation('F', thirdToken.value.toString());
      } else if (thirdToken.type === SYMBOLS.REAL) {
        this.addDerivation('F', thirdToken.value.toString());
      }
    }
    // Si es solo un número
    else {
      this.addDerivation('T', 'F');
      const firstToken = this.tokens[0];
      if (firstToken.type === SYMBOLS.ENTERO) {
        this.addDerivation('F', firstToken.value.toString());
      } else if (firstToken.type === SYMBOLS.REAL) {
        this.addDerivation('F', firstToken.value.toString());
      }
    }
  }

  hasMultiplyOrDivide() {
    return this.tokens.some(t => t.type === SYMBOLS.TIMES || t.type === SYMBOLS.DIV);
  }

  hasAddOrSubtract() {
    return this.tokens.some(t => t.type === SYMBOLS.PLUS || t.type === SYMBOLS.MINUS);
  }

  parseE() {
    let result = this.parseT();
    
    while (this.currentToken.type === SYMBOLS.PLUS || this.currentToken.type === SYMBOLS.MINUS) {
      if (this.currentToken.type === SYMBOLS.PLUS) {
        this.eat(SYMBOLS.PLUS);
        result = result + this.parseT();
      } else {
        this.eat(SYMBOLS.MINUS);
        result = result - this.parseT();
      }
    }
    
    return result;
  }

  parseT() {
    let result = this.parseF();
    
    while (this.currentToken.type === SYMBOLS.TIMES || this.currentToken.type === SYMBOLS.DIV) {
      if (this.currentToken.type === SYMBOLS.TIMES) {
        this.eat(SYMBOLS.TIMES);
        result = result * this.parseF();
      } else {
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
      this.eat(SYMBOLS.ENTERO);
      return token.value;
    } else if (token.type === SYMBOLS.REAL) {
      this.eat(SYMBOLS.REAL);
      return token.value;
    } else if (token.type === SYMBOLS.LPAREN) {
      this.eat(SYMBOLS.LPAREN);
      const result = this.parseE();
      this.eat(SYMBOLS.RPAREN);
      return result;
    } else if (token.type === SYMBOLS.SENO) {
      this.eat(SYMBOLS.SENO);
      this.eat(SYMBOLS.LPAREN);
      const arg = this.parseE();
      this.eat(SYMBOLS.RPAREN);
      return Math.sin(arg);
    } else if (token.type === SYMBOLS.LOG) {
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
      
      // Generar las derivaciones ANTES de hacer el cálculo
      this.generateDerivations();
      
      // Reiniciar el lexer para el cálculo
      this.lexer = new Lexer(this.lexer.input);
      this.currentToken = this.lexer.getNextToken();
      
      const result = this.parseE();
      
      if (this.currentToken.type !== SYMBOLS.EOF) {
        this.error('Token inesperado al final de la expresión');
      }
      
      return {
        success: true,
        result: result,
        productions: this.derivations,
        errors: []
      };
      
    } catch (error) {
      return {
        success: false,
        result: null,
        productions: this.derivations,
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
      productions: [],
      errors: ['Expresión vacía']
    };
  }

  try {
    const lexer = new Lexer(input.trim());
    const parser = new LeftmostDerivationParser(lexer);
    return parser.parse();
  } catch (error) {
    return {
      success: false,
      result: null,
      productions: [],
      errors: [error.message]
    };
  }
}

export default LeftmostDerivationParser;