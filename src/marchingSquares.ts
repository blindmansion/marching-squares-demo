import { Point } from "./noise";

type SamplePoint = {
  point: Point;
  value: number;
  inside: boolean;
};

export const getSampleGrid = ({
  width,
  height,
  gridSize,
  threshold,
  getNoiseValue,
}: {
  width: number;
  height: number;
  gridSize: number;
  threshold: number;
  getNoiseValue: (point: Point) => number;
}): SamplePoint[][] => {
  const cols = Math.ceil(width / gridSize);
  const rows = Math.ceil(height / gridSize);

  // Create 2D array of sample points
  const grid: SamplePoint[][] = [];

  for (let row = 0; row <= rows; row++) {
    const currentRow: SamplePoint[] = [];

    for (let col = 0; col <= cols; col++) {
      const point: Point = {
        x: col * gridSize,
        y: row * gridSize,
      };

      const noiseValue = getNoiseValue(point);

      const samplePoint: SamplePoint = {
        point,
        value: noiseValue,
        inside: noiseValue < threshold,
      };

      currentRow.push(samplePoint);
    }

    grid.push(currentRow);
  }

  return grid;
};

type Crossing = {
  neighbor: Square | null;
  point: Point;
};

type Line = {
  crossings: Crossing[];
  mid?: Point;
};

type Square = {
  samples: {
    topLeft: SamplePoint;
    topRight: SamplePoint;
    bottomLeft: SamplePoint;
    bottomRight: SamplePoint;
  };
  neighbors: {
    top: Square | null;
    bottom: Square | null;
    left: Square | null;
    right: Square | null;
  };
  lines: Line[];
};

export const getSquares = (sampleGrid: SamplePoint[][]): Square[][] => {
  if (sampleGrid.length < 2 || sampleGrid[0].length < 2) {
    return []; // Need at least 2x2 grid to make squares
  }

  const rows = sampleGrid.length - 1; // -1 because we need 4 points per square
  const cols = sampleGrid[0].length - 1;

  // First pass: Create squares
  const squares: Square[][] = [];
  for (let row = 0; row < rows; row++) {
    const squareRow: Square[] = [];

    for (let col = 0; col < cols; col++) {
      const square: Square = {
        samples: {
          topLeft: sampleGrid[row][col],
          topRight: sampleGrid[row][col + 1],
          bottomLeft: sampleGrid[row + 1][col],
          bottomRight: sampleGrid[row + 1][col + 1],
        },
        neighbors: {
          top: null,
          bottom: null,
          left: null,
          right: null,
        },
        lines: [], // Will be populated later
      };

      squareRow.push(square);
    }

    squares.push(squareRow);
  }

  // Second pass: Link neighbors
  for (let row = 0; row < squares.length; row++) {
    for (let col = 0; col < squares[row].length; col++) {
      const square = squares[row][col];

      // Link top neighbor
      if (row > 0) {
        square.neighbors.top = squares[row - 1][col];
      }

      // Link bottom neighbor
      if (row < squares.length - 1) {
        square.neighbors.bottom = squares[row + 1][col];
      }

      // Link left neighbor
      if (col > 0) {
        square.neighbors.left = squares[row][col - 1];
      }

      // Link right neighbor
      if (col < squares[row].length - 1) {
        square.neighbors.right = squares[row][col + 1];
      }
    }
  }

  return squares;
};

export const getCrossingsForSquare = (
  square: Square,
  threshold: number
): Crossing[] => {
  const crossings: Crossing[] = [];
  const { samples } = square;
  const { topLeft, topRight, bottomLeft, bottomRight } = samples;

  // Top edge (left to right)
  const topCrossing = getCrossingFromSamples(
    topLeft,
    topRight,
    square.neighbors.top,
    threshold
  );
  if (topCrossing) crossings.push(topCrossing);

  // Right edge (top to bottom)
  const rightCrossing = getCrossingFromSamples(
    topRight,
    bottomRight,
    square.neighbors.right,
    threshold
  );
  if (rightCrossing) crossings.push(rightCrossing);

  // Bottom edge (right to left)
  const bottomCrossing = getCrossingFromSamples(
    bottomRight,
    bottomLeft,
    square.neighbors.bottom,
    threshold
  );
  if (bottomCrossing) crossings.push(bottomCrossing);

  // Left edge (bottom to top)
  const leftCrossing = getCrossingFromSamples(
    bottomLeft,
    topLeft,
    square.neighbors.left,
    threshold
  );
  if (leftCrossing) crossings.push(leftCrossing);

  return crossings;
};

const getCrossingFromSamples = (
  sample1: SamplePoint,
  sample2: SamplePoint,
  neighbor: Square | null,
  threshold: number
): Crossing | null => {
  // If both samples have the same inside/outside state, no crossing
  if (sample1.inside === sample2.inside) {
    return null;
  }

  // Ensure we're interpolating from outside to inside
  const [outsideSample, insideSample] = sample1.inside
    ? [sample2, sample1]
    : [sample1, sample2];

  // Protect against division by zero
  if (insideSample.value === outsideSample.value) {
    // If values are equal but inside states differ (shouldn't happen with proper threshold),
    // return midpoint as fallback
    return {
      point: {
        x: (insideSample.point.x + outsideSample.point.x) / 2,
        y: (insideSample.point.y + outsideSample.point.y) / 2,
      },
      neighbor,
    };
  }

  // Calculate interpolation factor
  let t =
    (threshold - outsideSample.value) /
    (insideSample.value - outsideSample.value);

  // Clamp t to [0,1] for safety
  t = Math.max(0, Math.min(1, t));

  const crossingPoint = {
    x:
      outsideSample.point.x +
      t * (insideSample.point.x - outsideSample.point.x),
    y:
      outsideSample.point.y +
      t * (insideSample.point.y - outsideSample.point.y),
  };

  return {
    point: crossingPoint,
    neighbor,
  };
};
