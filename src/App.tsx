import { useEffect, useRef, useState } from "react";
import { Container, Slider } from "@radix-ui/themes";
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
    const canvas = canvasRef.current;
    if (!canvas) return;

    ctxRef.current = canvas.getContext("2d");
    setDimensions({ width: canvas.width, height: canvas.height });
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
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        style={{
          border: "1px solid black",
          marginBottom: "20px",
          display: "block",
        }}
      />
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
    </Container>
  );
}

export default App;
