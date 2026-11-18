export interface HeadMovement {
  label: string;
  rotationAmplitude: number;
  verticalAmplitude: number;
  periodMs: number;
  verticalPattern: "bounce" | "sway";
}

export const HEAD_MOVEMENTS = {
  still: {
    label: "Quieto",
    rotationAmplitude: 0,
    verticalAmplitude: 0,
    periodMs: 1,
    verticalPattern: "sway",
  },
  nodding: {
    label: "Asentir",
    rotationAmplitude: 2,
    verticalAmplitude: 2,
    periodMs: 1400,
    verticalPattern: "bounce",
  },
  shaking: {
    label: "Negar",
    rotationAmplitude: 6,
    verticalAmplitude: 0,
    periodMs: 1700,
    verticalPattern: "sway",
  },
  sway: {
    label: "Balanceo suave",
    rotationAmplitude: 2.5,
    verticalAmplitude: 1,
    periodMs: 2800,
    verticalPattern: "sway",
  },
} satisfies Record<string, HeadMovement>;

export type HeadMovementName = keyof typeof HEAD_MOVEMENTS;
