import React from 'react';
import './ProductionModal.css';

const ProductionModal = ({ production, isVisible, onNext, onPrev, isLast, isFirst, currentStep, totalSteps, allProductions }) => {
  if (!isVisible || !production) return null;

  // Obtener las producciones hasta el paso actual
  const historyUpToCurrent = allProductions ? allProductions.slice(0, currentStep) : [];

  return (
    <div className="production-modal-overlay">
      <div className="production-modal">
        <div className="production-header">
          <h3>Producción {currentStep} de {totalSteps}</h3>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div className="production-content">
          <div className="production-step">
            <div className="production-rule">
              <code dangerouslySetInnerHTML={{
                __html: `${production.fromHighlighted || production.from} → ${production.to}`.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #ff6b6b; background: rgba(255, 107, 107, 0.1); padding: 2px 4px; border-radius: 3px;">$1</strong>')
              }}></code>
            </div>
          </div>
          
          {/* Historial de producciones hasta el paso actual */}
          {historyUpToCurrent.length > 0 && (
            <div className="production-history">
              <h4>Historial de Producciones:</h4>
              <div className="history-list">
                {historyUpToCurrent.map((prod, index) => (
                  <div key={index} className="history-item">
                    <span dangerouslySetInnerHTML={{
                      __html: `${prod.fromHighlighted || prod.from} → ${prod.to}`.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #ff6b6b;">$1</strong>')
                    }}></span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="production-footer">
          <button 
            className="production-button prev-button"
            onClick={onPrev}
            disabled={isFirst}
          >
            ← Anterior
          </button>
          <button 
            className="production-button next-button"
            onClick={onNext}
          >
            {isLast ? 'Finalizar' : 'Siguiente →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductionModal;