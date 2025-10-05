import React, { useState, useEffect } from 'react';
import ProductionModal from './ProductionModal';
import './ProductionsDisplay.css';

const ProductionsDisplay = ({ productions, showProductions, onToggleShow }) => {
  const [currentProductionIndex, setCurrentProductionIndex] = useState(-1);
  const [showModal, setShowModal] = useState(false);

  // Iniciar la visualización de producciones cuando hay nuevas producciones
  useEffect(() => {
    if (showProductions && productions && productions.length > 0) {
      setCurrentProductionIndex(0);
      setShowModal(true);
    } else {
      setShowModal(false);
      setCurrentProductionIndex(-1);
    }
  }, [productions, showProductions]);

  const handleNextProduction = () => {
    if (currentProductionIndex < productions.length - 1) {
      setCurrentProductionIndex(currentProductionIndex + 1);
    } else {
      // Finalizar la visualización
      setShowModal(false);
      setCurrentProductionIndex(-1);
    }
  };

  const handlePrevProduction = () => {
    if (currentProductionIndex > 0) {
      setCurrentProductionIndex(currentProductionIndex - 1);
    }
  };



  const currentProduction = productions && productions[currentProductionIndex] 
    ? productions[currentProductionIndex] 
    : null;

  return (
    <div className="productions-display">
      <div className="productions-control">
        <label className="checkbox-container">
          <input
            type="checkbox"
            checked={showProductions}
            onChange={onToggleShow}
            className="productions-checkbox"
          />
          <span className="checkmark"></span>
          <span className="checkbox-label">Mostrar Producciones</span>
        </label>
      </div>

      {/* Modal flotante para mostrar producciones paso a paso */}
      <ProductionModal
        production={currentProduction}
        isVisible={showModal}
        onNext={handleNextProduction}
        onPrev={handlePrevProduction}
        isLast={currentProductionIndex === productions.length - 1}
        isFirst={currentProductionIndex === 0}
        currentStep={currentProductionIndex + 1}
        totalSteps={productions ? productions.length : 0}
        allProductions={productions}
      />
    </div>
  );
};

export default ProductionsDisplay;