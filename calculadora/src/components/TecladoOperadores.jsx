import React from 'react';
import './TecladoOperadores.css';

const TecladoOperadores = ({ onOperadorClick }) => {
  const operadores = [
    { valor: '+', texto: '+', titulo: 'Suma' },
    { valor: '-', texto: '−', titulo: 'Resta' },
    { valor: '*', texto: '×', titulo: 'Multiplicación' },
    { valor: '/', texto: '÷', titulo: 'División' }
  ];

  return (
    <div className="teclado-operadores">
      <div className="grid-operadores">
        {operadores.map((operador, index) => (
          <button
            key={index}
            className="boton boton-operador"
            onClick={() => onOperadorClick(operador.valor)}
            title={operador.titulo}
          >
            {operador.texto}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TecladoOperadores;