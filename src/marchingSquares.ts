import { Point } from "./noise";

type SamplePoint = {
  point: Point;
  value: number;
};

export const getSampleGrid = ({
  width,
  height,
  gridSize,
  getNoiseValue,
}: {
  width: number;
  height: number;
  gridSize: number;
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
      };

      currentRow.push(samplePoint);
    }

    grid.push(currentRow);
  }

  return grid;
};

type Edge = {
  samplePoints: [SamplePoint, SamplePoint];
  squares: [Square | null, Square | null];
  point: Point | null;
  visited: boolean;
};

type Square = {
  top: Edge;
  bottom: Edge;
  left: Edge;
  right: Edge;
  isSaddle: boolean;
  saddleConnection: boolean;
};

const calculateEdgePoint = (edge: Edge, threshold: number): Point | null => {
  const [sample1, sample2] = edge.samplePoints;

  // If both samples have the same inside/outside state, no crossing point
  if (sample1.value < threshold === sample2.value < threshold) {
    return null;
  }

  // Calculate interpolation factor
  const t = (threshold - sample1.value) / (sample2.value - sample1.value);

  // Interpolate between the two points
  return {
    x: sample1.point.x + t * (sample2.point.x - sample1.point.x),
    y: sample1.point.y + t * (sample2.point.y - sample1.point.y),
  };
};

// Add this type to help identify square configurations
type SquareConfig = {
  topLeft: number;
  topRight: number;
  bottomLeft: number;
  bottomRight: number;
  threshold: number;
};

// New function to detect and handle saddle points
const isSaddlePoint = (config: SquareConfig): boolean => {
  const { topLeft, topRight, bottomLeft, bottomRight, threshold } = config;

  // Check if we have diagonal matching pairs
  const topLeftInside = topLeft >= threshold;
  const topRightInside = topRight >= threshold;
  const bottomLeftInside = bottomLeft >= threshold;
  const bottomRightInside = bottomRight >= threshold;

  return (
    topLeftInside === bottomRightInside &&
    topRightInside === bottomLeftInside &&
    topLeftInside !== topRightInside
  );
};

// Add this helper function
const getSaddleConnectionType = (config: SquareConfig): boolean => {
  const { topLeft, threshold } = config;

  // Always connect high-to-high values
  // If topLeft is high, connect topLeft to bottomRight
  // If topRight is high, connect topRight to bottomLeft
  return topLeft >= threshold;
};

export const getSquares = (
  sampleGrid: SamplePoint[][],
  threshold: number
): Square[][] => {
  if (sampleGrid.length < 2 || sampleGrid[0].length < 2) {
    return [];
  }

  const rows = sampleGrid.length - 1;
  const cols = sampleGrid[0].length - 1;

  // First create all horizontal edges (top/bottom edges of squares)
  const horizontalEdges: Edge[][] = [];
  for (let row = 0; row <= rows; row++) {
    const edgeRow: Edge[] = [];
    for (let col = 0; col < cols; col++) {
      edgeRow.push({
        samplePoints: [sampleGrid[row][col], sampleGrid[row][col + 1]],
        squares: [null, null], // [top square, bottom square]
        point: null,
        visited: false,
      });
    }
    horizontalEdges.push(edgeRow);
  }

  // Then create all vertical edges (left/right edges of squares)
  const verticalEdges: Edge[][] = [];
  for (let row = 0; row < rows; row++) {
    const edgeRow: Edge[] = [];
    for (let col = 0; col <= cols; col++) {
      edgeRow.push({
        samplePoints: [sampleGrid[row][col], sampleGrid[row + 1][col]],
        squares: [null, null], // [left square, right square]
        point: null,
        visited: false,
      });
    }
    verticalEdges.push(edgeRow);
  }

  // Calculate crossing points for horizontal edges
  for (const row of horizontalEdges) {
    for (const edge of row) {
      edge.point = calculateEdgePoint(edge, threshold);
    }
  }

  // Calculate crossing points for vertical edges
  for (const row of verticalEdges) {
    for (const edge of row) {
      edge.point = calculateEdgePoint(edge, threshold);
    }
  }

  // Create squares using the shared edges
  const squares: Square[][] = [];
  for (let row = 0; row < rows; row++) {
    const squareRow: Square[] = [];
    for (let col = 0; col < cols; col++) {
      const config: SquareConfig = {
        topLeft: sampleGrid[row][col].value,
        topRight: sampleGrid[row][col + 1].value,
        bottomLeft: sampleGrid[row + 1][col].value,
        bottomRight: sampleGrid[row + 1][col + 1].value,
        threshold,
      };

      const square: Square = {
        top: horizontalEdges[row][col],
        bottom: horizontalEdges[row + 1][col],
        left: verticalEdges[row][col],
        right: verticalEdges[row][col + 1],
        isSaddle: isSaddlePoint(config),
        // Replace the old saddleConnection logic with the new one
        saddleConnection: getSaddleConnectionType(config),
      };

      // Update edge references to this square
      square.top.squares[1] = square; // Square is below this edge
      square.bottom.squares[0] = square; // Square is above this edge
      square.left.squares[1] = square; // Square is right of this edge
      square.right.squares[0] = square; // Square is left of this edge

      squareRow.push(square);
    }
    squares.push(squareRow);
  }

  return squares;
};

