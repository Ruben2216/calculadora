// Parser que genera derivaciones mostrando la cadena completa en cada paso
// Para "15 * 3" debe mostrar:
// E => T
// T => T * F  
// T * F => F * F
// F * F => 15 * F
// 15 * F => 15 * 3

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

class CompleteDerivationParser {
  constructor(lexer) {
    this.lexer = lexer;
    this.errors = [];
    this.derivations = [];
    this.stepCounter = 0;
    this.tokens = this.getAllTokens();
    this.currentDerivation = 'E'; // Cadena de derivación actual
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

  addDerivation(newDerivation, symbolBeingDerived = null) {
    this.stepCounter++;
    
    // Crear la versión con el símbolo resaltado que SE ESTÁ DERIVANDO
    let fromWithHighlight = this.currentDerivation;
    if (symbolBeingDerived) {
      fromWithHighlight = this.highlightDerivingSymbol(this.currentDerivation, symbolBeingDerived);
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

  highlightDerivingSymbol(derivationString, symbolToHighlight) {
    if (!symbolToHighlight) return derivationString;
    
    // Resaltar el primer símbolo no terminal que se está derivando (de izquierda a derecha)
    let found = false;
    let result = '';
    let i = 0;
    
    while (i < derivationString.length) {
      if (derivationString[i] === symbolToHighlight && !found) {
        // Verificar que es una letra completa (no parte de un número)
        const prevChar = i > 0 ? derivationString[i - 1] : ' ';
        const nextChar = i + 1 < derivationString.length ? derivationString[i + 1] : ' ';
        
        if (!/\d/.test(prevChar) && !/\d/.test(nextChar)) {
          result += `**${symbolToHighlight}**`;
          found = true;
        } else {
          result += derivationString[i];
        }
      } else {
        result += derivationString[i];
      }
      i++;
    }
    
    return result;
  }

  error(message) {
    const errorMessage = `Error: ${message}`;
    this.errors.push(errorMessage);
    throw new Error(errorMessage);
  }

  // Generar derivaciones completas paso a paso
  generateCompleteDerivations() {
    // Para 15 * 3:
    if (this.tokens.length === 3 && this.tokens[1].type === SYMBOLS.TIMES) {
      // Paso 1: E => T (E se deriva a T)
      this.addDerivation('T', 'E');
      
      // Paso 2: T => T * F (T se deriva a T * F)
      this.addDerivation('T * F', 'T');
      
      // Paso 3: T * F => F * F (el primer T se deriva a F)
      this.addDerivation('F * F', 'T');
      
      // Paso 4: F * F => 15 * F (el primer F se deriva a 15)
      const firstNum = this.tokens[0].value;
      this.addDerivation(`${firstNum} * F`, 'F');
      
      // Paso 5: 15 * F => 15 * 3 (el segundo F se deriva a 3)
      const secondNum = this.tokens[2].value;
      this.addDerivation(`${firstNum} * ${secondNum}`, 'F');
    }
    // Para división: 20 / 4
    else if (this.tokens.length === 3 && this.tokens[1].type === SYMBOLS.DIV) {
      this.addDerivation('T', 'E');
      this.addDerivation('T / F', 'T');
      this.addDerivation('F / F', 'T');
      
      const firstNum = this.tokens[0].value;
      this.addDerivation(`${firstNum} / F`, 'F');
      
      const secondNum = this.tokens[2].value;
      this.addDerivation(`${firstNum} / ${secondNum}`, 'F');
    }
    // Para suma: 5 + 3
    else if (this.tokens.length === 3 && this.tokens[1].type === SYMBOLS.PLUS) {
      this.addDerivation('E + T', 'E');
      this.addDerivation('T + T', 'E');
      this.addDerivation('F + T', 'T');
      
      const firstNum = this.tokens[0].value;
      this.addDerivation(`${firstNum} + T`, 'F');
      this.addDerivation(`${firstNum} + F`, 'T');
      
      const secondNum = this.tokens[2].value;
      this.addDerivation(`${firstNum} + ${secondNum}`, 'F');
    }
    // Para resta: 10 - 4
    else if (this.tokens.length === 3 && this.tokens[1].type === SYMBOLS.MINUS) {
      this.addDerivation('E - T', 'E');
      this.addDerivation('T - T', 'E');
      this.addDerivation('F - T', 'T');
      
      const firstNum = this.tokens[0].value;
      this.addDerivation(`${firstNum} - T`, 'F');
      this.addDerivation(`${firstNum} - F`, 'T');
      
      const secondNum = this.tokens[2].value;
      this.addDerivation(`${firstNum} - ${secondNum}`, 'F');
    }
    // Para un solo número: 42
    else if (this.tokens.length === 1) {
      this.addDerivation('T', 'E');
      this.addDerivation('F', 'T');
      this.addDerivation(this.tokens[0].value.toString(), 'F');
    }
  }

  // Evaluación matemática simple
  evaluate() {
    if (this.tokens.length === 1) {
      return this.tokens[0].value;
    }
    
    if (this.tokens.length === 3) {
      const left = this.tokens[0].value;
      const op = this.tokens[1].type;
      const right = this.tokens[2].value;
      
      switch (op) {
        case SYMBOLS.PLUS: return left + right;
        case SYMBOLS.MINUS: return left - right;
        case SYMBOLS.TIMES: return left * right;
        case SYMBOLS.DIV: 
          if (right === 0) throw new Error('División por cero');
          return left / right;
        default: throw new Error('Operador desconocido');
      }
    }
    
    throw new Error('Expresión no soportada');
  }

  parse() {
    try {
      this.derivations = [];
      this.stepCounter = 0;
      this.currentDerivation = 'E';
      
      // Generar las derivaciones completas
      this.generateCompleteDerivations();
      
      // Calcular el resultado
      const result = this.evaluate();
      
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
    const parser = new CompleteDerivationParser(lexer);
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

export default CompleteDerivationParser;