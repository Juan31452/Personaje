import { useState, type FC, type ChangeEvent } from "react";
import { useTextToSpeech } from "../Hook/useTextToSpeech";

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

        if (onAudioGenerated) {
          onAudioGenerated(blob, 0);
        }
        if (onApplyAudio) {
          onApplyAudio(file);
        }
        if (onApplyText) {
          onApplyText(currentText);
        }

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
    <div
      className="tts-editor"
      style={{
        padding: "16px",
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        borderRadius: "8px",
        color: "#fff",
      }}
    >
      <h3 style={{ margin: "0 0 12px", fontSize: "16px", color: "#fff" }}>
        🗣️ Text-to-Speech (Voz sintética)
      </h3>

      {error && (
        <div
          style={{
            color: "#f87171",
            marginBottom: "10px",
            padding: "8px 10px",
            backgroundColor: "rgba(239, 68, 68, 0.15)",
            borderRadius: "6px",
            fontSize: "13px",
          }}
        >
          {error}
        </div>
      )}

      {/* Selector de diálogo */}
      {dialogos.length > 0 && (
        <div style={{ marginBottom: "12px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "4px",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            Cargar de los diálogos:
          </label>
          <select
            value={selectedDialogo}
            onChange={handleSelectDialogo}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              background: "#1b2a4a",
              color: "#fff",
            }}
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
      <div style={{ marginBottom: "12px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "4px",
          }}
        >
          <label
            style={{
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            Texto a narrar:
          </label>
          {onApplyText && (
            <button
              type="button"
              onClick={() => onApplyText(customText || dialogos[selectedDialogo] || "")}
              disabled={!currentText.trim()}
              style={{
                background: "rgba(59, 130, 246, 0.2)",
                color: "#60a5fa",
                border: "1px solid rgba(59, 130, 246, 0.4)",
                borderRadius: "4px",
                padding: "2px 8px",
                fontSize: "11px",
                cursor: currentText.trim() ? "pointer" : "not-allowed",
                fontWeight: 500,
              }}
              title="Copiar este texto a la burbuja de diálogo del personaje"
            >
              📝 Usar en diálogo
            </button>
          )}
        </div>
        <textarea
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="Escribe o edita el texto..."
          rows={3}
          style={{
            width: "100%",
            padding: "8px 10px",
            borderRadius: "6px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            background: "#121f37",
            color: "#fff",
            fontFamily: "inherit",
            fontSize: "14px",
            boxSizing: "border-box",
            resize: "vertical",
          }}
        />
      </div>

      {/* Selector de voz */}
      <div style={{ marginBottom: "12px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "4px",
            fontSize: "13px",
            fontWeight: 500,
          }}
        >
          Voz del sistema:
        </label>
        <select
          value={selectedVoice?.voiceURI || selectedVoice?.name || ""}
          onChange={(e) => {
            const voice = voices.find(
              (v) => (v.voiceURI || v.name) === e.target.value
            );
            if (voice) selectVoice(voice);
          }}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            background: "#1b2a4a",
            color: "#fff",
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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          marginBottom: "14px",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "4px",
              fontSize: "12px",
            }}
          >
            Velocidad: {rate.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "4px",
              fontSize: "12px",
            }}
          >
            Tono: {pitch.toFixed(1)}
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={pitch}
            onChange={(e) => setPitch(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>
      </div>

      {/* Controles de reproducción */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        {!isSpeaking ? (
          <button
            type="button"
            onClick={handleSpeak}
            disabled={!currentText.trim()}
            style={{
              flex: 1,
              padding: "10px",
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: currentText.trim() ? "pointer" : "not-allowed",
              fontSize: "14px",
              fontWeight: 600,
              opacity: currentText.trim() ? 1 : 0.6,
            }}
          >
            ▶️ Escuchar prueba
          </button>
        ) : (
          <>
            {!isPaused ? (
              <button
                type="button"
                onClick={pause}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#d97706",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                ⏸️ Pausar
              </button>
            ) : (
              <button
                type="button"
                onClick={resume}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#059669",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                ▶️ Continuar
              </button>
            )}
            <button
              type="button"
              onClick={stop}
              style={{
                flex: 1,
                padding: "10px",
                backgroundColor: "#dc2626",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              ⏹️ Detener
            </button>
          </>
        )}
      </div>

      {/* Barra de progreso */}
      {isSpeaking && (
        <div style={{ marginBottom: "10px" }}>
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: "6px",
              overflow: "hidden",
              height: "8px",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                backgroundColor: "#38bdf8",
                transition: "width 0.1s linear",
              }}
            />
          </div>
        </div>
      )}

      {/* Botón para aplicar audio al personaje */}
      <button
        type="button"
        onClick={handleGenerateAudioForCharacter}
        disabled={isSpeaking || isCapturing || !currentText.trim()}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: isCapturing ? "#dc2626" : "#059669",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: isSpeaking || isCapturing || !currentText.trim() ? "not-allowed" : "pointer",
          fontSize: "14px",
          fontWeight: 600,
          marginBottom: "8px",
          transition: "all 0.15s ease",
          opacity: isSpeaking || !currentText.trim() ? 0.6 : 1,
        }}
      >
        {isCapturing ? "🔴 Grabando voz para el personaje..." : "🎙️ Generar y usar audio en el personaje"}
      </button>

      {captureStatus && (
        <div
          style={{
            textAlign: "center",
            color: "#38bdf8",
            fontSize: "12px",
            marginBottom: "10px",
            fontWeight: 500,
          }}
        >
          {captureStatus}
        </div>
      )}

      {/* Nota informativa */}
      <small
        style={{
          display: "block",
          color: "#94a3b8",
          fontSize: "11px",
          lineHeight: "1.4",
        }}
      >
        ℹ️ Al pulsar <strong>"Generar y usar audio"</strong>, el audio sintetizado se graba y se transfiere automáticamente a Juan Salazar con sincronización labial y habilitación de exportación a MP4.
      </small>
    </div>
  );
};

export default TTSEditor;
