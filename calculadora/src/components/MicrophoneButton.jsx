import React, { useEffect, useRef } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { convertirVozAMatematica } from '../utils/voiceToMath';
import './MicrophoneButton.css';

/**
 * Componente de botón de micrófono para entrada por voz
 */
const MicrophoneButton = ({ onVoiceInput }) => {
  const {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition();

  const procesadoRef = useRef(false);
  const lastTranscriptRef = useRef('');

  // Cuando se deja de escuchar y hay transcript, convertir a matemática
  useEffect(() => {
    if (!isListening && transcript && transcript !== lastTranscriptRef.current && !procesadoRef.current) {
      procesadoRef.current = true;
      lastTranscriptRef.current = transcript;
      
      const expresionMatematica = convertirVozAMatematica(transcript);
      
      if (expresionMatematica) {
        console.log('Texto reconocido:', transcript);
        console.log('Expresión matemática:', expresionMatematica);
        
        // Enviar la expresión al componente padre
        if (onVoiceInput) {
          onVoiceInput(expresionMatematica);
        }
      }
      
      // Limpiar el transcript y resetear la bandera después de un breve delay
      setTimeout(() => {
        resetTranscript();
        procesadoRef.current = false;
        lastTranscriptRef.current = '';
      }, 1000);
    }
  }, [isListening, transcript, onVoiceInput, resetTranscript]);

  const handleClick = () => {
    if (!isSupported) {
      alert('Tu navegador no soporta reconocimiento de voz.\nPrueba con Chrome, Edge o Safari.');
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      // Resetear las banderas al iniciar una nueva escucha
      procesadoRef.current = false;
      lastTranscriptRef.current = '';
      startListening();
    }
  };

  // Si hay error, mostrarlo
  useEffect(() => {
    if (error) {
      console.error('Error de reconocimiento de voz:', error);
    }
  }, [error]);

  return (
    <div className="microphone-container">
      <button
        className={`microphone-button ${isListening ? 'listening' : ''} ${!isSupported ? 'disabled' : ''}`}
        onClick={handleClick}
        disabled={!isSupported}
        title={
          isListening 
            ? 'Detener grabación' 
            : isSupported 
              ? 'Iniciar entrada por voz' 
              : 'No soportado en este navegador'
        }
      >
        <div className="microphone-icon">
          {isListening ? (
            // Icono de micrófono activo con animación
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          ) : (
            // Icono de micrófono normal
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          )}
        </div>
        
        {isListening && (
          <div className="pulse-ring"></div>
        )}
      </button>
      
      {/* Mostrar transcript temporal mientras se graba */}
      {isListening && transcript && (
        <div className="transcript-preview">
          <div className="transcript-text">
            {transcript}
          </div>
        </div>
      )}
      
      {/* Mostrar error si existe */}
      {error && !isListening && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default MicrophoneButton;
