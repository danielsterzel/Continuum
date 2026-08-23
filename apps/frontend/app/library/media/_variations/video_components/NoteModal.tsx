

type NoteModalProps = {
    show : boolean
    onClose: () => void;
}

export function NoteModal({show, onClose}: NoteModalProps)
{
    if(!show){
        return null;
    }
    return (
    <div 
    onClick={onClose}
    className="fixed inset-0 min-h-screen bg-black/40 z-20">
        <div 
        onClick={(e) => {e.stopPropagation();}}
        className="bg-card rounded-xl">COS</div>
    </div>
);
}