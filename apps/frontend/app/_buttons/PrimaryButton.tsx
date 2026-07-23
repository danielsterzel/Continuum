

type PrimaryButtonProps = {
    children: React.ReactNode
    onClick: () => void;
}

export function PrimaryButton({children, onClick} : Readonly<PrimaryButtonProps>)
{
    return(
        <button 
        onClick={onClick}
        className="
        cursor-pointer p-2 rounded-lg
         bg-gradient-to-r from-green-400 to-emerald-400
         hover:scale-[1.02] will-transform duration-300 ease-In text-white">
            {children}
        </button>
    )
}