export function HomeTitle() {
    return (
        <div className="py-8 max-w-[400px] origin-bottom tracking-wider flex flex-col gap-2">
            <div className="tracking-widest text-xs text-emerald-400 uppercase">
                Dashboard
            </div>
            <div className="flex gap-1 items-center relative">
                <svg width="20" height="20" viewBox="0 0 100 100">
                    <path
                        d="M20 20 L60 50 L20 80"
                        stroke="currentColor"
                        strokeWidth="20"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                <p className="text-3xl sm:text-5xl font-semibold text-text-primary">
                    Welcome back
                </p>
                <svg
                    className="hidden sm:block absolute right-0 translate-x-12 w-32 h-32"
                    viewBox="0 0 100 100"
                >
                    <path
                        d="M50 10 A40 40 0 0 1 90 50"
                        stroke="currentColor"
                        strokeWidth="20"
                        fill="none"
                        strokeLinecap="butt"
                    />
                </svg>
            </div>
            <p className="text-text-secondary">Pick up right where you left off</p>
        </div>
    );
}
