import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  Cloud,
  FileText,
  Headphones,
  ImageIcon,
  Play,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Everything in one place",
    description:
      "Organize videos, audio, images and documents in focused libraries.",
  },
  {
    icon: Play,
    title: "Pick up where you left off",
    description:
      "Your recent media and progress are ready the moment you come back.",
  },
  {
    icon: Cloud,
    title: "Made for every device",
    description:
      "Keep your personal collection connected wherever you use Continuum.",
  },
];

export default function WelcomePage() {
  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-background text-text-primary">
      <div className="relative isolate">
        <div className="pointer-events-none absolute -left-32 -top-32 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute right-[-10rem] top-72 -z-10 h-[28rem] w-[28rem] rounded-full bg-primary-subtle/70 blur-3xl" />

        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8 sm:py-6">
          <Link
            href="/"
            className="flex items-center gap-3 text-lg font-semibold tracking-tight"
            aria-label="Continuum home"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500 text-white shadow-sm">
              <Sparkles className="h-5 w-5" strokeWidth={1.8} />
            </span>
            Continuum
          </Link>

          <nav
            className="flex items-center gap-2 sm:gap-3"
            aria-label="Main navigation"
          >
            <Link
              href="/login"
              className="rounded-xl px-3.5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-card hover:text-text-primary sm:px-4"
            >
              Log in
            </Link>
            <Link
              href="/setup_user"
              className="rounded-xl bg-text-primary px-3.5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-md sm:px-4"
            >
              Get started
            </Link>
          </nav>
        </header>

        <section className="mx-auto grid w-full max-w-6xl items-center gap-14 px-5 pb-20 pt-12 sm:px-8 sm:pt-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:pb-28 lg:pt-20">
          <div className="animate-fade-in-up text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-subtle/70 px-3.5 py-2 text-xs font-medium uppercase tracking-[0.16em] text-primary-active">
              <Sparkles className="h-3.5 w-3.5" />
              Your personal media space
            </div>

            <h1 className="text-balance text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-text-primary sm:text-6xl lg:text-7xl">
              Everything you save,
              <span className="block text-primary-active">
                ready when you are.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-text-secondary sm:text-lg sm:leading-8 lg:mx-0">
              Continuum keeps your media, notes and progress together, so you
              spend less time searching and more time enjoying what matters.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Link
                href="/setup_user"
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 px-6 py-3.5 font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:from-emerald-500 hover:to-emerald-600 hover:shadow-md sm:w-auto"
              >
                Start your library
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/login"
                className="flex w-full items-center justify-center rounded-xl border border-card-border bg-card px-6 py-3.5 font-medium text-text-primary shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md sm:w-auto"
              >
                I already have an account
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-text-tertiary lg:justify-start">
              {["Simple to use", "Built for focus", "Your progress, saved"].map(
                (item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-primary-active" />
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>

          <div
            className="relative mx-auto w-full max-w-xl animate-fade-in-up lg:mx-0"
            style={{ animationDelay: "0.12s" }}
          >
            <div className="absolute -inset-8 -z-10 rounded-[2.5rem] bg-gradient-to-br from-primary/15 via-transparent to-primary-subtle blur-2xl" />
            <div className="overflow-hidden rounded-3xl border border-card-border bg-card shadow-[0_28px_80px_-30px_rgba(23,23,23,0.28)]">
              <div className="flex items-center justify-between border-b border-card-border px-5 py-4">
                <div className="flex gap-1.5" aria-hidden="true">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                </div>
                <span className="text-xs font-medium text-text-tertiary">
                  My Continuum
                </span>
              </div>

              <div className="p-5 sm:p-7">
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <span className="text-[0.65rem] uppercase tracking-[0.2em] text-emerald-400">
                      Dashboard
                    </span>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                      Welcome back
                    </h2>
                  </div>
                  <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-primary-subtle text-primary-active sm:flex">
                    <Sparkles className="h-5 w-5" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      icon: Headphones,
                      label: "Audio",
                      tint: "bg-violet-50 text-violet-500",
                    },
                    {
                      icon: ImageIcon,
                      label: "Images",
                      tint: "bg-sky-50 text-sky-500",
                    },
                    {
                      icon: FileText,
                      label: "Notes",
                      tint: "bg-amber-50 text-amber-500",
                    },
                  ].map(({ icon: Icon, label, tint }) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-card-border bg-background-subtle/60 p-3 sm:p-4"
                    >
                      <span
                        className={`mb-5 flex h-9 w-9 items-center justify-center rounded-xl ${tint}`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <p className="text-xs font-medium text-text-secondary sm:text-sm">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-card-border p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-text-tertiary">
                        Continue
                      </p>
                      <p className="mt-1 text-sm font-semibold sm:text-base">
                        Recently opened
                      </p>
                    </div>
                    <span className="rounded-lg bg-primary-subtle px-2.5 py-1 text-xs font-medium text-primary-active">
                      68%
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white">
                      <Play className="ml-0.5 h-4 w-4 fill-current" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        Designing better digital spaces
                      </p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background-subtle">
                        <div className="h-full w-2/3 rounded-full bg-primary" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="border-y border-card-border bg-card/70">
        <div className="mx-auto grid w-full max-w-6xl gap-4 px-5 py-16 sm:px-8 md:grid-cols-3 md:py-20">
          {features.map(({ icon: Icon, title, description }, index) => (
            <article
              key={title}
              className="animate-fade-in-up rounded-2xl border border-card-border bg-card p-6 shadow-sm"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-subtle text-primary-active">
                <Icon className="h-5 w-5" strokeWidth={1.7} />
              </span>
              <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-20 text-center sm:px-8 sm:py-28">
        <div className="rounded-3xl border border-primary/20 bg-primary-subtle/50 px-6 py-12 sm:px-12 sm:py-16">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Your library is ready when you are.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-text-secondary sm:text-base">
            Create your Continuum account and bring your favorite media into one
            calm, organized space.
          </p>
          <Link
            href="/setup_user"
            className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-text-primary px-6 py-3.5 font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-md"
          >
            Get started for free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-card-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-5 py-6 text-sm text-text-tertiary sm:flex-row sm:px-8">
          <p className="font-medium text-text-secondary">Continuum</p>
          <p>Your media. Your progress. One place.</p>
        </div>
      </footer>
    </main>
  );
}
