import { Slider, Box } from "@radix-ui/themes";

interface FractalControlsProps {
  octaves: number;
  setOctaves: (value: number) => void;
  lacunarity: number;
  setLacunarity: (value: number) => void;
  persistence: number;
  setPersistence: (value: number) => void;
  baseScale: number;
  setBaseScale: (value: number) => void;
  style?: React.CSSProperties;
}

export function FractalControls({
  octaves,
  setOctaves,
  lacunarity,
  setLacunarity,
  persistence,
  setPersistence,
  baseScale,
  setBaseScale,
  style,
}: FractalControlsProps) {
  return (
    <Box
      style={{
        padding: "24px",
        borderRadius: "12px",
        backgroundColor: "var(--gray-4)",
        ...style,
      }}
      className="rt-BoxShadow"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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
          <label>Base Scale (0.001-0.01):</label>
          <Slider
            defaultValue={[baseScale]}
            value={[baseScale]}
            onValueChange={(v) => setBaseScale(v[0])}
            min={0.0001}
            max={1}
            step={0.001}
          />
        </div>
      </div>
    </Box>
  );
}
