"use client";

import { RecentlyUsedList } from "@/components/_home_components/_recently_used/RecentlyUsedList";

import { HomeTitle } from "@/components/_home_components/_title_shelf/HomeTitle";

import { RecentlyUsedMediaItem } from "@/components/_home_components/_recently_used/RecentlyUsedItem";
import { SlideMenu } from "@/components/_home_components/SlideMenu";
import { useState, useEffect } from "react";
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
  const [uploadVisible, setUploadVisible] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);



  return (
    <div className="relative min-h-screen w-full px-4 py-6">
      <SlideMenu />

      <div
        className="flex items-center justify-between text-primary"
        style={{ color: "var(--primary)" }}
      >
        <HomeTitle />
      </div>
      <div className="">
        <p className="text-xl sm:text-3xl mb-4 text-emerald-900">
          Recently Used:
        </p>
        <RecentlyUsedList recentlyUsedList={list} />
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:gap-0 w-full sm:items-center sm:flex-row justify-between "></div>
        <p className="text-xl sm:text-3xl text-emerald-900 mb-2">
          My libraries
        </p>
        <LibraryList />
      </div>
      <div className="flex items-center justify-center sm:justify-start">
        <PrimaryButton
          styling="mt-4"
          onClick={() => {
            setShowLibraryModal(true);
          }}
        >
          Create new Library
        </PrimaryButton>
        <LibraryModal show={showLibraryModal} onClose={() => setShowLibraryModal(false)}/>
      </div>
    </div>
  );
}
