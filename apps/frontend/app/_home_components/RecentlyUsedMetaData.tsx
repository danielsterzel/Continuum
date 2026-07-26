type RecentlyUsedMetaData = {
  createdAt: string;
  updatedAt: string;
  fileSize: number;
};

export function RecentlyUsedMetaData({
  createdAt,
  updatedAt,
  fileSize,
}: Readonly<RecentlyUsedMetaData>) {

    return (
        <div className="flex flex-col  text-neutral-400">

            <div>Created at: {createdAt}</div>


            <div>Last update: {updatedAt}</div>
            <div>Memory: {fileSize} MB</div>

            <div className="mt-2 grid grid-cols-2 w-full gap-16 items-center">
                <div className="w-8 bg-neutral-400 h-px w-full" />
                <div className="w-8 bg-neutral-400 h-px w-full" />
            </div>

        </div>
    );
}
