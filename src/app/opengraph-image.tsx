import { ImageResponse } from "next/og";

export const alt = "NUTM Nexus — course materials, past papers & quizzes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand tokens (mirrors globals.css): dark slate background + NUTM green.
const BG = "#1B1F24";
const GREEN = "#12A16C";
const FG = "#F2F5F8";
const MUTED = "#8A9199";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: BG,
        }}
      >
        {/* Left accent bar */}
        <div style={{ width: 16, height: "100%", backgroundColor: GREEN }} />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "72px 80px",
          }}
        >
          {/* Wordmark */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
            <div style={{ fontSize: 40, fontWeight: 800, color: FG, letterSpacing: -1 }}>
              NUTM
            </div>
            <div style={{ fontSize: 40, fontWeight: 800, color: GREEN, letterSpacing: 4 }}>
              NEXUS
            </div>
          </div>

          {/* Headline */}
          <div
            style={{
              display: "flex",
              fontSize: 68,
              fontWeight: 800,
              color: FG,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 900,
            }}
          >
            Course materials, past papers &amp; quizzes.
          </div>

          {/* Footer */}
          <div style={{ display: "flex", fontSize: 28, color: MUTED }}>
            Peer-2-Peer Tutorial · nutm.edu.ng
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
