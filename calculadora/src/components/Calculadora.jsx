import React, { useState } from 'react';
import Pantalla from './Pantalla';
import TecladoNumerico from './TecladoNumerico';
import TecladoOperadores from './TecladoOperadores';
import TecladoFunciones from './TecladoFunciones';
import ProductionsDisplay from './ProductionsDisplay';
import { evaluateExpression } from '../utils/UniversalLeftmostParser';
import './Calculadora.css';

const Calculadora = () => {
  const [expresion, setExpresion] = useState('');
  const [resultado, setResultado] = useState('0');
  const [memoria, setMemoria] = useState(0);
  const [showProductions, setShowProductions] = useState(false);
  const [productions, setProductions] = useState([]);

  // Función para manejar la entrada de dígitos y operadores
  const manejarEntrada = (valor) => {
    setExpresion(expresion + valor);
  };

  // Función para limpiar la calculadora
  const limpiar = () => {
    setExpresion('');
    setResultado('0');
  };

  // Función para limpiar solo la expresión actual
  const limpiarEntrada = () => {
    setExpresion('');
  };

  // Función para borrar el último carácter
  const borrar = () => {
    setExpresion(expresion.slice(0, -1));
  };

  // Función para calcular el resultado usando la gramática de gramaticas1.ada
  const calcular = () => {
    if (!expresion.trim()) {
      setResultado('0');
      setProductions([]);
      return;
    }

    console.log('Evaluando expresión con gramática:', expresion);
    
    // Usar el parser basado en la gramática definida en gramaticas1.ada
    const parseResult = evaluateExpression(expresion);
    
    if (parseResult.success) {
      // La gramática procesó correctamente la expresión
      const resultadoCalculado = parseResult.result.toString();
      setResultado(resultadoCalculado);
      setProductions(parseResult.derivations || []);
      
      console.log('Resultado calculado por gramática:', resultadoCalculado);
      console.log('Producciones aplicadas:', parseResult.derivations);
    } else {
      // Error en el parsing según las reglas de gramática
      setResultado('Error');
      setProductions(parseResult.derivations || []);
      console.error('Errores de gramática:', parseResult.errors);
      
      // Mostrar errores al usuario (opcional)
      if (parseResult.errors.length > 0) {
        alert(`Error en la expresión:\n${parseResult.errors.join('\n')}`);
      }
    }
  };

  // Función para toggle del checkbox de mostrar producciones
  const toggleShowProductions = () => {
    setShowProductions(!showProductions);
  };

  // Funciones de memoria
  const guardarEnMemoria = () => {
    const valor = parseFloat(resultado);
    if (!isNaN(valor)) {
      setMemoria(valor);
    }
  };

  const recuperarMemoria = () => {
    setExpresion(expresion + memoria.toString());
  };

  const limpiarMemoria = () => {
    setMemoria(0);
  };

  return (
    <div className="calculadora">
      <div className="calculadora-contenedor">
        <Pantalla 
          expresion={expresion} 
          resultado={resultado} 
        />
        
        {/* Componente para mostrar las producciones aplicadas */}
        <ProductionsDisplay 
          productions={productions}
          showProductions={showProductions}
          onToggleShow={toggleShowProductions}
        />
        
        <div className="teclado">
          {/* Fila de funciones de memoria y limpieza */}
          <div className="fila-memoria">
            <button 
              className="boton boton-memoria" 
              onClick={limpiarMemoria}
              title="Limpiar Memoria"
            >
              MC
            </button>
            <button 
              className="boton boton-memoria" 
              onClick={recuperarMemoria}
              title="Recuperar Memoria"
            >
              MR
            </button>
            <button 
              className="boton boton-memoria" 
              onClick={guardarEnMemoria}
              title="Guardar en Memoria"
            >
              M
            </button>
            <button 
              className="boton boton-limpiar" 
              onClick={limpiar}
              title="Limpiar Todo"
            >
              C
            </button>
            <button 
              className="boton boton-limpiar" 
              onClick={limpiarEntrada}
              title="Limpiar Entrada"
            >
              CE
            </button>
            <button 
              className="boton boton-borrar" 
              onClick={borrar}
              title="Borrar"
            >
              ⌫
            </button>
          </div>

          <div className="calculadora-cuerpo">
            {/* Funciones en la parte superior */}
            <TecladoFunciones onFuncionClick={manejarEntrada} />
            
            {/* Sección principal con números y operadores */}
            <div className="seccion-principal">
              <div className="seccion-numeros">
                <TecladoNumerico 
                  onDigitoClick={manejarEntrada}
                  onCalcularClick={calcular}
                />
              </div>
              
              <div className="seccion-operadores">
                <TecladoOperadores onOperadorClick={manejarEntrada} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculadora;