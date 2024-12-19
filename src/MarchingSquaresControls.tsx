import { Box, Slider, Switch } from "@radix-ui/themes";

interface MarchingSquaresControlsProps {
  gridSize: number;
  setGridSize: (value: number) => void;
  showSamplePoints: boolean;
  setShowSamplePoints: (value: boolean) => void;
  showCrossingPoints: boolean;
  setShowCrossingPoints: (value: boolean) => void;
  showLines: boolean;
  setShowLines: (value: boolean) => void;
  style?: React.CSSProperties;
}

export function MarchingSquaresControls({
  gridSize,
  setGridSize,
  showSamplePoints,
  setShowSamplePoints,
  showCrossingPoints,
  setShowCrossingPoints,
  showLines,
  setShowLines,
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
          <label>Sample Grid Size:</label>
          <Slider
            defaultValue={[gridSize]}
            value={[gridSize]}
            onValueChange={(v) => setGridSize(v[0])}
            min={5}
            max={100}
            step={1}
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <label>Show Sample Grid:</label>
          <Switch
            checked={showSamplePoints}
            onCheckedChange={setShowSamplePoints}
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <label>Show Crossing Points:</label>
          <Switch
            checked={showCrossingPoints}
            onCheckedChange={setShowCrossingPoints}
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <label>Show Lines:</label>
          <Switch checked={showLines} onCheckedChange={setShowLines} />
        </div>
      </div>
    </Box>
  );
}
