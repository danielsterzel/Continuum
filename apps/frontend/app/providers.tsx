
import { LibraryProvider } from "./context/LibraryContext";

export function Provider({children}: Readonly<{children : React.ReactNode}>)
{
    return(
        <LibraryProvider>
            {children}
        </LibraryProvider>
    )
}