type Path = {
  points: Point[];
  isClosed: boolean;
};

// Modify findNextEdge to respect saddle point connections
const findNextEdge = (
  square: Square,
  entryEdge: Edge,
  startEdge: Edge
): Edge | null => {
  const edges = [square.top, square.right, square.bottom, square.left].filter(
    (edge) => edge.point !== null && (!edge.visited || edge === startEdge)
  );

  if (square.isSaddle) {
    // Get the position of each edge
    const edgePositions = new Map();
    if (square.top === entryEdge) edgePositions.set(entryEdge, "top");
    if (square.right === entryEdge) edgePositions.set(entryEdge, "right");
    if (square.bottom === entryEdge) edgePositions.set(entryEdge, "bottom");
    if (square.left === entryEdge) edgePositions.set(entryEdge, "left");

    // Filter edges based on valid connections
    return (
      edges.find((edge) => {
        if (edge === entryEdge) return false;

        const pos =
          square.top === edge
            ? "top"
            : square.right === edge
            ? "right"
            : square.bottom === edge
            ? "bottom"
            : "left";

        const entryPos = edgePositions.get(entryEdge);

        if (square.saddleConnection) {
          // Connect topLeft to bottomRight
          return (
            (entryPos === "top" && pos === "right") ||
            (entryPos === "right" && pos === "bottom") ||
            (entryPos === "bottom" && pos === "left") ||
            (entryPos === "left" && pos === "top")
          );
        } else {
          // Connect topRight to bottomLeft
          return (
            (entryPos === "top" && pos === "left") ||
            (entryPos === "left" && pos === "bottom") ||
            (entryPos === "bottom" && pos === "right") ||
            (entryPos === "right" && pos === "top")
          );
        }
      }) || null
    );
  }

  // Non-saddle point case remains the same
  const nextEdges = edges.filter((edge) => edge !== entryEdge);
  return nextEdges.length === 1 ? nextEdges[0] : null;
};

const findStartEdge = (squares: Square[][]): Edge | null => {
  for (const row of squares) {
    for (const square of row) {
      for (const edge of [
        square.top,
        square.right,
        square.bottom,
        square.left,
      ]) {
        if (edge.point && !edge.visited) {
          return edge;
        }
      }
    }
  }
  return null;
};

const getNextSquare = (edge: Edge, currentSquare: Square): Square | null => {
  const [square1, square2] = edge.squares;
  return square1 === currentSquare ? square2 : square1;
};

export const getPaths = (squares: Square[][]): Path[] => {
  const paths: Path[] = [];

  while (true) {
    const startEdge = findStartEdge(squares);
    if (!startEdge) break;

    const path: Path = {
      points: [],
      isClosed: false,
    };

    let currentEdge = startEdge;
    let currentSquare = currentEdge.squares[0] || currentEdge.squares[1];

    if (currentEdge.point) {
      path.points.push(currentEdge.point);
    }

    while (currentEdge && currentSquare) {
      currentEdge.visited = true;

      const nextEdge = findNextEdge(currentSquare, currentEdge, startEdge);

      if (!nextEdge) {
        break;
      }

      if (nextEdge.point) {
        path.points.push(nextEdge.point);
      }

      if (nextEdge === startEdge) {
        path.isClosed = true;
        nextEdge.visited = true;
        break;
      }

      const nextSquare = getNextSquare(nextEdge, currentSquare);
      if (!nextSquare) {
        break;
      }

      currentEdge = nextEdge;
      currentSquare = nextSquare;
    }

    paths.push(path);
  }

  return paths;
};
