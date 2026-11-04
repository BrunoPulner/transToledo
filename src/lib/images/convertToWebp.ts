
const MAX_DIMENSION = 1920;
const WEBP_QUALITY = 0.82;

const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(
        `Não foi possível carregar a imagem "${file.name}".`
      ));
    };

    image.src = objectUrl;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob || blob.type !== "image/webp") {
          reject(new Error(
            "O navegador não conseguiu gerar a imagem WebP."
          ));
          return;
        }

        resolve(blob);
      },
      "image/webp",
      WEBP_QUALITY
    );
  });
}

export async function convertToWebp(
  file: File
): Promise<File> {
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(
      `Formato de imagem não permitido: ${file.name}`
    );
  }

  const image = await loadImage(file);

  const scale = Math.min(
    1,
    MAX_DIMENSION / Math.max(
      image.naturalWidth,
      image.naturalHeight
    )
  );

  const width = Math.max(
    1,
    Math.round(image.naturalWidth * scale)
  );

  const height = Math.max(
    1,
    Math.round(image.naturalHeight * scale)
  );

  const canvas = document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error(
      "Não foi possível inicializar o conversor de imagens."
    );
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  context.drawImage(image, 0, 0, width, height);

  const blob = await canvasToBlob(canvas);

  // Preserva o original quando ele já é WebP,
  // não precisa de redimensionamento e é menor.
  if (
    file.type === "image/webp" &&
    scale === 1 &&
    blob.size >= file.size
  ) {
    return file;
  }

  const fileName = file.name.replace(
    /\.[^.]+$/,
    ""
  );

  return new File(
    [blob],
    `${fileName}.webp`,
    {
      type: "image/webp",
      lastModified: Date.now(),
    }
  );
}
