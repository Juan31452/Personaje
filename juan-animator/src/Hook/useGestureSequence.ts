import { useEffect, useState } from "react";
import { GESTURE_TRANSITION_DURATION } from "./useGesture";
import type { PoseName } from "../extras/poses";

interface UseGestureSequenceOptions {
  isAudioPlaying: boolean;
  audioDurationMs: number;
  audioCurrentTimeMs: number;
}

export interface GestureSequenceState {
  selectedGestures: PoseName[];
  gestureSequence: PoseName[];
  gestureSequenceIndex: number;
  isPlayingGestures: boolean;
  isGestureSequenceSynced: boolean;
  gesture: PoseName;
  gestureTransitionDuration: number;
  isGestureSequenceActive: boolean;
  gestureSequenceStep: number;
  gestureSequenceLength: number;
  toggleGesture: (pose: PoseName) => void;
  playGestureSequence: (syncToDialogue?: boolean) => void;
  stopGestureSequence: () => void;
  setSelectedGestures: React.Dispatch<React.SetStateAction<PoseName[]>>;
}

// 👇 IMPORTANTE: debe ser "export const", NO "export default"
export const useGestureSequence = ({
  isAudioPlaying,
  audioDurationMs,
  audioCurrentTimeMs,
}: UseGestureSequenceOptions): GestureSequenceState => {
  const [selectedGestures, setSelectedGestures] = useState<PoseName[]>([]);
  const [gestureSequence, setGestureSequence] = useState<PoseName[]>([]);
  const [gestureSequenceIndex, setGestureSequenceIndex] = useState(0);
  const [isPlayingGestures, setIsPlayingGestures] = useState(false);
  const [isGestureSequenceSynced, setIsGestureSequenceSynced] = useState(false);

  useEffect(() => {
    if (
      !isPlayingGestures ||
      isGestureSequenceSynced ||
      gestureSequenceIndex >= gestureSequence.length
    )
      return;

    const timer = window.setTimeout(
      () => {
        if (gestureSequenceIndex + 1 >= gestureSequence.length) {
          setIsPlayingGestures(false);
          setGestureSequenceIndex(0);
        } else {
          setGestureSequenceIndex((index) => index + 1);
        }
      },
      GESTURE_TRANSITION_DURATION,
    );
    return () => window.clearTimeout(timer);
  }, [
    gestureSequence,
    gestureSequenceIndex,
    isGestureSequenceSynced,
    isPlayingGestures,
  ]);

  const toggleGesture = (pose: PoseName) => {
    setSelectedGestures((selected) =>
      selected.includes(pose)
        ? selected.filter((item) => item !== pose)
        : [...selected, pose],
    );
  };

  const playGestureSequence = (syncToDialogue = false) => {
    if (selectedGestures.length === 0) {
      setGestureSequence([]);
      setGestureSequenceIndex(0);
      setIsPlayingGestures(false);
      setIsGestureSequenceSynced(false);
      return;
    }
    setGestureSequence([...selectedGestures]);
    setGestureSequenceIndex(0);
    setIsGestureSequenceSynced(syncToDialogue);
    setIsPlayingGestures(true);
  };

  const stopGestureSequence = () => {
    setIsPlayingGestures(false);
    setIsGestureSequenceSynced(false);
    setGestureSequenceIndex(0);
  };

  const isDialogueSequenceComplete =
    isGestureSequenceSynced &&
    !isAudioPlaying &&
    audioDurationMs > 0 &&
    audioCurrentTimeMs >= audioDurationMs;

  const isGestureSequenceActive =
    isPlayingGestures &&
    (!isGestureSequenceSynced || isAudioPlaying);

  const currentGestureIndex =
    isGestureSequenceSynced && audioDurationMs > 0
      ? Math.min(
          gestureSequence.length - 1,
          Math.floor(
            (audioCurrentTimeMs / audioDurationMs) *
              gestureSequence.length,
          ),
        )
      : gestureSequenceIndex;

  const gesture: PoseName = isGestureSequenceActive
    ? (gestureSequence[currentGestureIndex] ?? "idle")
    : isDialogueSequenceComplete
      ? (gestureSequence[gestureSequence.length - 1] ?? "idle")
      : "idle";

  const gestureTransitionDuration = isDialogueSequenceComplete
    ? 0
    : isGestureSequenceSynced && isGestureSequenceActive
      ? Math.max(1, audioDurationMs / gestureSequence.length)
      : GESTURE_TRANSITION_DURATION;

  return {
    selectedGestures,
    gestureSequence,
    gestureSequenceIndex,
    isPlayingGestures,
    isGestureSequenceSynced,
    gesture,
    gestureTransitionDuration,
    isGestureSequenceActive,
    gestureSequenceStep: isGestureSequenceActive ? currentGestureIndex + 1 : 0,
    gestureSequenceLength: gestureSequence.length,
    toggleGesture,
    playGestureSequence,
    stopGestureSequence,
    setSelectedGestures,
  };
};