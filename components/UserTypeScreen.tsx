"use client";

/**
 * components/UserTypeScreen.tsx — step 0: role-select landing (style spec §5).
 * The centered hero: serif title, gold divider, two role cards. Matches ref_01.
 */

import { Scale, Landmark } from "lucide-react";
import { RoleCard } from "./RoleCard";

export function UserTypeScreen({
  onJunior,
  onAdmin,
}: {
  onJunior: () => void;
  onAdmin: () => void;
}) {
  return (
    <section className="flex w-full flex-col items-center">
      <div className="mb-9 text-center">
        <Landmark className="mx-auto mb-4 h-7 w-7 text-gold" strokeWidth={1.5} />
        <h1 className="font-heading text-5xl font-medium tracking-[-0.02em] text-[--color-text-primary] md:text-6xl">
          The Sparring Room
        </h1>
        <div className="mx-auto mt-4 h-px w-16 bg-gold/60" />
        <p className="mt-4 text-lg text-[--color-text-secondary]">
          Choose your role to begin.
        </p>
      </div>

      <div className="flex w-full max-w-xl flex-col gap-5">
        <RoleCard
          title="Junior Lawyer"
          description="Practice and receive feedback."
          variant="primary"
          icon={<Scale className="h-6 w-6" strokeWidth={1.5} />}
          onClick={onJunior}
        />
        <RoleCard
          title="Admin / Senior Lawyer"
          description="Upload materials and configure sessions."
          variant="secondary"
          icon={<Landmark className="h-6 w-6" strokeWidth={1.5} />}
          onClick={onAdmin}
        />
      </div>
    </section>
  );
}
