# Juan Animator

Aplicación web para crear un avatar animado de Juan Salazar con diálogo, sincronización de boca y exportación a video MP4.

## Descripción

Juan Animator es un editor de personaje en React + TypeScript + Vite que permite:

- importar un archivo de audio
- escribir texto del diálogo
- sincronizar la animación de la boca con el audio
- mover la cabeza y los brazos mientras habla
- exportar el resultado como video MP4 con FFmpeg WebAssembly

La interfaz está pensada para que el usuario pueda probar animación y generar un render final desde el navegador.

## Tecnologías

- React 19
- TypeScript
- Vite
- FFmpeg WebAssembly
- HTML-to-image

## Requisitos

- Node.js 18 o superior
- npm o pnpm

## Instalación

```bash
npm install
```

## Ejecución en desarrollo

```bash
npm run dev
```

Abrir la URL que indique Vite en la terminal, normalmente:

```text
http://localhost:5173
```

## Build de producción

```bash
npm run build
```

## Exportación de video

La app genera un MP4 con resolución 720×1280, 24 FPS, usando H.264 y audio AAC. La primera exportación puede tardar más tiempo porque carga el encoder de FFmpeg en WebAssembly.

Al hacer clic en "Exportar MP4":

- se prepara el render del personaje
- se reproduce el audio asociado
- se captura la escena animada
- se compone el video final

En navegadores compatibles, puede pedir elegir la ubicación del archivo; si no es posible, descarga el video como archivo normal del navegador.

## Estructura principal

```text
src/
  App.tsx
  components/
    Dialogo.tsx
    JuanSalazar.tsx
  Hook/
    useArmGesture.ts
    useAudioMouth.ts
    useBlink.ts
    useHeadTilt.ts
    useTalking.ts
    useVideoExport.ts
  parts/
    Antebrazo.tsx
    Brazo.tsx
    BrazoCompleto.tsx
    BrazoSuperior.tsx
    Cabeza.tsx
    Cuello.tsx
    Mano.tsx
    Pantalon.tsx
    Torso.tsx
    Zapatos.tsx
  assets/
    fondo.jpg
    hero.png
```

## Scripts disponibles

```bash
npm run dev     # modo desarrollo
npm run build   # compila para producción
npm run preview # vista previa del build
npm run lint    # análisis con oxlint
```

## Notas

- El audio y el texto no se guardan en el proyecto.
- La animación depende del navegador y del soporte de Web APIs para audio y captura.
- Si el navegador bloquea la reproducción automática del audio, puede requerir una interacción del usuario antes de iniciar el diálogo.

## Autor

Proyecto de animación de personaje para pruebas visuales y exportación de video desde navegador.
