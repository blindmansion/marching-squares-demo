import { createNoise2D } from "simplex-noise";

export type Point = {
  x: number;
  y: number;
};

export type FractalNoiseParams = {
  octaves: number;
  lacunarity: number;
  persistence: number;
  baseScale: number;
};

const noise2D = createNoise2D();

const getFractalNoise = ({
  point,
  params,
}: {
  point: Point;
  params: FractalNoiseParams;
}) => {
  let amplitude = 1;
  let frequency = 1;
  let noiseValue = 0;
  let amplitudeSum = 0;

  for (let i = 0; i < params.octaves; i++) {
    noiseValue +=
      amplitude *
      noise2D(
        point.x * params.baseScale * frequency,
        point.y * params.baseScale * frequency
      );
    amplitudeSum += amplitude;
    amplitude *= params.persistence;
    frequency *= params.lacunarity;
  }

  return noiseValue / amplitudeSum;
};

// Creates a fractal noise 2D function
export const createFractalNoise2D = ({
  params,
}: {
  params: FractalNoiseParams;
}) => {
  return (point: Point) => {
    return getFractalNoise({
      point,
      params,
    });
  };
};
