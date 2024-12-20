import { Box, Slider, Switch } from "@radix-ui/themes";

interface ThresholdControlsProps {
  threshold: number;
  setThreshold: (value: number) => void;
  belowColor: string;
  setBelowColor: (value: string) => void;
  aboveColor: string;
  setAboveColor: (value: string) => void;
  opacity: number;
  setOpacity: (value: number) => void;
  showThreshold: boolean;
  setShowThreshold: (value: boolean) => void;
  style?: React.CSSProperties;
}

export function ThresholdControls({
  threshold,
  setThreshold,
  belowColor,
  setBelowColor,
  aboveColor,
  setAboveColor,
  opacity,
  setOpacity,
  showThreshold,
  setShowThreshold,
  style,
}: ThresholdControlsProps) {
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
          <label>Threshold:</label>
          <Slider
            defaultValue={[threshold]}
            value={[threshold]}
            onValueChange={(v) => setThreshold(v[0])}
            min={0}
            max={100}
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <label>Show Threshold:</label>
          <Switch checked={showThreshold} onCheckedChange={setShowThreshold} />
        </div>

        {showThreshold && (
          <>
            <div>
              <label>Opacity:</label>
              <Slider
                defaultValue={[opacity]}
                value={[opacity]}
                onValueChange={(v) => setOpacity(v[0])}
                min={0}
                max={100}
                step={1}
              />
            </div>

            <div>
              <label>Below Threshold Color:</label>
              <div style={{ marginTop: "8px" }}>
                <input
                  type="color"
                  value={belowColor}
                  onChange={(e) => setBelowColor(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
            </div>

            <div>
              <label>Above Threshold Color:</label>
              <div style={{ marginTop: "8px" }}>
                <input
                  type="color"
                  value={aboveColor}
                  onChange={(e) => setAboveColor(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </Box>
  );
}
