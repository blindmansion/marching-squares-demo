import { getSampleGrid, getSquares, getPaths } from "./marchingSquares";
import { Point } from "./noise";

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

export type ThresholdDrawParams = {
  belowColor: string;
  aboveColor: string;
  opacity: number;
};

export type CanvasInfo = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
};

export const drawNoiseThreshold = ({
  canvasInfo,
  threshold,
  thresholdDrawParams,
  fractalNoise2D,
}: {
  canvasInfo: CanvasInfo;
  threshold: number;
  fractalNoise2D: (point: Point) => number;
  thresholdDrawParams: ThresholdDrawParams;
}) => {
  // Create a temporary canvas for the threshold layer
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = canvasInfo.width;
  tempCanvas.height = canvasInfo.height;
  const tempCtx = tempCanvas.getContext("2d")!;

  const imageData = tempCtx.createImageData(
    canvasInfo.width,
    canvasInfo.height
  );
  const data = imageData.data;

  const below = hexToRgb(thresholdDrawParams.belowColor);
  const above = hexToRgb(thresholdDrawParams.aboveColor);

  for (let x = 0; x < canvasInfo.width; x++) {
    for (let y = 0; y < canvasInfo.height; y++) {
      const value = fractalNoise2D({ x, y });
      const normalized = ((value + 1) / 2) * 100;

      const idx = (y * canvasInfo.width + x) * 4;

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
  canvasInfo.ctx.save();
  canvasInfo.ctx.globalAlpha = thresholdDrawParams.opacity / 100; // Convert percentage to decimal
  canvasInfo.ctx.drawImage(tempCanvas, 0, 0);
  canvasInfo.ctx.restore();
};

export const drawNoiseGrayscale = ({
  canvasInfo,
  fractalNoise2D,
}: {
  canvasInfo: CanvasInfo;
  fractalNoise2D: (point: Point) => number;
}) => {
  const imageData = canvasInfo.ctx.createImageData(
    canvasInfo.width,
    canvasInfo.height
  );
  const data = imageData.data;

  for (let x = 0; x < canvasInfo.width; x++) {
    for (let y = 0; y < canvasInfo.height; y++) {
      const value = fractalNoise2D({ x, y });
      // Normalize from [-1, 1] to [0, 255] for grayscale
      const gray = Math.floor(((value + 1) / 2) * 255);

      const idx = (y * canvasInfo.width + x) * 4;
      // Set R, G, and B to the same value for grayscale
      data[idx] = gray;
      data[idx + 1] = gray;
      data[idx + 2] = gray;
      data[idx + 3] = 255; // Full opacity
    }
  }

  canvasInfo.ctx.putImageData(imageData, 0, 0);
};

export const drawMarchingSquaresResult = ({
  canvasInfo,
  gridSize,
  threshold,
  showPoints,
  showPaths,
  showGrid,
  fractalNoise2D,
}: {
  canvasInfo: CanvasInfo;
  gridSize: number;
  threshold: number;
  showPoints: boolean;
  showPaths: boolean;
  showGrid: boolean;
  fractalNoise2D: (point: Point) => number;
}) => {
  const grid = getSampleGrid({
    width: canvasInfo.width,
    height: canvasInfo.height,
    gridSize,
    getNoiseValue: (point) => {
      const value = fractalNoise2D(point);
      return ((value + 1) / 2) * 100;
    },
  });

  // Save context state at the beginning
  canvasInfo.ctx.save();

  if (showGrid) {
    // Draw grid points
    const pointRadius = 4;
    canvasInfo.ctx.lineWidth = 2;

    grid.forEach((row) => {
      row.forEach((sample) => {
        canvasInfo.ctx.beginPath();
        canvasInfo.ctx.arc(
          sample.point.x,
          sample.point.y,
          pointRadius,
          0,
          Math.PI * 2
        );
        canvasInfo.ctx.fillStyle =
          sample.value > threshold ? "#ffffff" : "#000000";
        canvasInfo.ctx.strokeStyle = "#666666";
        canvasInfo.ctx.fill();
        canvasInfo.ctx.stroke();
      });
    });
  }

  const squares = getSquares(grid, threshold);
  const flattenedSquares = squares.flat();

  if (showPoints) {
    // Draw all edge intersection points
    canvasInfo.ctx.fillStyle = "#00FF00";

    flattenedSquares.forEach((square) => {
      // Check each edge of the square
      [square.top, square.right, square.bottom, square.left].forEach((edge) => {
        if (edge.point) {
          canvasInfo.ctx.beginPath();
          canvasInfo.ctx.arc(edge.point.x, edge.point.y, 4, 0, Math.PI * 2);
          canvasInfo.ctx.fill();
        }
      });
    });
  }

  if (showPaths) {
    // Get all paths from our marching squares implementation
    const paths = getPaths(squares);

    paths.forEach((path) => {
      // Generate a random color for this path
      // const color = `hsl(${Math.random() * 360}, 70%, 50%)`;
      const color = path.isClosed ? "#00FF00" : "#FF0000";

      canvasInfo.ctx.beginPath();
      canvasInfo.ctx.strokeStyle = color;
      canvasInfo.ctx.lineWidth = 2;

      // Move to the first point
      if (path.points.length > 0) {
        canvasInfo.ctx.moveTo(path.points[0].x, path.points[0].y);

        // Draw lines to subsequent points
        for (let i = 1; i < path.points.length; i++) {
          canvasInfo.ctx.lineTo(path.points[i].x, path.points[i].y);
        }

        // If the path is closed, connect back to the start
        if (path.isClosed) {
          canvasInfo.ctx.lineTo(path.points[0].x, path.points[0].y);
        }
      }

      canvasInfo.ctx.stroke();
    });
  }

  // Restore context state at the end
  canvasInfo.ctx.restore();
};
