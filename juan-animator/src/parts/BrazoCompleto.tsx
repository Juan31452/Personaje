import type { FC } from "react";
import BrazoSuperior from "./BrazoSuperior";
import Antebrazo from "./Antebrazo";
import Mano from "./Mano";

interface BrazoCompletoProps {
  lado: "izquierdo" | "derecho";
  armAngle?: number;        // Hombro
  forearmAngle?: number;    // Codo
  handAngle?: number;       // Muñeca
  scale?: number;           // Escala de profundidad
  translateY?: number;      // Traslación vertical de profundidad
}

const BrazoCompleto: FC<BrazoCompletoProps> = ({
  lado,
  armAngle = 0,
  forearmAngle = 0,
  handAngle = 0,
  scale = 1,
  translateY = 0,
}) => {
  const isIzq = lado === "izquierdo";
  
  // Pivote en el hombro para el movimiento de profundidad
  const pivotX = isIzq ? 140 : 260;
  const pivotY = 280;

  return (
    <g
      id={`brazo-completo-${lado}`}
      style={{
        transformOrigin: `${pivotX}px ${pivotY}px`,
        transform: `translate(0, ${translateY}px) scale(${scale})`,
      }}
    >
      <BrazoSuperior lado={lado} angle={armAngle}>
        <Antebrazo lado={lado} angle={forearmAngle}>
          <Mano 
            lado={lado} 
            angle={armAngle + forearmAngle + handAngle}
          />
        </Antebrazo>
      </BrazoSuperior>
    </g>
  );
};

export default BrazoCompleto;