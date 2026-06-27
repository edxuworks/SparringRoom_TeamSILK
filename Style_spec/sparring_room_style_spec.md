# The Sparring Room - Visual Style Specification for Claude Code

## 0. Purpose

This is the visual handoff for **The Sparring Room**, a voice-first legal training app. The selected direction is:

> **Professional legal-tech interface over a very subtle, almost white, classical Greek architectural background.**

The UI should feel calm, premium, and clear. Greek/Socratic references should be present as atmosphere, not as decoration that competes with product content.

Use the included visual reference as the north star:

- `references/ref_01_selected_role_select.png` - selected role-selection direction
- `references/ref_02_white_arch_background.png` - architectural background texture direction
- `references/ref_03_flow_visual_context.png` - app-flow visual context
- `references/ref_04_source_wireframe.pdf` - original flow sketch

---

## 1. Product framing

### Core idea
A lawyer practises legal reasoning, negotiation, and judgment through Socratic sparring. The app has two entry paths:

1. **Junior Lawyer** - enter a training arena, pick a case, pick an opponent, argue by voice, receive scored feedback.
2. **Admin / Senior Lawyer** - upload playbooks or legal documents, generate training scenarios, test them, and make amendments in natural language.

### UX priority
The app must not look like a game first. It should look like a professional training product with a subtle gamified layer.

Good keywords:

- calm
- precise
- legal
- premium
- Socratic
- disciplined
- institutional
- lightly gamified
- readable

Avoid:

- cartoon Socrates
- large character art
- boxing/sports motifs
- busy Greek ornament
- pixelated typography for real UI text
- off-white parchment fantasy UI
- too much gold
- too much navy
- excessive panels or decorative borders

---

## 2. Overall visual direction

### Selected direction
A **high-key white classical hall** with pale grey columns and arches, barely visible in the background. On top: modern, legible, dark role-selection cards with subtle gold icon accents.

### Background role
The background is **texture**, not content. It should create atmosphere but never compete with text or controls.

Background treatment:

- Pure white majority.
- Very low-contrast architectural linework.
- Pale grey marble / stone geometry.
- Very faint pale sky blue visible through the central arch.
- No people in the main role-select background.
- If small philosophers appear later, they should be distant silhouettes only, never the focal point.
- Classical arches/columns can be pixel-art inspired, but softened and low opacity.

### UI foreground role
The foreground UI should be clean, modern, and highly legible.

- Buttons are **not pixel-edged**.
- Typography is **not pixel font**.
- Cards/buttons use modern radius, shadow, and hierarchy.
- Icons may reference Greek/legal symbols, but should be simple line icons.

---

## 3. Colour system

### Palette
Use this as the core design token set.

```css
:root {
  /* Base surfaces */
  --color-white: #ffffff;
  --color-surface: #ffffff;
  --color-surface-soft: #f8fafc;
  --color-surface-glass: rgba(255, 255, 255, 0.72);

  /* Text */
  --color-text-primary: #111827;
  --color-text-secondary: #4b5563;
  --color-text-muted: #7b8492;

  /* Dark primary UI */
  --color-ink: #111827;
  --color-ink-soft: #1f2937;
  --color-ink-hover: #273244;

  /* Greek / institutional accent */
  --color-gold: #c7a45a;
  --color-gold-soft: #dcc68e;
  --color-gold-muted: #b89955;

  /* Pale sky accent */
  --color-sky-pale: #dcecf7;
  --color-sky-soft: #edf7ff;

  /* Lines and borders */
  --color-border: #e5e7eb;
  --color-border-strong: #d1d5db;
  --color-stone-line: #cfd4dc;

  /* Shadows */
  --shadow-card: 0 16px 40px rgba(17, 24, 39, 0.14);
  --shadow-soft: 0 8px 24px rgba(17, 24, 39, 0.08);
}
```

### Ratio guidance
Approximate visual balance:

- **80-88% white / very pale grey**
- **8-12% dark graphite/navy UI**
- **2-5% muted gold accents**
- **0-3% pale sky blue**

Gold should highlight icons, dividers, and active states only. It should not become the main brand colour.

---

## 4. Typography

### Principle
Use professional, readable web fonts. The app should feel like a polished legal-tech product, not retro arcade UI.

### Recommended stack

```css
--font-heading: "Cormorant Garamond", "Playfair Display", Georgia, serif;
--font-body: "Inter", "Geist", "Helvetica Neue", Arial, sans-serif;
--font-mono: "IBM Plex Mono", "SFMono-Regular", monospace;
```

### Usage

