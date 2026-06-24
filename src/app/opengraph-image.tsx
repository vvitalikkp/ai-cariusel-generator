import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "CarouselAI — Create Viral LinkedIn Carousels with AI";

async function loadFont(weight: 400 | 900) {
  const css = await fetch(`https://fonts.googleapis.com/css2?family=Inter:wght@${weight}`).then((r) => r.text());
  const url = css.match(/src: url\(([^)]+)\)/)?.[1];
  if (!url) throw new Error("font url not found");
  return fetch(url).then((r) => r.arrayBuffer());
}

export default async function OpengraphImage() {
  const [regular, black] = await Promise.all([loadFont(400), loadFont(900)]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #000000 0%, #1a0b2e 55%, #2d1b69 100%)",
          padding: 80,
          position: "relative",
          fontFamily: "Inter",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -120,
            left: -120,
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "rgba(217,70,239,0.25)",
            filter: "blur(80px)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 640 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "#c084fc",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 4,
              textTransform: "uppercase",
              marginBottom: 28,
            }}
          >
            CarouselAI
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 64,
              fontWeight: 900,
              color: "white",
              lineHeight: 1.1,
              letterSpacing: -1,
            }}
          >
            <span>Create Viral</span>
            <span>LinkedIn Carousels</span>
            <span style={{ color: "#e879f9" }}>with AI</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: 280,
              height: 350,
              borderRadius: 28,
              background: "linear-gradient(135deg, #2d1b69 0%, #1a0b2e 100%)",
              border: "1px solid rgba(217,70,239,0.4)",
              padding: 28,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#c084fc", fontWeight: 700, letterSpacing: 3 }}>01 / 06</span>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f472b6" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <span style={{ fontSize: 26, fontWeight: 900, color: "white", lineHeight: 1.15 }}>
                Turn Any Idea Into a Carousel
              </span>
              <span style={{ fontSize: 13, color: "#a78bca", lineHeight: 1.4 }}>
                Paste a tweet, a thought, or an idea. Get 6 polished slides in seconds.
              </span>
            </div>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: 1 }}>
              MADE WITH CAROUSELAI
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter", data: regular, weight: 400, style: "normal" },
        { name: "Inter", data: black, weight: 900, style: "normal" },
      ],
    }
  );
}
