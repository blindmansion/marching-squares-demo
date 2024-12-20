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
      const square: Square = {
        top: horizontalEdges[row][col],
        bottom: horizontalEdges[row + 1][col],
        left: verticalEdges[row][col],
        right: verticalEdges[row][col + 1],
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

const findNextEdge = (
  square: Square,
  entryEdge: Edge,
  startEdge: Edge
): Edge | null => {
  // Get all edges with intersection points
  const edges = [square.top, square.right, square.bottom, square.left].filter(
    (edge) => edge.point !== null && (!edge.visited || edge === startEdge)
  );

  // Filter out the entry edge
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
