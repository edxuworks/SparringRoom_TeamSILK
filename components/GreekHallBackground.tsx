/**
 * components/GreekHallBackground.tsx — the white classical-hall backdrop.
 *
 * The marble hall (ref_02) should be clearly visible but never compete with
 * text (see ref_01: arches/columns/sky show through behind the cards). On the
 * landing it sits fairly present; `faded` pushes it back behind content-dense
 * screens. Tune the opacity / overlay numbers below to taste.
 */

export function GreekHallBackground({ faded = false }: { faded?: boolean }) {
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
      {/* Light wash to keep text crisp — much lighter than before so the hall shows */}
      <div className={"absolute inset-0 " + (faded ? "bg-white/60" : "bg-white/30")} />
      {/* Pale sky glow through the central arch */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(220,236,247,0.55),transparent_38%)]" />
      {/* Soft bottom fade so footers/controls stay clean */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent" />
    </div>
  );
}
