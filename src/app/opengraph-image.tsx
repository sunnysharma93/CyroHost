import { ImageResponse } from "next/og";

export const alt = "CyroHost — cloud, network, edge, and web infrastructure";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#ffffff",
          color: "#252525",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", fontSize: 24, letterSpacing: 4, color: "#5c656d" }}>
          CLOUD · NETWORK · EDGE · WEB
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 68, lineHeight: 1.05, letterSpacing: -1.5 }}>Infrastructure built for what is next.</div>
          <div style={{ fontSize: 28, color: "#5c656d" }}>CyroHost</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
