"use client";

import { RecentlyUsedList } from "@/components/home_components/_recently_used/RecentlyUsedList";
import { HomeTitle } from "@/components/home_components/title_shelf/HomeTitle";
import { useState, useEffect } from "react";
import { LibraryList } from "@/components/home_components/_library_list/LibraryList";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { LibraryModal } from "@/components/home_components/LibraryModal";
import { useLibrary } from "@/app/context/LibraryContext";
import { DeviceIcon } from "@/components/DeviceIcon";
import { list } from "@/lib/Hardcoded";
import { useRouter } from "next/navigation";
import { Clock3, FolderOpen, Plus } from "lucide-react";
import { useUser } from "../context/UserContext";
import { useDevice } from "../context/DeviceContext";
import { getLibraries } from "@/lib/db/services/library_service";
import Link from "next/link";

export default function Home() {
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const { items, setItems } = useLibrary();
  const { user } = useUser();
  const { device } = useDevice();
  const router = useRouter();

  useEffect(() => {
    
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!device) {
      router.replace("/setup_device");
      return;
    }
    if (items.length > 0) {
      return;
    }
    async function getLibs(userId: string) {
      setItems(await getLibraries(userId));
    }
    

    getLibs(user.id);
  }, [items.length, setItems]);

  return (
    <>
      <main className="relative min-h-screen w-full overflow-x-hidden bg-background px-4 py-6 sm:px-6 sm:py-8">
        <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-primary/8 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 top-96 h-96 w-96 rounded-full bg-primary-subtle/60 blur-3xl" />

        <div className="relative mx-auto w-full max-w-6xl">
          <header className="animate-fade-in flex flex-col justify-between gap-6 rounded-3xl border border-card-border bg-card p-6 shadow-sm sm:p-8 md:flex-row md:items-center">
            <HomeTitle />
            <DeviceIcon device={device} />
            <Link href={"/db_debug"}>DB_DEBUG</Link>
          </header>

          <section
            className="mt-8 animate-fade-in-up rounded-3xl border border-card-border bg-card/70 p-5 shadow-sm sm:p-7"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="mb-5 flex items-end justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-subtle text-primary-active">
                  <Clock3 className="h-5 w-5" strokeWidth={1.7} />
                </div>
                <div>
                  <span className="text-[0.65rem] uppercase tracking-[0.18em] text-emerald-400">
                    Recent
                  </span>
                  <h2 className="mt-0.5 text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
                    Recently used
                  </h2>
                </div>
              </div>
              <span className="hidden rounded-full border border-card-border bg-card px-3 py-1.5 text-xs font-medium text-text-tertiary sm:block">
                {list.length} items
              </span>
            </div>
            <RecentlyUsedList recentlyUsedList={list} />
          </section>

          <section
            className="mt-8 animate-fade-in-up rounded-3xl border border-card-border bg-card/70 p-5 shadow-sm sm:p-7"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-subtle text-primary-active">
                  <FolderOpen className="h-5 w-5" strokeWidth={1.7} />
                </div>
                <div>
                  <span className="text-[0.65rem] uppercase tracking-[0.18em] text-emerald-400">
                    Collections
                  </span>
                  <h2 className="mt-0.5 text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
                    My libraries
                  </h2>
                </div>
              </div>

              <PrimaryButton onClick={() => setShowLibraryModal(true)}>
                <span className="flex items-center justify-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create new library
                </span>
              </PrimaryButton>
            </div>
            <LibraryList />
          </section>
        </div>
      </main>

      <LibraryModal
        show={showLibraryModal}
        onClose={() => setShowLibraryModal(false)}
      />
    </>
  );
}
