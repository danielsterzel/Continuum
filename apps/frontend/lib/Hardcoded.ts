
import type { RecentlyUsedMediaItem } from "@/components/home_components/_recently_used/RecentlyUsedItem";

export const list: RecentlyUsedMediaItem[] = [
  {
    id: 1,
    text: "Test1",
    createdAt: new Date(Date.now()).toLocaleDateString("pl-PL"),
    updatedAt: new Date(Date.now()).toLocaleDateString("pl-PL"),
    fileSize: 100,
  },
  {
    id: 2,
    text: "Test2",
    createdAt: new Date(Date.now()).toLocaleDateString("pl-PL"),
    updatedAt: new Date(Date.now()).toLocaleDateString("pl-PL"),
    fileSize: 200,
  },
  {
    id: 3,
    text: "Test3",
    createdAt: new Date(Date.now()).toLocaleDateString("pl-PL"),
    updatedAt: new Date(Date.now()).toLocaleDateString("pl-PL"),
    fileSize: 300,
  },
];
