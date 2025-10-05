import React, { useState } from 'react';
import './DerivationHistory.css';

const DerivationHistory = ({ history, onStepSelect, currentStep }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!history || history.length === 0) {
    return null;
  }

  return (
    <div className="derivation-history">
      <div className="history-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h4>Historial de Derivaciones ({history.length} pasos)</h4>
        <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
      </div>
      
      {isExpanded && (
        <div className="history-content">
          <div className="history-controls">
            <button 
              className="clear-history-btn"
              onClick={() => window.derivationHistoryHandler?.clearHistory()}
            >
              Limpiar Historial
            </button>
          </div>
          
          <div className="history-list">
            {history.map((derivation, index) => (
              <div 
                key={`${derivation.step}-${index}`}
                className={`history-item ${currentStep === derivation.step ? 'current' : ''}`}
                onClick={() => onStepSelect && onStepSelect(derivation.step)}
              >
                <div className="step-info">
                  <span className="step-number">Paso {derivation.step}</span>
                  <span className="step-time">{derivation.timestamp}</span>
                </div>
                <div className="production-rule">
                  {derivation.production}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DerivationHistory;