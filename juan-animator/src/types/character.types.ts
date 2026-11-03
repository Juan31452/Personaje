
export interface CharacterAnimation {
  isBlinking: boolean;
  isTalking: boolean;
  isHeadMoving: boolean;
}

export interface CharacterAppearance {
  name: string;
  age: number;
  shirtColor: string;
  glassesColor: string;
  skinColor: string;
}

export type CharacterExpression =
  | "neutral"
  | "happy"
  | "surprised"
  | "serious";
