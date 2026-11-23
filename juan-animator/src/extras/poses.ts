// components/JuanSalazar/poses.ts

export interface Pose {
  leftArmAngle: number;      // Hombro izquierdo
  rightArmAngle: number;     // Hombro derecho
  leftForearmAngle: number;  // Codo izquierdo
  rightForearmAngle: number; // Codo derecho
  leftHandAngle: number;     // Muñeca izquierda
  rightHandAngle: number;    // Muñeca derecha
  headTilt: number;          // Inclinación de cabeza
  eyebrowRaise?: number;     // Elevación de las cejas
}

export const POSES = {
  // 🧍 Reposo natural
  idle: {
    leftArmAngle: 0,
    rightArmAngle: 0,
    leftForearmAngle: 0,
    rightForearmAngle: 0,
    leftHandAngle: 0,
    rightHandAngle: 0,
    headTilt: 0,
  },

  // 🤔 Pensando (mano debajo de la boca)
  thinking: {
    leftArmAngle: -50,
    rightArmAngle: 0,
    leftForearmAngle: -127,
    rightForearmAngle: 0,
    leftHandAngle: 0,
    rightHandAngle: 0,
    headTilt: -5,
  },

  // ❤️ Mano en el pecho
  corazon: {
    leftArmAngle: -45,       // Brazo sube
    rightArmAngle: 0,        // Brazo derecho quieto
    leftForearmAngle: -80,   // Codo se dobla mucho
    rightForearmAngle: 0,
    leftHandAngle: 10,       // Mano se inclina hacia la cabeza
    rightHandAngle: 0,
    headTilt: -5,            // Cabeza inclinada
  },

  // 🤗 Manos cruzadas sobre el pecho
  armsCrossed: {
    leftArmAngle: -40,
    rightArmAngle: 40,
    leftForearmAngle: -65,
    rightForearmAngle: 65,
    leftHandAngle: 0,
    rightHandAngle: 0,
    headTilt: 0,
  },

  // 🤨 Alzar las cejas
  raisedEyebrows: {
    leftArmAngle: 0,
    rightArmAngle: 0,
    leftForearmAngle: 0,
    rightForearmAngle: 0,
    leftHandAngle: 0,
    rightHandAngle: 0,
    headTilt: 0,
    eyebrowRaise: 9,
  },

  // 👉 Señalar con índice derecho
  pointing: {
    leftArmAngle: 0,
    rightArmAngle: -60,
    leftForearmAngle: 0,
    rightForearmAngle: -30,
    leftHandAngle: 0,
    rightHandAngle: 120,
    headTilt: 5,
  },

  // 👋 Saludar
  waving: {
    leftArmAngle: 0,
    rightArmAngle: -35,
    leftForearmAngle: 0,
    rightForearmAngle: -125,
    leftHandAngle: 180,
    rightHandAngle: 160,
    headTilt: 5,
  },
  
  // 🤷 Encoger hombros (no sé)
  shrug: {
    leftArmAngle: -20,
    rightArmAngle: 20,
    leftForearmAngle: -60,
    rightForearmAngle: 60,
    leftHandAngle: 20,
    rightHandAngle: -20,
    headTilt: 0,
  },

  // 🙌 Explicar con ambas manos
  explaining: {
    leftArmAngle: -25,
    rightArmAngle: 25,
    leftForearmAngle: -30,
    rightForearmAngle: 30,
    leftHandAngle: 15,
    rightHandAngle: -15,
    headTilt: 0,
  },

  // ✋ Detener / "espera"
  stop: {
    leftArmAngle: 0,
    rightArmAngle: -40,
    leftForearmAngle: 0,
    rightForearmAngle: -20,
    leftHandAngle: 0,
    rightHandAngle: -45,     // Palma hacia adelante
    headTilt: 0,
  },

  // 👂 Escuchar (mano en la oreja)
  listening: {
    leftArmAngle: 0,
    rightArmAngle: -50,
    leftForearmAngle: 0,
    rightForearmAngle: -70,
    leftHandAngle: 0,
    rightHandAngle: 20,
    headTilt: 8,
  },

  // 🖐️ Presentando / Explicando (mano curvada cerca del pecho, como en la referencia)
  presenting: {
    leftArmAngle: -22,        // Baja un poco el brazo para dar espacio lateral
    rightArmAngle: 0,
    leftForearmAngle: -105,    // Abre el ángulo del codo (antes -105) para alejar la mano del pecho
    rightForearmAngle: 0,
    leftHandAngle: -10,       // Endereza la mano para que los dedos apunten hacia arriba/adentro
    rightHandAngle: 0,
    headTilt: 3,
  },

} satisfies Record<string, Pose>;

export type PoseName = keyof typeof POSES;