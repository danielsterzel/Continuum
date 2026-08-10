import { MediaProvider } from "@/app/context/MediaContext"

export default function MediaLayout({children}: Readonly<{children : React.ReactNode}>)
{
    return (
    <MediaProvider>
        {children}
    </MediaProvider>);
}