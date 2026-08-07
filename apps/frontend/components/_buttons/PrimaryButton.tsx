

type PrimaryButtonProps = {
    children: React.ReactNode
    styling?: string
    onClick: () => void;
}

export function PrimaryButton({children,styling, onClick} : Readonly<PrimaryButtonProps>)
{
    return(
        <button 
        onClick={onClick}
        className={`
        cursor-pointer p-2 rounded-lg
         bg-gradient-to-r from-green-400 to-emerald-400
         hover:scale-[1.02] will-transform duration-300 ease-In text-white
         ${styling ? `${styling}` : ""}
         `}>
            {children}
        </button>
    )
}