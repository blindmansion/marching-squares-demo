import { Box, Slider } from "@radix-ui/themes";

interface MarchingSquaresControlsProps {
  gridSize: number;
  setGridSize: (value: number) => void;
  style?: React.CSSProperties;
}

export function MarchingSquaresControls({
  gridSize,
  setGridSize,
  style,
}: MarchingSquaresControlsProps) {
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
          <label>Grid Size:</label>
          <Slider
            defaultValue={[gridSize]}
            value={[gridSize]}
            onValueChange={(v) => setGridSize(v[0])}
            min={10}
            max={100}
            step={5}
          />
        </div>
      </div>
    </Box>
  );
}
