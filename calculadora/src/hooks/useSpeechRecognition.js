import { useState, useEffect, useRef } from 'react';

/**
 * Hook personalizado para manejar el reconocimiento de voz
 * Utiliza la Web Speech API nativa del navegador
 */
export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');

  // Verificar soporte del navegador
  useEffect(() => {
    // Web Speech API está disponible en Chrome, Edge, Safari
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      
      // Crear instancia de reconocimiento
      const recognition = new SpeechRecognition();
      
      // Configuración
      recognition.continuous = false; // No continuar escuchando indefinidamente
      recognition.interimResults = true; // Mostrar resultados parciales
      recognition.lang = 'es-ES'; // Idioma español
      recognition.maxAlternatives = 1; // Solo la mejor alternativa
      
      // Eventos
      recognition.onstart = () => {
        console.log('Reconocimiento de voz iniciado');
        setIsListening(true);
        setError(null);
        setTranscript('');
        finalTranscriptRef.current = '';
      };
      
      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = finalTranscriptRef.current;
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart;
          } else {
            interimTranscript += transcriptPart;
          }
        }
        
        finalTranscriptRef.current = finalTranscript;
        
        // Actualizar transcript con resultados finales e interinos
        const fullTranscript = finalTranscript + interimTranscript;
        setTranscript(fullTranscript);
        
        console.log('Transcript actualizado:', fullTranscript);
      };
      
      recognition.onerror = (event) => {
        console.error('Error en reconocimiento de voz:', event.error);
        
        let errorMessage = 'Error en el reconocimiento de voz';
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No se detectó ningún sonido';
            break;
          case 'audio-capture':
            errorMessage = 'No se pudo acceder al micrófono';
            break;
          case 'not-allowed':
            errorMessage = 'Permiso de micrófono denegado';
            break;
          case 'network':
            errorMessage = 'Error de conexión de red';
            break;
          case 'aborted':
            errorMessage = 'Reconocimiento cancelado';
            break;
          default:
            errorMessage = `Error: ${event.error}`;
        }
        
        setError(errorMessage);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        console.log('Reconocimiento de voz finalizado');
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      setError('Tu navegador no soporta reconocimiento de voz. Prueba con Chrome, Edge o Safari.');
    }
    
    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  /**
   * Inicia el reconocimiento de voz
   */
  const startListening = () => {
    if (!isSupported) {
      setError('Reconocimiento de voz no soportado');
      return;
    }
    
    if (isListening) {
      return; // Ya está escuchando
    }
    
    try {
      setTranscript('');
      setError(null);
      finalTranscriptRef.current = '';
      recognitionRef.current.start();
    } catch (err) {
      console.error('Error al iniciar reconocimiento:', err);
      setError('No se pudo iniciar el reconocimiento de voz');
    }
  };

  /**
   * Detiene el reconocimiento de voz
   */
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  /**
   * Cancela el reconocimiento de voz
   */
  const abortListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      setIsListening(false);
      setTranscript('');
      finalTranscriptRef.current = '';
    }
  };

  /**
   * Reinicia el transcript
   */
  const resetTranscript = () => {
    setTranscript('');
    finalTranscriptRef.current = '';
    setError(null);
  };

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    abortListening,
    resetTranscript
  };
}
