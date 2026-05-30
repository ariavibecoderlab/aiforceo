import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Boardroom AI — Your AI C-Suite";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0E1726",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "#C5A572",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 700,
              color: "#0E1726",
            }}
          >
            B
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#ffffff",
              display: "flex",
              gap: 12,
            }}
          >
            <span>Boardroom</span>
            <span style={{ color: "#C5A572" }}>AI</span>
          </div>
        </div>
        <div
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.55)",
            marginTop: 8,
            letterSpacing: "-0.3px",
          }}
        >
          The AI C-Suite for every business owner
        </div>
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 24,
          }}
        >
          {["CEO", "CFO", "CMO", "COO", "CTO", "Chief of Staff"].map((role) => (
            <div
              key={role}
              style={{
                background: "rgba(197,165,114,0.12)",
                border: "1px solid rgba(197,165,114,0.3)",
                borderRadius: 8,
                padding: "6px 14px",
                fontSize: 14,
                fontWeight: 600,
                color: "#C5A572",
              }}
            >
              {role}
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
