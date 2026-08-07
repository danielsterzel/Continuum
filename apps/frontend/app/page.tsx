"use client";

import { RecentlyUsedList } from "@/components/_home_components/_recently_used/RecentlyUsedList";
import { HomeTitle } from "@/components/_home_components/_title_shelf/HomeTitle";
import { RecentlyUsedMediaItem } from "@/components/_home_components/_recently_used/RecentlyUsedItem";
import { SlideMenu } from "@/components/_home_components/SlideMenu";
import { useState } from "react";
import { LibraryList } from "@/components/_home_components/_library_list/LibraryList";
import { PrimaryButton } from "@/components/_buttons/PrimaryButton";
import { LibraryModal } from "@/components/_home_components/LibraryModal";

const list: RecentlyUsedMediaItem[] = [
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

export default function Home() {
  const [showLibraryModal, setShowLibraryModal] = useState(false);

  return (
    <>
      <div className="relative min-h-screen w-full px-4 py-6 max-w-5xl mx-auto">
        <SlideMenu />

        <div className="animate-fade-in">
          <HomeTitle />
        </div>

        <section className="animate-fade-in-up mt-2" style={{ animationDelay: "0.1s" }}>
          <div className="mb-4">
            <span className="text-xs tracking-widest text-emerald-400 uppercase">Recent</span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-text-primary mt-0.5">
              Recently Used
            </h2>
          </div>
          <RecentlyUsedList recentlyUsedList={list} />
        </section>

        <section className="animate-fade-in-up mt-10" style={{ animationDelay: "0.2s" }}>
          <div className="mb-4">
            <span className="text-xs tracking-widest text-emerald-400 uppercase">Collections</span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-text-primary mt-0.5">
              My Libraries
            </h2>
          </div>
          <LibraryList />
          <div className="mt-4">
            <PrimaryButton onClick={() => setShowLibraryModal(true)}>
              Create new Library
            </PrimaryButton>
          </div>
        </section>
      </div>

      <LibraryModal show={showLibraryModal} onClose={() => setShowLibraryModal(false)} />
    </>
  );
}
