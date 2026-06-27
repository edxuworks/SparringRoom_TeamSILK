/**
 * components/GreekHallBackground.tsx — the classical-hall backdrop.
 *
 * Cloud (light): subtle white marble hall photo + sky glow.
 * Local (dark):  PURE BLACK with the hall drawn as neon-green LINE ART
 *                (columns + arches blueprint) — a "sovereign / secure terminal"
 *                feel. Texture only — never competes with text.
 */

export function GreekHallBackground({
  faded = false,
  dark = false,
}: {
  faded?: boolean;
  dark?: boolean;
}) {
  if (dark) {
    // Local / Sovereign mode: plain black background.
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-black"
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        className={
          "absolute inset-0 bg-cover bg-center " +
          (faded ? "opacity-[0.28]" : "opacity-[0.6]")
        }
        style={{
          backgroundImage: "url('/images/greek-hall-white.png')",
          filter: "saturate(0.8) contrast(0.95)",
        }}
      />
      <div className={"absolute inset-0 " + (faded ? "bg-white/60" : "bg-white/30")} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(220,236,247,0.55),transparent_38%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent" />
    </div>
  );
}
