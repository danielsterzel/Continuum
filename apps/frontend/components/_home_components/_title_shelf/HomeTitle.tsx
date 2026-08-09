export function HomeTitle() {
    return (
        <div className="py-8 max-w-[400px] origin-bottom tracking-wider flex flex-col gap-2">
            <div className="tracking-widest text-xs text-emerald-400 uppercase">
                Dashboard
            </div>
            <div className="flex gap-1 items-center relative">
        
                <h1 className="text-3xl sm:text-5xl font-semibold text-text-primary">
                    Welcome back
                </h1>
 
            </div>
            <p className="text-text-secondary">Pick up right where you left off</p>
        </div>
    );
}
