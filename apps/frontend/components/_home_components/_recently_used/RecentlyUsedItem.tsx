import { OpenLink } from "@/components/_link_decorations/OpenLink";
import { RecentlyUsedMetaData } from "./RecentlyUsedMetaData";
import { FileStack } from "lucide-react";

export type RecentlyUsedMediaItem = { id: number, text: string; createdAt: string,
    updatedAt: string, fileSize: number
 };

type RecentlyUsedItemProps = {
    item: RecentlyUsedMediaItem
}

export function RecentlyUsedItem({item}: Readonly<RecentlyUsedItemProps>) {
    return (
        <div className="
        group hover:shadow-md hover:bg-card-hover transition-all duration-200
        bg-card border border-card-border rounded-xl shadow-sm
        flex flex-col gap-3
        w-64 sm:w-72 px-5 py-4 shrink-0 cursor-pointer">

            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                        <FileStack className="w-4 h-4 text-primary" strokeWidth={1.5} />
                    </div>
                    <span className="text-text-primary font-medium truncate">{item.text}</span>
                </div>
                <OpenLink href="PLACEHOLDER">Open</OpenLink>
            </div>

            <div className="h-px w-full bg-card-border" />

            <RecentlyUsedMetaData
                createdAt={item.createdAt}
                updatedAt={item.updatedAt}
                fileSize={item.fileSize}
            />
        </div>
    );
}
