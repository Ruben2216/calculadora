import React from 'react';
import './Pantalla.css';

const Pantalla = ({ expresion, resultado }) => {
  return (
    <div className="pantalla">
      <div className="pantalla-expresion">
        <input
          type="text"
          value={expresion}
          readOnly
          className="input-expresion"
          placeholder="Ingrese la expresión..."
        />
      </div>
      <div className="pantalla-resultado">
        <input
          type="text"
          value={resultado}
          readOnly
          className="input-resultado"
        />
      </div>
    </div>
  );
};

export default Pantalla;