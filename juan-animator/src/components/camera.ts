// components/JuanSalazar/camera.ts

export interface CameraView {
  rotate: number;      // Rotación en grados
  skewX: number;       // Inclinación horizontal (perspectiva)
  skewY: number;       // Inclinación vertical
  scaleX: number;      // Escala horizontal
  scaleY: number;      // Escala vertical
  translateX: number;  // Paneo horizontal
  translateY: number;  // Paneo vertical
}

export const CAMERA_VIEWS: Record<string, CameraView> = {
  // 📷 Frontal (default)
  front: {
    rotate: 0,
    skewX: 0,
    skewY: 0,
    scaleX: 1,
    scaleY: 1,
    translateX: 0,
    translateY: 0,
  },

  // 📷 Personaje colocado a la izquierda, conservando vista frontal
  profileLeft: {
    rotate: 0,
    skewX: 0,
    skewY: 0,
    scaleX: 1,
    scaleY: 1,
    translateX: -140,
    translateY: 0,
  },

  // 📷 Personaje colocado a la derecha, conservando vista frontal
  profileRight: {
    rotate: 0,
    skewX: 0,
    skewY: 0,
    scaleX: 1,
    scaleY: 1,
    translateX: 140,
    translateY: 0,
  },

  // 📷 Acercamiento: cara hasta la mitad del cuerpo
  zoomIn: {
    rotate: 0,
    skewX: 0,
    skewY: 0,
    scaleX: 2.2,
    scaleY: 2.2,
    translateX: 0,
    translateY: 402,
  },

  // 📷 Primer plano (acercamiento cercano)
  closeUp: {
    rotate: 0,
    skewX: 0,
    skewY: 0,
    scaleX: 1.85,
    scaleY: 1.85,
    translateX: 0,
    translateY: -170,
  },

  // 📷 Zoom out (alejar)
  zoomOut: {
    rotate: 0,
    skewX: 0,
    skewY: 0,
    scaleX: 0.7,
    scaleY: 0.7,
    translateX: 0,
    translateY: 50,
  },

  // 📷 Dutch angle (cámara inclinada, dramático)
  dutch: {
    rotate: 15,
    skewX: 0,
    skewY: 0,
    scaleX: 1,
    scaleY: 1,
    translateX: 0,
    translateY: 0,
  },
};

export type CameraViewName = keyof typeof CAMERA_VIEWS;