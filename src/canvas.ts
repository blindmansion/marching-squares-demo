import { createFractalNoise2D, FractalNoiseParams } from "./noise";

// Helper function to convert hex color to RGB values
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};

export const drawNoiseThreshold = ({
  ctx,
  width,
  height,
  threshold,
  belowColor,
  aboveColor,
  opacity,
  params,
}: {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  threshold: number;
  belowColor: string;
  aboveColor: string;
  opacity: number;
  params: FractalNoiseParams;
}) => {
  // Create a temporary canvas for the threshold layer
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext("2d")!;

  const imageData = tempCtx.createImageData(width, height);
  const data = imageData.data;

  const below = hexToRgb(belowColor);
  const above = hexToRgb(aboveColor);

  const fractalNoise2D = createFractalNoise2D({
    params,
  });

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const value = fractalNoise2D({ x, y });
      const normalized = ((value + 1) / 2) * 100;

      const idx = (y * width + x) * 4;

      if (normalized < threshold) {
        data[idx] = below.r;
        data[idx + 1] = below.g;
        data[idx + 2] = below.b;
        data[idx + 3] = 255;
      } else {
        data[idx] = above.r;
        data[idx + 1] = above.g;
        data[idx + 2] = above.b;
        data[idx + 3] = 255;
      }
    }
  }

  // Draw to temporary canvas first
  tempCtx.putImageData(imageData, 0, 0);

  // Now draw the temporary canvas onto the main canvas with globalAlpha
  ctx.save();
  ctx.globalAlpha = opacity / 100; // Convert percentage to decimal
  ctx.drawImage(tempCanvas, 0, 0);
  ctx.restore();
};

export const drawNoiseGrayscale = ({
  ctx,
  width,
  height,
  params,
}: {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  params: FractalNoiseParams;
}) => {
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  const fractalNoise2D = createFractalNoise2D({
    params,
  });

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const value = fractalNoise2D({ x, y });
      // Normalize from [-1, 1] to [0, 255] for grayscale
      const gray = Math.floor(((value + 1) / 2) * 255);

      const idx = (y * width + x) * 4;
      // Set R, G, and B to the same value for grayscale
      data[idx] = gray;
      data[idx + 1] = gray;
      data[idx + 2] = gray;
      data[idx + 3] = 255; // Full opacity
    }
  }

  ctx.putImageData(imageData, 0, 0);
};
