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
  const [showLines, setShowLines] = useState(false);
  const [showPaths, setShowPaths] = useState(false);
  const [noiseMatrix, setNoiseMatrix] = useState<number[][]>([]);
  const [lineColor, setLineColor] = useState("#00FF00");

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

    // Calculate noise values for each pixel
    const newNoiseMatrix: number[][] = [];
    for (let y = 0; y < dimensions.height; y++) {
      const row: number[] = [];
      for (let x = 0; x < dimensions.width; x++) {
        row.push(fractalNoise2D({ x, y }));
      }
      newNoiseMatrix.push(row);
    }
    setNoiseMatrix(newNoiseMatrix);
  }, [dimensions, octaves, lacunarity, persistence, baseScale]);

  // Move getCachedNoise into useCallback
  const getCachedNoise = useCallback(
    (point: Point) => {
      const xi = Math.floor(point.x);
      const yi = Math.floor(point.y);
      return noiseMatrix[yi]?.[xi] ?? 0;
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
    showLines,
    showPaths,
    getCachedNoise,
    lineColor,
  ]);

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
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              margin: 0,
              padding: 0,
              boxSizing: "border-box",
              objectFit: "contain",
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
            showLines={showLines}
            setShowLines={setShowLines}
            showPaths={showPaths}
            setShowPaths={setShowPaths}
            lineColor={lineColor}
            setLineColor={setLineColor}
            style={{ flex: 1 }}
          />
        </div>
      </Box>
    </Container>
  );
}

export default App;
