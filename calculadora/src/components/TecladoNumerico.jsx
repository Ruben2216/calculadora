import React from 'react';
import './TecladoNumerico.css';

const TecladoNumerico = ({ onDigitoClick, onCalcularClick }) => {
  const digitos = [
    { valor: '7', texto: '7' },
    { valor: '8', texto: '8' },
    { valor: '9', texto: '9' },
    { valor: '4', texto: '4' },
    { valor: '5', texto: '5' },
    { valor: '6', texto: '6' },
    { valor: '1', texto: '1' },
    { valor: '2', texto: '2' },
    { valor: '3', texto: '3' },
    { valor: '0', texto: '0' },
    { valor: '.', texto: '.' },
    { valor: '3.14159', texto: 'π' }
  ];

  return (
    <div className="teclado-numerico">
      <div className="grid-numerico">
        {digitos.map((digito, index) => (
          <button
            key={index}
            className={`boton boton-numero ${digito.valor === '3.14159' ? 'boton-pi' : ''}`}
            onClick={() => onDigitoClick(digito.valor)}
            title={digito.valor === '3.14159' ? 'Pi (3.14159)' : digito.texto}
          >
            {digito.texto}
          </button>
        ))}
      </div>
      
      {/* Botón de igual separado ocupando todo el ancho */}
      <button
        className="boton boton-igual"
        onClick={onCalcularClick}
        title="Calcular resultado"
      >
        =
      </button>
    </div>
  );
};

export default TecladoNumerico;