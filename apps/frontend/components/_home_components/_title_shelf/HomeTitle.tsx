export function HomeTitle() {
  return (
    <div className="flex max-w-xl origin-bottom flex-col gap-2">
      <div className="text-xs uppercase tracking-[0.2em] text-emerald-400">
        Your space
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-5xl">
        Welcome back
      </h1>
      <p className="text-sm leading-6 text-text-secondary sm:text-base">
        Pick up right where you left off.
      </p>
    </div>
  );
}
