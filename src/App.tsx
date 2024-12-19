import { useEffect, useRef, useState } from "react";
import { Container, Box } from "@radix-ui/themes";
import { drawNoiseGrayscale, drawNoiseThreshold } from "./canvas";
import { FractalControls } from "./FractalControls";
import { ThresholdControls } from "./ThresholdControls";

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

    drawNoiseGrayscale({
      ctx,
      width: dimensions.width,
      height: dimensions.height,
      params: {
        octaves,
        lacunarity,
        persistence,
        baseScale,
      },
    });
    drawNoiseThreshold({
      ctx,
      width: dimensions.width,
      height: dimensions.height,
      threshold,
      belowColor,
      aboveColor,
      opacity,
      params: {
        octaves,
        lacunarity,
        persistence,
        baseScale,
      },
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
        </div>
      </Box>
    </Container>
  );
}

export default App;
