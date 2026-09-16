import { ProfileHero } from "./_components/ProfileHero";

export default function Profile() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-6 sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute -left-32 top-16 h-80 w-80 rounded-full bg-primary/8 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-80 h-96 w-96 rounded-full bg-primary-subtle/60 blur-3xl" />

      <div className="relative mx-auto w-full max-w-5xl">
        <div className="mb-6 animate-fade-in sm:mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">
            Your account
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary sm:text-5xl">
            Profile
          </h1>
          <p className="mt-2 text-sm leading-6 text-text-secondary sm:text-base">
            Your account details and current device in one place.
          </p>
        </div>

        <ProfileHero />
      </div>
    </main>
  );
}
