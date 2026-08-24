
import { DeviceProvider } from "./context/DeviceContext";
import { LibraryProvider } from "./context/LibraryContext";


export function Provider({children}: Readonly<{children : React.ReactNode}>)
{
    return(
            <DeviceProvider>
                <LibraryProvider>      
                {children}
                </LibraryProvider>
            </DeviceProvider>
    )
}