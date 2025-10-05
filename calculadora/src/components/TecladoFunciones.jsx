import React from 'react';
import MicrophoneButton from './MicrophoneButton';
import './TecladoFunciones.css';

const TecladoFunciones = ({ onFuncionClick, onVoiceInput }) => {
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
        
        {/* Botón de entrada por voz al final de la fila */}
        <div className="microphone-wrapper">
          <MicrophoneButton onVoiceInput={onVoiceInput} />
        </div>
      </div>
    </div>
  );
};

export default TecladoFunciones;