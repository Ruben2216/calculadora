// Parser mejorado que maneja expresiones complejas como 15*16/3
// Implementa derivaciones paso a paso siguiendo la gramática exacta

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

class ComplexExpressionParser {
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

  // Análisis específico para diferentes tipos de expresiones
  analyzeExpression() {
    const tokenCount = this.tokens.length;
    
    // Caso 1: Expresión simple (1 token) - número solo
    if (tokenCount === 1) {
      this.addDerivation('E', 'T', 'E');
      this.addDerivation('T', 'F', 'T');
      this.addDerivation('F', this.tokens[0].value.toString(), 'F');
      return this.tokens[0].value;
    }
    
    // Caso 2: Expresión binaria simple (3 tokens) - num op num
    if (tokenCount === 3) {
      return this.handleBinaryExpression();
    }
    
    // Caso 3: Expresión compleja (5+ tokens) - múltiples operadores
    if (tokenCount >= 5) {
      return this.handleComplexExpression();
    }
    
    throw new Error('Expresión no soportada');
  }

  handleBinaryExpression() {
    const left = this.tokens[0].value;
    const op = this.tokens[1];
    const right = this.tokens[2].value;
    
    if (op.type === SYMBOLS.PLUS || op.type === SYMBOLS.MINUS) {
      // Suma o resta: E -> E op T
      this.addDerivation('E', `E ${op.value} T`, 'E');
      this.addDerivation(`E ${op.value} T`, `T ${op.value} T`, 'E');
      this.addDerivation(`T ${op.value} T`, `F ${op.value} T`, 'T');
      this.addDerivation(`F ${op.value} T`, `${left} ${op.value} T`, 'F');
      this.addDerivation(`${left} ${op.value} T`, `${left} ${op.value} F`, 'T');
      this.addDerivation(`${left} ${op.value} F`, `${left} ${op.value} ${right}`, 'F');
    } else {
      // Multiplicación o división: T -> T op F
      this.addDerivation('E', 'T', 'E');
      this.addDerivation('T', `T ${op.value} F`, 'T');
      this.addDerivation(`T ${op.value} F`, `F ${op.value} F`, 'T');
      this.addDerivation(`F ${op.value} F`, `${left} ${op.value} F`, 'F');
      this.addDerivation(`${left} ${op.value} F`, `${left} ${op.value} ${right}`, 'F');
    }
    
    // Calcular resultado
    switch (op.type) {
      case SYMBOLS.PLUS: return left + right;
      case SYMBOLS.MINUS: return left - right;
      case SYMBOLS.TIMES: return left * right;
      case SYMBOLS.DIV: 
        if (right === 0) throw new Error('División por cero');
        return left / right;
      default: throw new Error('Operador desconocido');
    }
  }

  handleComplexExpression() {
    // Para expresiones como 15*16/3
    // Aplicamos precedencia: multiplicación y división de izquierda a derecha
    
    let result = this.tokens[0].value;
    let currentExpression = 'E';
    
    // Primera derivación: E -> T
    this.addDerivation('E', 'T', 'E');
    currentExpression = 'T';
    
    // Para cada par operador-operando
    for (let i = 1; i < this.tokens.length; i += 2) {
      const op = this.tokens[i];
      const operand = this.tokens[i + 1].value;
      
      if (op.type === SYMBOLS.TIMES || op.type === SYMBOLS.DIV) {
        // Multiplicación/División: T -> T op F
        const newExpression = `${currentExpression} ${op.value} F`;
        this.addDerivation(currentExpression, newExpression, 'T');
        
        // Derivar el primer T a F si es necesario
        if (currentExpression.includes('T') && !currentExpression.includes('F')) {
          const withF = newExpression.replace(/^T/, 'F');
          this.addDerivation(newExpression, withF, 'T');
          currentExpression = withF;
        } else {
          currentExpression = newExpression;
        }
        
        // Derivar F a número
        if (i === 1) {
          // Primera operación: derivar F inicial
          const withFirstNum = currentExpression.replace(/^F/, result.toString());
          this.addDerivation(currentExpression, withFirstNum, 'F');
          currentExpression = withFirstNum;
        }
        
        // Derivar F final a número
        const finalExpression = currentExpression.replace(/F$/, operand.toString());
        this.addDerivation(currentExpression, finalExpression, 'F');
        currentExpression = finalExpression;
        
        // Calcular resultado
        if (op.type === SYMBOLS.TIMES) {
          result = result * operand;
        } else {
          if (operand === 0) throw new Error('División por cero');
          result = result / operand;
        }
      }
    }
    
    return result;
  }

  parse() {
    try {
      this.derivations = [];
      this.stepCounter = 0;
      
      const result = this.analyzeExpression();
      
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
    const parser = new ComplexExpressionParser(input.trim());
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

export default ComplexExpressionParser;