import { Image } from "lucide-react"

type MediaCellProps = {
    children: React.ReactNode
}

export function MediaCell({children}: Readonly<MediaCellProps>)
{
    return (

        <div className="flex flex-col items-center justify-center 
        aspect-square border border-neutral rounded-xl
        shadow-sm bg-card
    cursor-pointer hover:scale-[1.02] transition-transform
    transition-color hover:bg-card-hover duration-300">

            <Image 
            className="w-12 h-12 md:w-24 md:h-24 opacity-60"
             strokeWidth={1.0} />
            {children}
        </div>
    )
}