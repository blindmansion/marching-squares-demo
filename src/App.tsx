import { useEffect, useRef, useState, useCallback } from "react";
import { Container, Box } from "@radix-ui/themes";
import {
  CanvasInfo,
  drawMarchingSquaresResult,
  drawNoiseGrayscale,
  drawNoiseThreshold,
} from "./canvas";
import { FractalControls } from "./FractalControls";
import { ThresholdControls } from "./ThresholdControls";
import { createFractalNoise2D, Point } from "./noise";
import { MarchingSquaresControls } from "./MarchingSquaresControls";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });
  const [threshold, setThreshold] = useState(25);
  const [octaves, setOctaves] = useState(4);
  const [lacunarity, setLacunarity] = useState(2);
  const [persistence, setPersistence] = useState(0.5);
  const [baseScale, setBaseScale] = useState(0.005);
  const [belowColor, setBelowColor] = useState("#000000");
  const [aboveColor, setAboveColor] = useState("#808080");
  const [opacity, setOpacity] = useState(70);
  const [gridSize, setGridSize] = useState(40);
  const [showThreshold, setShowThreshold] = useState(false);
  const [showSamplePoints, setShowSamplePoints] = useState(false);
  const [showCrossingPoints, setShowCrossingPoints] = useState(false);
  const [showPaths, setShowPaths] = useState(false);
  const [noiseMatrix, setNoiseMatrix] = useState<number[][]>([]);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      const margin = 500;
      const maxWidth = window.innerWidth - margin;
      const maxHeight = window.innerHeight - margin;

      if (canvasRef.current) {
        canvasRef.current.width = maxWidth;
        canvasRef.current.height = maxHeight;
        setDimensions({ width: maxWidth, height: maxHeight });

        // Initialize the context whenever canvas dimensions change
        ctxRef.current = canvasRef.current.getContext("2d");
      }
    };

    // Initial size
    updateDimensions();

    // Add resize listener
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return;

    const fractalNoise2D = createFractalNoise2D({
      params: {
        octaves,
        lacunarity,
        persistence,
        baseScale,
      },
    });

    // Calculate noise values for each pixel, accounting for offset
    const newNoiseMatrix: number[][] = [];
    for (let y = 0; y < dimensions.height; y++) {
      const row: number[] = [];
      for (let x = 0; x < dimensions.width; x++) {
        // Include offset in the noise input coordinates
        const noisePoint = {
          x: (x + offset.x) * baseScale,
          y: (y + offset.y) * baseScale,
        };
        row.push(fractalNoise2D(noisePoint));
      }
      newNoiseMatrix.push(row);
    }
    setNoiseMatrix(newNoiseMatrix);
  }, [dimensions, octaves, lacunarity, persistence, baseScale, offset]);

  // Simplify getCachedNoise since we don't need to wrap coordinates anymore
  const getCachedNoise = useCallback(
    (point: Point) => {
      const x = Math.floor(point.x);
      const y = Math.floor(point.y);
      return noiseMatrix[y]?.[x] ?? 0;
    },
    [noiseMatrix]
  );

  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx || noiseMatrix.length === 0) return;

    const canvasInfo: CanvasInfo = {
      ctx,
      width: dimensions.width,
      height: dimensions.height,
    };

    drawNoiseGrayscale({
      canvasInfo,
      fractalNoise2D: getCachedNoise,
    });
    if (showThreshold) {
      drawNoiseThreshold({
        canvasInfo,
        threshold,
        thresholdDrawParams: {
          belowColor,
          aboveColor,
          opacity,
        },
        fractalNoise2D: getCachedNoise,
      });
    }
    drawMarchingSquaresResult({
      canvasInfo,
      gridSize,
      threshold,
      fractalNoise2D: getCachedNoise,
      showPoints: showCrossingPoints,
      showPaths,
      showGrid: showSamplePoints,
    });
  }, [
    noiseMatrix,
    dimensions,
    threshold,
    belowColor,
    aboveColor,
    opacity,
    gridSize,
    showThreshold,
    showSamplePoints,
    showCrossingPoints,
    showPaths,
    getCachedNoise,
  ]);

  // Add mouse event handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      setIsDragging(true);
      setLastMousePos({
        x: e.clientX,
        y: e.clientY,
      });
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDragging) return;

      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;

      setOffset((prev) => ({
        x: prev.x - deltaX,
        y: prev.y - deltaY,
      }));

      setLastMousePos({
        x: e.clientX,
        y: e.clientY,
      });
    },
    [isDragging, lastMousePos]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <Container
      style={{
        backgroundColor: "var(--gray-2)",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <Box
        style={{
          padding: "24px",
          borderRadius: "12px",
          backgroundColor: "var(--gray-3)",
        }}
        className="rt-BoxShadow"
      >
        <Box
          style={{
            padding: 0,
            marginBottom: "24px",
            borderRadius: "8px",
            backgroundColor: "white",
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            maxHeight: "70vh",
          }}
          className="rt-BoxShadow"
        >
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              margin: 0,
              padding: 0,
              boxSizing: "border-box",
              objectFit: "contain",
              cursor: isDragging ? "grabbing" : "grab",
            }}
          />
        </Box>
        <div
          style={{
            display: "flex",
            gap: "24px",
            width: "100%",
          }}
        >
          <FractalControls
            octaves={octaves}
            setOctaves={setOctaves}
            lacunarity={lacunarity}
            setLacunarity={setLacunarity}
            persistence={persistence}
            setPersistence={setPersistence}
            baseScale={baseScale}
            setBaseScale={setBaseScale}
            style={{ flex: 1 }}
          />
          <ThresholdControls
            threshold={threshold}
            setThreshold={setThreshold}
            belowColor={belowColor}
            setBelowColor={setBelowColor}
            aboveColor={aboveColor}
            setAboveColor={setAboveColor}
            opacity={opacity}
            setOpacity={setOpacity}
            showThreshold={showThreshold}
            setShowThreshold={setShowThreshold}
            style={{ flex: 1 }}
          />

          <MarchingSquaresControls
            gridSize={gridSize}
            setGridSize={setGridSize}
            showSamplePoints={showSamplePoints}
            setShowSamplePoints={setShowSamplePoints}
            showCrossingPoints={showCrossingPoints}
            setShowCrossingPoints={setShowCrossingPoints}
            showPaths={showPaths}
            setShowPaths={setShowPaths}
            style={{ flex: 1 }}
          />
        </div>
      </Box>
    </Container>
  );
}

export default App;
