import { useEffect, useRef, useState } from "react";
import { Container, Box } from "@radix-ui/themes";
import {
  CanvasInfo,
  drawCrossingPoints,
  drawNoiseGrayscale,
  drawNoiseThreshold,
  drawSamplePoints,
} from "./canvas";
import { FractalControls } from "./FractalControls";
import { ThresholdControls } from "./ThresholdControls";
import { createFractalNoise2D } from "./noise";
import { MarchingSquaresControls } from "./MarchingSquaresControls";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });
  const [threshold, setThreshold] = useState(25);
  const [octaves, setOctaves] = useState(4);
  const [lacunarity, setLacunarity] = useState(2);
  const [persistence, setPersistence] = useState(0.5);
  const [baseScale, setBaseScale] = useState(0.01);
  const [belowColor, setBelowColor] = useState("#000000");
  const [aboveColor, setAboveColor] = useState("#808080");
  const [opacity, setOpacity] = useState(70);
  const [gridSize, setGridSize] = useState(40);

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
    const ctx = ctxRef.current;
    if (!ctx) return;

    const canvasInfo: CanvasInfo = {
      ctx,
      width: dimensions.width,
      height: dimensions.height,
    };

    const fractalNoise2D = createFractalNoise2D({
      params: {
        octaves,
        lacunarity,
        persistence,
        baseScale,
      },
    });

    drawNoiseGrayscale({
      canvasInfo,
      fractalNoise2D,
    });
    drawNoiseThreshold({
      canvasInfo,
      threshold,
      thresholdDrawParams: {
        belowColor,
        aboveColor,
        opacity,
      },
      fractalNoise2D,
    });
    drawSamplePoints({
      canvasInfo,
      gridSize,
      threshold,
      fractalNoise2D,
    });
    drawCrossingPoints({
      canvasInfo,
      gridSize,
      threshold,
      fractalNoise2D,
    });
  }, [
    dimensions,
    threshold,
    octaves,
    lacunarity,
    persistence,
    baseScale,
    belowColor,
    aboveColor,
    opacity,
    gridSize,
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
          <ThresholdControls
            threshold={threshold}
            setThreshold={setThreshold}
            belowColor={belowColor}
            setBelowColor={setBelowColor}
            aboveColor={aboveColor}
            setAboveColor={setAboveColor}
            opacity={opacity}
            setOpacity={setOpacity}
            style={{ flex: 1 }}
          />
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
          <MarchingSquaresControls
            gridSize={gridSize}
            setGridSize={setGridSize}
            style={{ flex: 1 }}
          />
        </div>
      </Box>
    </Container>
  );
}

export default App;
