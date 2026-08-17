import { useEffect, useRef } from "react";

export type Ratio = "1:1" | "16:9" | "9:16";

const SIZES: Record<Ratio, { w: number; h: number }> = {
  "1:1": { w: 1080, h: 1080 },
  "16:9": { w: 1280, h: 720 },
  "9:16": { w: 1080, h: 1920 },
};

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function ThumbnailCanvas({
  ratio,
  title,
  subtitle,
  handle,
  accent,
}: {
  ratio: Ratio;
  title: string;
  subtitle: string;
  handle: string;
  accent: string;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const { w, h } = SIZES[ratio];
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#14102E");
    grad.addColorStop(1, "#43318F");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.18;
    ctx.beginPath();
    ctx.arc(w * 0.85, h * 0.15, Math.min(w, h) * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    const pad = w * 0.07;
    const titleSize = ratio === "9:16" ? w * 0.095 : w * 0.075;
    ctx.font = `800 ${titleSize}px 'DM Sans', system-ui, sans-serif`;
    ctx.fillStyle = "#FFFFFF";
    ctx.textBaseline = "top";

    const lines = wrap(ctx, (title || "YOUR HEADLINE HERE").toUpperCase(), w - pad * 2).slice(0, 4);
    const blockH = lines.length * titleSize * 1.15;
    let y = h - pad - blockH - (subtitle ? titleSize * 1.4 : 0) - h * 0.06;

    ctx.fillStyle = accent;
    ctx.fillRect(pad, y - titleSize * 0.55, w * 0.14, titleSize * 0.14);

    ctx.fillStyle = "#FFFFFF";
    for (const l of lines) {
      ctx.fillText(l, pad, y);
      y += titleSize * 1.15;
    }

    if (subtitle) {
      ctx.font = `500 ${titleSize * 0.42}px 'DM Sans', system-ui, sans-serif`;
      ctx.fillStyle = "rgba(255,255,255,0.78)";
      const subLines = wrap(ctx, subtitle, w - pad * 2).slice(0, 2);
      for (const l of subLines) {
        ctx.fillText(l, pad, y + titleSize * 0.25);
        y += titleSize * 0.55;
      }
    }

    ctx.font = `700 ${titleSize * 0.34}px 'DM Sans', system-ui, sans-serif`;
    ctx.fillStyle = accent;
    ctx.fillText(handle || "@acclaira", pad, pad);
  }, [ratio, title, subtitle, handle, accent]);

  function download() {
    const canvas = ref.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `acclaira-${ratio.replace(":", "x")}.png`;
    a.click();
  }

  return (
    <div className="space-y-2">
      <canvas
        ref={ref}
        className="w-full rounded-xl border border-border"
        style={{ aspectRatio: ratio.replace(":", " / ") }}
      />
      <button
        type="button"
        onClick={download}
        className="w-full rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
      >
        Download {ratio}
      </button>
    </div>
  );
}
