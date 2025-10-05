import React from 'react';
import './TecladoFunciones.css';

const TecladoFunciones = ({ onFuncionClick }) => {
  const funciones = [
    { valor: 'sin(', texto: 'sin', titulo: 'Función Seno' },
    { valor: 'log(', texto: 'log', titulo: 'Función Logaritmo base 10' },
    { valor: '(', texto: '(', titulo: 'Paréntesis izquierdo' },
    { valor: ')', texto: ')', titulo: 'Paréntesis derecho' }
  ];

  return (
    <div className="teclado-funciones">
      <div className="grid-funciones">
        {funciones.map((funcion, index) => (
          <button
            key={index}
            className="boton boton-funcion"
            onClick={() => onFuncionClick(funcion.valor)}
            title={funcion.titulo}
          >
            {funcion.texto}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TecladoFunciones;