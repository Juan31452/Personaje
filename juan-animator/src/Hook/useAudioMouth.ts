import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

interface AudioEngine {
  context: AudioContext;
  analyser: AnalyserNode;
  destination: MediaStreamAudioDestinationNode;
  samples: Uint8Array<ArrayBuffer>;
}

const audioEngines = new WeakMap<HTMLAudioElement, AudioEngine>();

const createAudioEngine = (audio: HTMLAudioElement): AudioEngine => {
  const cachedEngine = audioEngines.get(audio);
  if (cachedEngine) return cachedEngine;

  const context = new AudioContext();
  const source = context.createMediaElementSource(audio);
  const analyser = context.createAnalyser();
  const destination = context.createMediaStreamDestination();

  analyser.fftSize = 512;
  analyser.smoothingTimeConstant = 0.35;
  source.connect(analyser);
  analyser.connect(context.destination);
  analyser.connect(destination);

  const engine = {
    context,
    analyser,
    destination,
    samples: new Uint8Array(analyser.fftSize),
  };
  audioEngines.set(audio, engine);
  return engine;
};

const getMouthState = (engine: AudioEngine) => {
  engine.analyser.getByteTimeDomainData(engine.samples);

  let squaredAmplitude = 0;
  for (const sample of engine.samples) {
    const amplitude = (sample - 128) / 128;
    squaredAmplitude += amplitude * amplitude;
  }

  const volume = Math.sqrt(squaredAmplitude / engine.samples.length);
  if (volume < 0.012) return 0;
  if (volume < 0.045) return 1;
  if (volume < 0.1) return 2;
  return 3;
};

export const useAudioMouth = (
  audioRef: RefObject<HTMLAudioElement | null>,
) => {
  const [mouthState, setMouthState] = useState(0);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState("");
  const animationFrame = useRef(0);

  const resumeAudioContext = useCallback(async () => {
    const audio = audioRef.current;
    const engine = audio ? audioEngines.get(audio) : undefined;
    if (!engine) throw new Error("El audio todavía no está listo.");
    await engine.context.resume();
  }, [audioRef]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let engine: AudioEngine;
    try {
      engine = createAudioEngine(audio);
      setAudioStream(engine.destination.stream);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudo preparar el análisis del audio.",
      );
      return;
    }

    const updateMouth = () => {
      if (audio.paused || audio.ended) {
        setMouthState(0);
        return;
      }

      setMouthState(getMouthState(engine));
      animationFrame.current = window.requestAnimationFrame(updateMouth);
    };

    const startAnalysis = () => {
      void engine.context.resume().catch((caughtError: unknown) => {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "No se pudo iniciar el análisis del audio.",
        );
      });
      window.cancelAnimationFrame(animationFrame.current);
      animationFrame.current = window.requestAnimationFrame(updateMouth);
    };
    const stopAnalysis = () => {
      window.cancelAnimationFrame(animationFrame.current);
      setMouthState(0);
    };

    audio.addEventListener("play", startAnalysis);
    audio.addEventListener("pause", stopAnalysis);
    audio.addEventListener("ended", stopAnalysis);

    return () => {
      audio.removeEventListener("play", startAnalysis);
      audio.removeEventListener("pause", stopAnalysis);
      audio.removeEventListener("ended", stopAnalysis);
      window.cancelAnimationFrame(animationFrame.current);
    };
  }, [audioRef]);

  return { mouthState, audioStream, error, resumeAudioContext };
};