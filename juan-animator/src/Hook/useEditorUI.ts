import { useState } from "react";
import type { CameraViewName } from "../components/camera";
import type { HeadMovementName } from "../extras/headMovements";

export interface EditorUIState {
  cameraView: CameraViewName;
  headMovement: HeadMovementName;
  backgroundImageUrl: string;
  backgroundError: string;
  showTTS: boolean;
  setCameraView: React.Dispatch<React.SetStateAction<CameraViewName>>;
  setHeadMovement: React.Dispatch<React.SetStateAction<HeadMovementName>>;
  setBackgroundImageUrl: React.Dispatch<React.SetStateAction<string>>;
  setBackgroundError: React.Dispatch<React.SetStateAction<string>>;
  setShowTTS: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useEditorUI = (): EditorUIState => {
  const [cameraView, setCameraView] = useState<CameraViewName>("closeUp");
  const [headMovement, setHeadMovement] = useState<HeadMovementName>("sway");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("");
  const [backgroundError, setBackgroundError] = useState("");
  const [showTTS, setShowTTS] = useState(true);

  return {
    cameraView,
    headMovement,
    backgroundImageUrl,
    backgroundError,
    showTTS,
    setCameraView,
    setHeadMovement,
    setBackgroundImageUrl,
    setBackgroundError,
    setShowTTS,
  };
};