# Juan Animator

Aplicación web para animar el personaje ilustrado de Juan Salazar a partir de un audio y exportar el resultado como video MP4.

## Funcionalidades

- Importar un archivo de audio desde el equipo.
- Analizar el volumen del audio para animar la apertura de la boca.
- Mostrar el texto escrito en una burbuja mientras se reproduce el audio.
- Animar los brazos, inclinar la cabeza y hacer parpadear al personaje.
- Sustituir la imagen de fondo que aparece detrás del personaje y volver a la original.
- Exportar la escena animada junto con el audio a un archivo MP4.

El movimiento de la boca responde a la intensidad del sonido; no es una sincronización fonética palabra por palabra. El texto es visual y no se convierte en voz: el audio debe importarse por separado.

## Tecnologías

- React 19 y TypeScript
- Vite
- FFmpeg WebAssembly para convertir la grabación a MP4
- `html-to-image` para capturar la escena

## Requisitos

- Node.js 20.19 o superior, o 22.12 o superior (requisito de Vite 8)
- npm
- Un navegador moderno con soporte para Web Audio API, `MediaRecorder`, `canvas.captureStream()` y WebAssembly

## Instalación y desarrollo

Desde la carpeta del proyecto:

```bash
npm install
npm run dev
```

Abre la dirección que muestre Vite en la terminal, normalmente `http://localhost:5173`.

## Uso

1. Importa un archivo de audio.
2. Opcionalmente, importa una imagen para usarla detrás del personaje. Puedes volver a la imagen original con **Usar fondo original**.
3. Escribe el texto que quieras mostrar en la burbuja. Si el campo está vacío, no se muestra.
4. Selecciona **Hablar** para reproducir el audio y ver la animación.
5. Selecciona **Exportar MP4** para generar y guardar el video.

El audio, el texto y la imagen personalizada se mantienen solo en la sesión actual del navegador; no se guardan en el proyecto.

## Exportación de video

El video final tiene resolución de **720 × 1280** y se codifica con **H.264 y audio AAC a 10 FPS**. La exportación graba la escena animada, combina la grabación con el audio importado y usa la imagen original del proyecto como fondo exterior; la imagen personalizada, si se eligió, aparece detrás del personaje.

La primera exportación puede tardar más porque carga FFmpeg WebAssembly. En los navegadores que ofrecen el selector de archivos se puede elegir dónde guardar el MP4. Si el selector no está disponible o el navegador no puede escribir en la ubicación elegida, el video se descarga mediante el navegador.

## Scripts

```bash
npm run dev      # servidor de desarrollo
npm run build    # comprobación de TypeScript y compilación de producción
npm run preview  # vista previa de la compilación
npm run lint     # análisis estático con oxlint
```

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

## Autoría

Proyecto de animación de personaje para pruebas visuales y exportación de video desde el navegador.
