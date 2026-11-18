import {
  CAMERA_VIEWS,
  type CameraView,
  type CameraViewName,
} from "../components/camera";

interface UseCameraOptions {
  /** Vista predefinida */
  view?: CameraViewName;
  /** Valores personalizados (sobrescriben la vista) */
  custom?: Partial<CameraView>;
}

/**
 * Hook que controla la "cámara virtual" del personaje.
 */
export const useCamera = ({
  view = "front",
  custom,
}: UseCameraOptions = {}) => {
  const base = CAMERA_VIEWS[view] || CAMERA_VIEWS.front;
  return {
    rotate: custom?.rotate ?? base.rotate,
    skewX: custom?.skewX ?? base.skewX,
    skewY: custom?.skewY ?? base.skewY,
    scaleX: custom?.scaleX ?? base.scaleX,
    scaleY: custom?.scaleY ?? base.scaleY,
    translateX: custom?.translateX ?? base.translateX,
    translateY: custom?.translateY ?? base.translateY,
  } satisfies CameraView;
};