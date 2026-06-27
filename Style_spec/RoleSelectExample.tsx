import type { ReactNode } from 'react';

function GreekHallBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.22]"
        style={{ backgroundImage: "url('/images/greek-hall-white.png')" }}
      />
      <div className="absolute inset-0 bg-white/65" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(220,236,247,0.45),transparent_34%)]" />
    </div>
  );
}

function RoleCard({
  title,
  description,
  variant,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  variant: 'primary' | 'secondary';
  icon: ReactNode;
  onClick: () => void;
}) {
  const primary = variant === 'primary';

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'group flex w-full items-center gap-6 rounded-2xl px-8 py-7 text-left transition duration-200',
        'focus:outline-none focus-visible:ring-4 focus-visible:ring-[#c7a45a]/35',
        primary
          ? 'bg-slate-900 text-white shadow-2xl hover:-translate-y-0.5 hover:bg-slate-800'
          : 'border border-[#c7a45a]/45 bg-white/90 text-slate-900 shadow-lg backdrop-blur-sm hover:-translate-y-0.5 hover:bg-white',
      ].join(' ')}
    >
      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[#c7a45a]/45 text-[#c7a45a]">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-2xl font-semibold tracking-[-0.02em]">{title}</span>
        <span className={primary ? 'mt-1 block text-base text-slate-300' : 'mt-1 block text-base text-slate-600'}>
          {description}
        </span>
      </span>
      <span className="text-3xl text-[#c7a45a] transition group-hover:translate-x-1">→</span>
    </button>
  );
}

export default function RoleSelectPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-slate-900">
      <GreekHallBackground />

      <section className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16">
        <div className="mb-10 text-center">
          <div className="mb-5 text-[#c7a45a]">⌂</div>
          <h1 className="font-serif text-5xl font-medium tracking-[-0.04em] text-slate-950 md:text-6xl">
            The Sparring Room
          </h1>
          <p className="mt-5 text-xl text-slate-600">Choose your role to begin.</p>
        </div>

        <div className="flex w-full flex-col gap-6">
          <RoleCard
            title="Junior Lawyer"
            description="Practice and receive feedback."
            variant="primary"
            icon={<span aria-hidden="true">⚖</span>}
            onClick={() => {}}
          />
          <RoleCard
            title="Admin / Senior Lawyer"
            description="Upload materials and configure sessions."
            variant="secondary"
            icon={<span aria-hidden="true">▥</span>}
            onClick={() => {}}
          />
        </div>
      </section>
    </main>
  );
}
