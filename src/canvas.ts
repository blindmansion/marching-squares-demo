import { createFractalNoise2D, FractalNoiseParams } from "./noise";

export const drawToCanvas = ({
  ctx,
  width,
  height,
  threshold,
  params,
}: {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  threshold: number;
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
      const normalized = ((value + 1) / 2) * 100;

      const idx = (y * width + x) * 4;

      if (normalized < threshold) {
        data[idx] = 0;
        data[idx + 1] = 0;
        data[idx + 2] = 255;
        data[idx + 3] = 255;
      } else {
        data[idx] = 255;
        data[idx + 1] = 0;
        data[idx + 2] = 0;
        data[idx + 3] = 255;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
};

export const drawNoiseThreshold = ({
  ctx,
  width,
  height,
  threshold,
  params,
}: {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  threshold: number;
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
      const normalized = ((value + 1) / 2) * 100;

      const idx = (y * width + x) * 4;

      if (normalized < threshold) {
        data[idx] = 0;
        data[idx + 1] = 0;
        data[idx + 2] = 255;
        data[idx + 3] = 255;
      } else {
        data[idx] = 255;
        data[idx + 1] = 0;
        data[idx + 2] = 0;
        data[idx + 3] = 255;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
};
