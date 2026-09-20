import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Aspire Classes — Your next chapter starts with practice.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function SocialImage() {
  const logo = await readFile(join(process.cwd(), "public", "aspire.png"));
  return new ImageResponse(
    <div
      style={{
        background: "#f8fbfe",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "58px 80px",
        color: "#16355b",
      }}
    >
      <div style={{ display: "flex", height: 125, position: "relative" }}>
        {/* The OG renderer embeds the original asset directly; no browser image optimization applies. */}
        <img
          src={`data:image/png;base64,${logo.toString("base64")}`}
          alt="Aspire Classes"
          width={300}
          height={300}
          style={{ position: "absolute", left: -65, top: -91 }}
        />
      </div>
      <div
        style={{
          fontSize: 76,
          display: "flex",
          marginTop: 35,
          fontWeight: 700,
          lineHeight: 1.1,
        }}
      >
        Your next chapter starts with practice.
      </div>
      <div
        style={{
          fontSize: 28,
          display: "flex",
          marginTop: 32,
          color: "#087da5",
        }}
      >
        AMU Class 9 & 11 · Entrance test series
      </div>
      <div
        style={{
          display: "flex",
          width: 120,
          height: 8,
          background: "#0797c1",
          marginTop: 35,
          borderRadius: 4,
        }}
      />
    </div>,
    size,
  );
}
