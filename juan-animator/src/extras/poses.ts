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
    rightArmAngle: -60,      // Eleva el brazo desde el hombro
    leftForearmAngle: 0,
    rightForearmAngle: -40,  // Dobla el codo al elevarlo
    leftHandAngle: 0,
    rightHandAngle: -20,     // Mano apunta
    headTilt: 5,
  },

  // 👋 Saludar
  waving: {
    leftArmAngle: 0,
    rightArmAngle: -35,      // Levanta el brazo hacia el lado
    leftForearmAngle: 0,
    rightForearmAngle: -125, // Dobla el codo hacia abajo y eleva la mano
    leftHandAngle: 180,      // Deja los dedos hacia abajo sin inclinación
    rightHandAngle: 160,     // Orienta la palma hacia el frente
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
} satisfies Record<string, Pose>;

export type PoseName = keyof typeof POSES;