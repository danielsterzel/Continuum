"use client"

import { motion } from "motion/react";
import { recentlyUsedContainerVariant, recentlyUsedItemVariant }
 from "../HomeVariants";

import { RecentlyUsedItem, type RecentlyUsedMediaItem } from "./RecentlyUsedItem";

type RecentlyUsedListProps = {
  recentlyUsedList: RecentlyUsedMediaItem[];
};

export function RecentlyUsedList({
  recentlyUsedList,
}: Readonly<RecentlyUsedListProps>) 
{

    return(
    <motion.ul 
    variants={recentlyUsedContainerVariant}
    initial="hidden"
    animate="show"
    className="flex gap-4 overflow-x-auto py-2"
    >
        {recentlyUsedList.map((item: RecentlyUsedMediaItem, i) => (
        
            <motion.li 
            className=""
            variants={recentlyUsedItemVariant}
            key={item.id}>
                <RecentlyUsedItem item={item}/>
            </motion.li>
        ))}
    </motion.ul>)

}
