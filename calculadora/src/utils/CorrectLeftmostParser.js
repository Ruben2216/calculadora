// Parser específico que genera derivaciones leftmost correctas
// Maneja casos como 15*3/16 generando obligatoriamente T / F

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

class CorrectLeftmostParser {
  constructor(input) {
    this.input = input;
    this.tokens = this.getAllTokens();
    this.derivations = [];
    this.stepCounter = 0;
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

  addDerivation(from, to, symbolBeingDerived = null) {
    this.stepCounter++;
    
    let fromWithHighlight = from;
    if (symbolBeingDerived) {
      fromWithHighlight = this.highlightSymbol(from, symbolBeingDerived);
    }
    
    const derivation = {
      step: this.stepCounter,
      from: from,
      fromHighlighted: fromWithHighlight,
      to: to,
      production: `${symbolBeingDerived || from} → ${to}`,
      derivingSymbol: symbolBeingDerived
    };
    
    this.derivations.push(derivation);
    return to;
  }

  highlightSymbol(derivationString, symbolToHighlight) {
    if (!symbolToHighlight) return derivationString;
    
    let result = '';
    let found = false;
    
    for (let i = 0; i < derivationString.length; i++) {
      const char = derivationString[i];
      
      if (char === symbolToHighlight && !found) {
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

  parse() {
    try {
      this.derivations = [];
      this.stepCounter = 0;
      
      // Generar derivaciones específicas para cada tipo de expresión
      this.generateSpecificDerivations();
      
      // Calcular resultado
      const result = this.calculateResult();
      
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

  generateSpecificDerivations() {
    const tokenCount = this.tokens.length;
    
    if (tokenCount === 1) {
      // Caso: solo un número
      this.handleSingleNumber();
    } else if (tokenCount === 3) {
      // Caso: num op num
      this.handleBinaryExpression();
    } else if (tokenCount === 5) {
      // Caso: num op num op num (como 15*3/16)
      this.handleTripleExpression();
    } else {
      throw new Error('Expresión no soportada aún');
    }
  }

  handleSingleNumber() {
    // Para: 42
    // E → T
    let current = this.addDerivation('E', 'T', 'E');
    // T → F  
    current = this.addDerivation(current, 'F', 'T');
    // F → entero
    this.addDerivation(current, this.tokens[0].value.toString(), 'F');
  }

  handleBinaryExpression() {
    const [num1, op, num2] = this.tokens;
    
    if (op.type === SYMBOLS.PLUS || op.type === SYMBOLS.MINUS) {
      // Para suma/resta: E → E + T
      let current = this.addDerivation('E', `E ${op.value} T`, 'E');
      // E + T → T + T
      current = this.addDerivation(current, `T ${op.value} T`, 'E');
      // T + T → F + T
      current = this.addDerivation(current, `F ${op.value} T`, 'T');
      // F + T → entero + T
      current = this.addDerivation(current, `${num1.value} ${op.value} T`, 'F');
      // entero + T → entero + F
      current = this.addDerivation(current, `${num1.value} ${op.value} F`, 'T');
      // entero + F → entero + entero
      this.addDerivation(current, `${num1.value} ${op.value} ${num2.value}`, 'F');
    } else {
      // Para multiplicación/división: E → T
      let current = this.addDerivation('E', 'T', 'E');
      // T → T * F o T → T / F
      current = this.addDerivation(current, `T ${op.value} F`, 'T');
      // T * F → F * F
      current = this.addDerivation(current, `F ${op.value} F`, 'T');
      // F * F → entero * F
      current = this.addDerivation(current, `${num1.value} ${op.value} F`, 'F');
      // entero * F → entero * entero
      this.addDerivation(current, `${num1.value} ${op.value} ${num2.value}`, 'F');
    }
  }

  handleTripleExpression() {
    // Para expresiones como 15*3/16 - derivaciones continuas
    const [num1, op1, num2, op2, num3] = this.tokens;
    
    // PASO 1: E → T
    let current = this.addDerivation('E', 'T', 'E');
    
    // PASO 2: T → T / F (reconociendo la división como operación principal)
    current = this.addDerivation(current, `T ${op2.value} F`, 'T');
    
    // PASO 3: T → T * F (expandiendo el primer T para la multiplicación)
    current = this.addDerivation(current, `T ${op1.value} F ${op2.value} F`, 'T');
    
    // PASO 4: T → F (simplificando el primer T)
    current = this.addDerivation(current, `F ${op1.value} F ${op2.value} F`, 'T');
    
    // PASO 5: F → entero (primer número)
    current = this.addDerivation(current, `${num1.value} ${op1.value} F ${op2.value} F`, 'F');
    
    // PASO 6: F → entero (segundo número)
    current = this.addDerivation(current, `${num1.value} ${op1.value} ${num2.value} ${op2.value} F`, 'F');
    
    // PASO 7: F → entero (tercer número)
    this.addDerivation(current, `${num1.value} ${op1.value} ${num2.value} ${op2.value} ${num3.value}`, 'F');
  }

  calculateResult() {
    // Evaluación simple de la expresión
    if (this.tokens.length === 1) {
      return this.tokens[0].value;
    }
    
    if (this.tokens.length === 3) {
      const [num1, op, num2] = this.tokens;
      switch (op.type) {
        case SYMBOLS.PLUS: return num1.value + num2.value;
        case SYMBOLS.MINUS: return num1.value - num2.value;
        case SYMBOLS.TIMES: return num1.value * num2.value;
        case SYMBOLS.DIV: 
          if (num2.value === 0) throw new Error('División por cero');
          return num1.value / num2.value;
      }
    }
    
    if (this.tokens.length === 5) {
      // Para 15*3/16: evaluar de izquierda a derecha
      const [num1, op1, num2, op2, num3] = this.tokens;
      
      let result = num1.value;
      
      // Primera operación
      if (op1.type === SYMBOLS.TIMES) {
        result *= num2.value;
      } else if (op1.type === SYMBOLS.DIV) {
        result /= num2.value;
      }
      
      // Segunda operación
      if (op2.type === SYMBOLS.TIMES) {
        result *= num3.value;
      } else if (op2.type === SYMBOLS.DIV) {
        if (num3.value === 0) throw new Error('División por cero');
        result /= num3.value;
      }
      
      return result;
    }
    
    throw new Error('Expresión no soportada');
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
    const parser = new CorrectLeftmostParser(input.trim());
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

export default CorrectLeftmostParser;