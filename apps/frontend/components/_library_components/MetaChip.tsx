export function MetaChip({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full
                bg-card border border-card-border text-text-tertiary text-sm shadow-sm"
        >
            {icon}
            <span>{label}</span>
        </div>
    );
}