| Element | Font | Weight | Notes |
|---|---|---:|---|
| Hero title | Heading serif | 500-600 | Elegant, not overly decorative. |
| Subtitle | Body sans | 400 | Clear and neutral. |
| Button title | Body sans | 650-700 | Strong hierarchy. |
| Button description | Body sans | 400 | Short, calm, readable. |
| App dashboard labels | Body sans | 500-600 | Professional product UI. |
| Debug / developer / transcript areas | Mono | 400 | Use sparingly. |

Do not use pixel fonts for product UI copy. Pixel treatment belongs only in background texture or optional tiny decorative details.

---

## 5. Role-selection screen specification

This is the first screen and should be extremely clear.

### Layout
Desktop landscape web app, centred composition.

```text
[Subtle white Greek architectural hall background]

          small gold column icon
          The Sparring Room
          Choose your role to begin.

          [ Junior Lawyer              > ]
          [ Admin / Senior Lawyer      > ]
```

### Composition

- Full viewport height: `min-h-screen`.
- Main content centred horizontally and slightly above vertical centre.
- Max content width: `720px`.
- Title block above buttons.
- Two role cards stacked vertically.
- Spacing between cards: `24px`.
- Background should have strong central negative space behind the content.

### Role cards

#### Junior Lawyer card
Primary/dark card.

- Background: `--color-ink` or subtle gradient from `#111827` to `#1f2937`.
- Text: white.
- Icon: muted gold laurel or scales.
- Arrow: muted gold or white.
- Purpose: first/default path.

Copy:

```text
Junior Lawyer
Practice and receive feedback.
```

#### Admin / Senior Lawyer card
Secondary/light card.

- Background: white / translucent white.
- Border: muted gold or grey-gold.
- Text: dark graphite.
- Icon: muted gold column or briefcase.
- Arrow: muted gold.

Copy:

```text
Admin / Senior Lawyer
Upload materials and configure sessions.
```

### Interaction

- Entire card is clickable, not just text.
- Hover: subtle lift, slightly stronger shadow, dark card lightens by 4-6%.
- Focus: visible accessible outline, ideally gold/blue ring.
- Keyboard: cards should be focusable buttons or links.
- Mobile: cards remain stacked, full width with minimum touch height `72px`.

---

## 6. Tailwind-style implementation guidance

### Page shell

```tsx
<main className="relative min-h-screen overflow-hidden bg-white text-slate-900">
  <GreekHallBackground />
  <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16">
    <RoleSelectHeader />
    <RoleSelectCards />
  </div>
</main>
```

### Background component

Use either a generated image asset or CSS layered gradients.

```tsx
function GreekHallBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.22]"
        style={{ backgroundImage: "url('/images/greek-hall-white.png')" }}
      />
      <div className="absolute inset-0 bg-white/65" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(220,236,247,0.45),transparent_32%)]" />
    </div>
  );
}
```

### Role button component

```tsx
type RoleCardProps = {
  title: string;
  description: string;
  variant: 'primary' | 'secondary';
  icon: React.ReactNode;
  onClick: () => void;
};

function RoleCard({ title, description, variant, icon, onClick }: RoleCardProps) {
  const isPrimary = variant === 'primary';

  return (
    <button
      onClick={onClick}
      className={[
        'group flex w-full items-center gap-6 rounded-2xl px-8 py-7 text-left transition',
        'focus:outline-none focus-visible:ring-4 focus-visible:ring-[#c7a45a]/35',
        isPrimary
          ? 'bg-slate-900 text-white shadow-2xl hover:bg-slate-800'
          : 'border border-[#c7a45a]/45 bg-white/88 text-slate-900 shadow-lg backdrop-blur-sm hover:bg-white',
      ].join(' ')}
    >
      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[#c7a45a]/45 text-[#c7a45a]">
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-2xl font-semibold tracking-[-0.02em]">{title}</span>
        <span className={isPrimary ? 'mt-1 block text-base text-slate-300' : 'mt-1 block text-base text-slate-600'}>
          {description}
        </span>
      </span>

      <span className="text-3xl text-[#c7a45a] transition group-hover:translate-x-1">→</span>
    </button>
  );
}
```

---

## 7. Screen flow guidance

Use the uploaded wireframe as the product-flow source. The intended split is:

### Junior Lawyer flow

1. Pick user type.
2. Pick case / battlefield.
3. Select opponent.
4. Hear context voice-over and pick clauses to argue.
5. Voice interface with haptic feedback.
6. Feedback report.

### Admin / Senior Lawyer flow

1. Short intro and upload option for playbook / legal docs.
2. Upload complete.
3. Test as junior lawyer.
4. Make natural-language amendments.

### How to carry the style through later screens

