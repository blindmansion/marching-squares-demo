import { useEffect, useRef, useState } from "react";
import { Container, Slider, Box } from "@radix-ui/themes";
import { drawNoiseThreshold } from "./canvas";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });
  const [threshold, setThreshold] = useState(25);
  const [octaves, setOctaves] = useState(4);
  const [lacunarity, setLacunarity] = useState(2);
  const [persistence, setPersistence] = useState(0.5);
  const [baseScale, setBaseScale] = useState(0.01);

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

    drawNoiseThreshold({
      ctx,
      width: dimensions.width,
      height: dimensions.height,
      threshold,
      params: {
        octaves,
        lacunarity,
        persistence,
        baseScale,
      },
    });
  }, [dimensions, threshold, octaves, lacunarity, persistence, baseScale]);

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
          backgroundColor: "var(--gray-1)",
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
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label>Threshold:</label>
            <Slider
              defaultValue={[threshold]}
              value={[threshold]}
              onValueChange={(v) => setThreshold(v[0])}
              min={0}
              max={100}
            />
          </div>
          <div>
            <label>Octaves (1-8):</label>
            <Slider
              defaultValue={[octaves]}
              value={[octaves]}
              onValueChange={(v) => setOctaves(v[0])}
              min={1}
              max={8}
              step={1}
            />
          </div>
          <div>
            <label>Lacunarity (1-4):</label>
            <Slider
              defaultValue={[lacunarity]}
              value={[lacunarity]}
              onValueChange={(v) => setLacunarity(v[0])}
              min={1}
              max={4}
              step={0.1}
            />
          </div>
          <div>
            <label>Persistence (0-1):</label>
            <Slider
              defaultValue={[persistence]}
              value={[persistence]}
              onValueChange={(v) => setPersistence(v[0])}
              min={0}
              max={1}
              step={0.05}
            />
          </div>
          <div>
            <label>Base Scale (0.001-0.05):</label>
            <Slider
              defaultValue={[baseScale]}
              value={[baseScale]}
              onValueChange={(v) => setBaseScale(v[0])}
              min={0.001}
              max={0.05}
              step={0.001}
            />
          </div>
        </div>
      </Box>
    </Container>
  );
}

export default App;
