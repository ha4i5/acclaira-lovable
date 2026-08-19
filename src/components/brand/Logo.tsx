import markAsset from "@/assets/acclaira-mark.png.asset.json";
import wordmarkDark from "@/assets/acclaira-wordmark-dark.png.asset.json";
import wordmarkLight from "@/assets/acclaira-wordmark-light.png.asset.json";

type LogoMarkProps = { size?: number; className?: string; light?: boolean };

export function LogoMark({ size = 32, className, light = false }: LogoMarkProps) {
  return (
    <img
      src={markAsset.url}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      className={className}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        filter: light ? "brightness(0) invert(1)" : undefined,
      }}
    />
  );
}


export function Logo({ dark = false, size = 30 }: { dark?: boolean; size?: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark size={size} />
      <img
        src={dark ? wordmarkLight.url : wordmarkDark.url}
        alt="Acclaira"
        style={{ height: size * 0.6 }}
        className="w-auto object-contain"
      />
    </span>
  );
}
