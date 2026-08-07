
import { OpenLink } from "@/components/_link_decorations/OpenLink";
import { RecentlyUsedMetaData } from "./RecentlyUsedMetaData";


export type RecentlyUsedMediaItem = { id: number, text: string; createdAt: string,
    updatedAt: string, fileSize: number
 };

type RecentlyUsedItemProps = {
    item: RecentlyUsedMediaItem
}
export function RecentlyUsedItem({item}: Readonly<RecentlyUsedItemProps>)
{
    return(
        <div className="
        hover:scale-[1.02] hover:bg-card-hover transition-transform transition-colors 
        shadow-sm flex flex-col justify-center gap-1 text-md border-2
        border-neutral-300 rounded-lg
         max-h-[150px] w-64 sm:w-80 py-2 px-6 shrink-0">
            <div className="flex justify-between items-center">
            {item.text}
            <OpenLink href="PLACEHOLDER">Open</OpenLink>
            </div>

            <RecentlyUsedMetaData createdAt={item.createdAt} updatedAt={item.updatedAt}
            fileSize={item.fileSize}/>
        </div>
    );

}