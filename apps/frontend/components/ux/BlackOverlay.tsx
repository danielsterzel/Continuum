

type BlackOverlayProps = {
    closeOverlay: () => void;
}
export function BlackOverlay({closeOverlay}: Readonly<BlackOverlayProps>)
{
    return(
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={closeOverlay}
        />
    )
}