- Keep the same white architectural background, but fade it further behind dense UI.
- Use white cards for content-heavy legal text.
- Use dark graphite only for primary actions or active state.
- Use gold sparingly for progress, icons, and section separators.
- Do not put large characters in the foreground.
- If using philosophers/opponents, use small square avatars or distant background silhouettes, not hero illustrations.

---

## 8. Visual hierarchy rules

1. User task first.
2. Role cards second.
3. Greek atmosphere third.
4. Decorative detail last.

Every screen should pass this test:

> If the background disappeared, the UI would still be fully usable. If the UI disappeared, the background would simply feel like a subtle Greek marble hall.

### Text contrast

- Main text on white: `#111827` or darker.
- Secondary text: at least `#4b5563`.
- Text on dark buttons: white or `#f8fafc`.
- Gold should not be used for body text unless large and high contrast.

### Button hierarchy

- One primary action per screen.
- Dark graphite button for the primary route/action.
- White outlined/gold-accent button for secondary route/action.
- Avoid multiple equally dark buttons unless both choices are exactly equal.

---

## 9. Background asset requirements

Create/export background assets separately from UI.

### Recommended file

```text
/public/images/greek-hall-white.png
```

### Requirements

- 16:9 landscape.
- At least 1920 x 1080.
- Mostly pure white.
- Low contrast grey architecture.
- Very pale blue sky only near central arch.
- No foreground people.
- No text in the background image.
- No strong ornament along the centre where UI sits.
- Works with a white overlay at 55-70% opacity.

### CSS treatment

```css
.greek-bg {
  background-image: url('/images/greek-hall-white.png');
  background-size: cover;
  background-position: center;
  opacity: 0.18;
  filter: saturate(0.75) contrast(0.92);
}
```

If the asset is pixel-art inspired, keep it subtle. Avoid harsh pixel edges near text.

---

## 10. Icons

Use thin, simple line icons. Suggested icon mappings:

| Concept | Icon |
|---|---|
| Junior Lawyer | laurel, scales, user, speech bubble |
| Admin / Senior Lawyer | column, briefcase, shield, document |
| Voice | microphone |
| Feedback | chart / report |
| Playbook | document stack |
| Case | courthouse / column |
| Opponent | user silhouette |

Use `lucide-react` or similar. Keep stroke widths consistent.

---

## 11. Do / do not

### Do

- Use spacious layout and large click targets.
- Preserve lots of white space.
- Keep the title elegant and calm.
- Let the two role cards clearly dominate the screen.
- Use subtle Greek architecture for mood.
- Use professional sans-serif UI typography.
- Make the dark primary card stand out.

### Do not

- Do not use pixel fonts for UI labels.
- Do not add people to the role-select background.
- Do not add cartoon Socrates in foreground.
- Do not use boxing rings, fields, sports, or literal sparring imagery.
- Do not make the background parchment/beige.
- Do not overload with Greek borders, patterns, or ornamental frames.
- Do not make gold too saturated.
- Do not rely on decorative icons to explain the product.

---

## 12. Claude Code implementation prompt

Use this prompt when asking Claude Code to implement the screen:

```text
Implement the role-selection landing screen for The Sparring Room in the existing Next.js 16 / React 19 / TypeScript / Tailwind 4 app.

Design direction:
- Professional legal-tech UI over a very subtle classical Greek marble hall background.
- Majority pure white, pale grey architecture, tiny pale sky blue accent, muted gold details.
- No people in the background.
- No pixel fonts for UI. Use a refined serif for the title and a clean sans-serif for controls.
- Two clear role cards only: Junior Lawyer and Admin / Senior Lawyer.
- Junior card should be the primary dark graphite card.
- Admin card should be white with a muted gold border.
- The background is decorative only and must not compete with text.
- Use excellent accessibility: semantic buttons/links, keyboard focus, sufficient contrast, responsive layout.

Content:
Title: The Sparring Room
Subtitle: Choose your role to begin.
Primary card: Junior Lawyer / Practice and receive feedback.
Secondary card: Admin / Senior Lawyer / Upload materials and configure sessions.

Include clean component structure:
- RoleSelectPage
- GreekHallBackground
- RoleCard

Use Tailwind classes and design tokens where possible. Do not over-decorate.
```

---

## 13. Implementation checklist

Before considering the screen done:

- [ ] Background is mostly white and low-contrast.
- [ ] No people or large characters in the background.
- [ ] Title is readable and professional.
- [ ] Button typography is not pixelated.
- [ ] Junior and Admin choices are visually obvious.
- [ ] Cards have hover and focus states.
- [ ] Keyboard navigation works.
- [ ] Mobile layout works.
- [ ] Background does not reduce text contrast.
- [ ] Gold is used only as accent.
- [ ] The screen feels legal/professional before it feels gamified.

