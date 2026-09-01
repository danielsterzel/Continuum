
import { ArrowLeft } from "lucide-react"

export function GoBackButton({onBack} : Readonly<{onBack: () => void}>)
{
    return(

            <button
                onClick={onBack}
                className="group flex items-center gap-2 mb-8
                    mt-12 sm:mt-0
                    text-text-tertiary hover:text-text-primary
                    transition-colors duration-200
                    cursor-pointer"
            >
                <ArrowLeft
                    className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200"
                />
                <span className="text-sm">Back</span>
            </button>
    )
}
