type PrimaryButtonProps = {
    children: React.ReactNode
    styling?: string
    onClick: () => void;
}

export function PrimaryButton({children, styling, onClick}: Readonly<PrimaryButtonProps>) {
    return (
        <button
            onClick={onClick}
            className={`
                cursor-pointer px-5 py-2.5 rounded-xl font-medium
                bg-gradient-to-r from-emerald-400 to-emerald-500
                hover:from-emerald-500 hover:to-emerald-600
                active:scale-[0.98] hover:scale-[1.02]
                transition-all duration-200 ease-out
                text-white shadow-sm hover:shadow-md
                ${styling ?? ""}
            `}
        >
            {children}
        </button>
    );
}
