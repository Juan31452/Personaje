import { useEffect, useState, type ChangeEvent, type FC } from "react";

interface ImageLoaderProps {
  disabled: boolean;
  onImageChange: (url: string) => void;
  onErrorChange: (error: string) => void;
}

const ImageLoader: FC<ImageLoaderProps> = ({
  disabled,
  onImageChange,
  onErrorChange,
}) => {
  const [imageUrl, setImageUrl] = useState("");
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (!imageUrl) return;
    return () => URL.revokeObjectURL(imageUrl);
  }, [imageUrl]);

  const importImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    if (file.type && !file.type.startsWith("image/")) {
      const error = "Selecciona un archivo de imagen válido.";
      onErrorChange(error);
      return;
    }

    const nextImageUrl = URL.createObjectURL(file);
    setImageUrl(nextImageUrl);
    setFileName(file.name);
    onImageChange(nextImageUrl);
    onErrorChange("");
  };

  const resetImage = () => {
    setImageUrl("");
    setFileName("");
    onImageChange("");
    onErrorChange("");
  };

  return (
    <>
      <label className="editor-field">
        <span>Importar fondo del personaje</span>
        <input
          type="file"
          accept="image/*"
          onChange={importImage}
          disabled={disabled}
        />
      </label>
      {fileName && (
        <span className="audio-file-name" title={fileName}>
          {fileName}
        </span>
      )}
      {imageUrl && (
        <button
          className="editor-button-secondary"
          onClick={resetImage}
          disabled={disabled}
        >
          Usar fondo original
        </button>
      )}
    </>
  );
};

export default ImageLoader;
