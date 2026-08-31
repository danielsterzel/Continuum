import { MetaChip } from "@/components/library_components/MetaChip";
import { Calendar, HardDrive } from "lucide-react";

type RecentlyUsedMetaData = {
  createdAt: string;
  updatedAt: string;
  fileSize: number;
};

export function RecentlyUsedMetaData({
  updatedAt,
  fileSize,
}: Readonly<RecentlyUsedMetaData>) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <MetaChip
        icon={<Calendar className="w-3.5 h-3.5" />}
        label={`Updated ${updatedAt}`}
      />
      <MetaChip
        icon={<HardDrive className="w-3.5 h-3.5" />}
        label={`${fileSize} MB`}
      />
    </div>
  );
}
