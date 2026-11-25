import { useState, type FC, type ChangeEvent } from "react";
import { useTextToSpeech } from "../Hook/useTextToSpeech";
import "../style/TTSEditor.css"; // estilos para el componente TTSEditor

interface TTSEditorProps {
  dialogos?: string[];
  onAudioGenerated?: (audioBlob: Blob, duration: number) => void;
  onApplyText?: (text: string) => void;
  onApplyAudio?: (file: File) => void;
}

const TTSEditor: FC<TTSEditorProps> = ({
  dialogos = [],
  onAudioGenerated,
  onApplyText,
  onApplyAudio,
}) => {
  const [selectedDialogo, setSelectedDialogo] = useState(0);
  const [customText, setCustomText] = useState(dialogos[0] || "");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureStatus, setCaptureStatus] = useState("");

  const {
    isSpeaking,
    isPaused,
    voices,
    selectedVoice,
    progress,
    error,
    speak,
    pause,
    resume,
    stop,
    selectVoice,
  } = useTextToSpeech({ rate, pitch });

  const currentText = customText.trim() || dialogos[selectedDialogo] || "";

  const handleSpeak = () => {
    speak(currentText);
  };

  const handleSelectDialogo = (e: ChangeEvent<HTMLSelectElement>) => {
    const idx = Number(e.target.value);
    setSelectedDialogo(idx);
    setCustomText(dialogos[idx] || "");
  };

  const handleGenerateAudioForCharacter = async () => {
    if (!currentText.trim()) return;

    try {
      setIsCapturing(true);
      setCaptureStatus("Preparando micrófono para capturar la voz...");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: true,
        },
      });

      const mimeType =
        typeof MediaRecorder !== "undefined" &&
        MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const voiceCleanName = selectedVoice?.name
          ? selectedVoice.name.replace(/[^a-zA-Z0-9]/g, "_")
          : "voz";
        const file = new File(
          [blob],
          `tts_${voiceCleanName}_${Date.now()}.webm`,
          { type: mimeType }
        );

        stream.getTracks().forEach((track) => track.stop());

        if (onAudioGenerated) onAudioGenerated(blob, 0);
        if (onApplyAudio) onApplyAudio(file);
        if (onApplyText) onApplyText(currentText);

        setIsCapturing(false);
        setCaptureStatus("✅ ¡Voz y diálogo aplicados al personaje con éxito!");
        setTimeout(() => setCaptureStatus(""), 4000);
      };

      setCaptureStatus("🎙️ Grabando voz sintetizada en tiempo real...");
      mediaRecorder.start(100);

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentText);
      utterance.rate = rate;
      utterance.pitch = pitch;
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onend = () => {
        setTimeout(() => {
          if (mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
          }
        }, 400);
      };

      utterance.onerror = (e) => {
        stream.getTracks().forEach((track) => track.stop());
        setIsCapturing(false);
        setCaptureStatus("");
        alert(`Error al generar voz: ${e.error}`);
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      setIsCapturing(false);
      setCaptureStatus("");
      alert(
        "Se requiere permitir el acceso al micrófono/audio para capturar la voz sintetizada y aplicarla al personaje."
      );
    }
  };

  return (
    <div className="tts-editor-container">
      <h3 className="tts-editor-title">🗣️ Text-to-Speech (Voz sintética)</h3>

      {error && (
        <div className="tts-error-box">
          {error}
        </div>
      )}

      {/* Selector de diálogo */}
      {dialogos.length > 0 && (
        <div className="tts-field">
          <label className="tts-label">Cargar de los diálogos:</label>
          <select
            className="tts-select"
            value={selectedDialogo}
            onChange={handleSelectDialogo}
          >
            {dialogos.map((d, i) => (
              <option key={i} value={i}>
                Diálogo {i + 1}: {(d ?? "").substring(0, 45)}...
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Texto editable */}
      <div className="tts-field">
        <div className="tts-field-header">
          <label className="tts-label">Texto a narrar:</label>
          {onApplyText && (
            <button
              type="button"
              className="tts-btn-mini"
              onClick={() => onApplyText(customText || dialogos[selectedDialogo] || "")}
              disabled={!currentText.trim()}
              title="Copiar este texto a la burbuja de diálogo del personaje"
            >
              📝 Usar en diálogo
            </button>
          )}
        </div>
        <textarea
          className="tts-textarea"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="Escribe o edita el texto..."
        />
      </div>

      {/* Selector de voz */}
      <div className="tts-field">
        <label className="tts-label">Voz del sistema:</label>
        <select
          className="tts-select"
          value={selectedVoice?.voiceURI || selectedVoice?.name || ""}
          onChange={(e) => {
            const voice = voices.find(
              (v) => (v.voiceURI || v.name) === e.target.value
            );
            if (voice) selectVoice(voice);
          }}
        >
          {voices.length === 0 && (
            <option value="">No hay voces disponibles</option>
          )}
          {voices.map((voice) => (
            <option
              key={voice.voiceURI || `${voice.name}-${voice.lang}`}
              value={voice.voiceURI || voice.name}
            >
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>
      </div>

      {/* Controles de velocidad y tono */}
      <div className="tts-sliders-grid">
        <div className="tts-field">
          <label className="tts-label-small">Velocidad: {rate.toFixed(1)}x</label>
          <input
            type="range"
            className="tts-slider"
            min="0.5"
            max="2"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
          />
        </div>
        <div className="tts-field">
          <label className="tts-label-small">Tono: {pitch.toFixed(1)}</label>
          <input
            type="range"
            className="tts-slider"
            min="0"
            max="2"
            step="0.1"
            value={pitch}
            onChange={(e) => setPitch(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Controles de reproducción */}
      <div className="tts-actions-row">
        {!isSpeaking ? (
          <button
            type="button"
            className="tts-btn tts-btn-primary"
            onClick={handleSpeak}
            disabled={!currentText.trim()}
          >
            ▶️ Escuchar prueba
          </button>
        ) : (
          <>
            {!isPaused ? (
              <button type="button" className="tts-btn tts-btn-pause" onClick={pause}>
                ⏸️ Pausar
              </button>
            ) : (
              <button type="button" className="tts-btn tts-btn-resume" onClick={resume}>
                ▶️ Continuar
              </button>
            )}
            <button type="button" className="tts-btn tts-btn-stop" onClick={stop}>
              ⏹️ Detener
            </button>
          </>
        )}
      </div>

      {/* Barra de progreso */}
      {isSpeaking && (
        <div className="tts-progress-container">
          <div
            className="tts-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Botón para aplicar audio al personaje */}
      <button
        type="button"
        className={`tts-btn-generate ${isCapturing ? "capturing" : ""}`}
        onClick={handleGenerateAudioForCharacter}
        disabled={isSpeaking || isCapturing || !currentText.trim()}
      >
        {isCapturing ? "🔴 Grabando voz para el personaje..." : "🎙️ Generar y usar audio en el personaje"}
      </button>

      {captureStatus && (
        <div className="tts-status-message">
          {captureStatus}
        </div>
      )}

      {/* Nota informativa */}
      <small className="tts-info-text">
        ℹ️ Al pulsar <strong>"Generar y usar audio"</strong>, el audio sintetizado se graba y se transfiere automáticamente a Juan Salazar con sincronización labial y habilitación de exportación a MP4.
      </small>
    </div>
  );
};

export default TTSEditor;