"use client";

import { MediaCell } from "./_home_components/MediaCell";
import { RecentlyUsedList } from "./_home_components/RecentlyUsedList";

import { HomeTitle } from "./_home_components/HomeTitle";

import type { RecentlyUsedMediaItem } from "./_home_components/RecentlyUsedItem";
import { PrimaryButton } from "./_buttons/PrimaryButton";
import { SlideMenu } from "./_home_components/SlideMenu";
import { useState } from "react";


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

  return (
    <div className="relative min-h-screen w-full px-4 py-6">
      <SlideMenu />

      <div className="" style={{ color: "var(--color-primary)" }}>
        <HomeTitle />
      </div>
      <div className="">
        <p className="text-2xl mb-4">Recently Used:</p>
        <RecentlyUsedList recentlyUsedList={list} />
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:gap-0 w-full sm:items-center sm:flex-row justify-between ">
          <p className="text-2xl">My media</p>
          <PrimaryButton onClick={() => setUploadVisible(true)}>+ Add Media</PrimaryButton>
          {uploadVisible}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 items-center justify-center gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))" }}
        >
          <MediaCell> Media 1</MediaCell>
          <MediaCell> Media 2</MediaCell>
          <MediaCell> Media 3</MediaCell>
          <MediaCell> Media 4</MediaCell>
          <MediaCell> Media 5</MediaCell>
          <MediaCell> Media 6</MediaCell>
          <MediaCell> Media 7</MediaCell>
          <MediaCell> Media 8</MediaCell>
        </div>
      </div>
    </div>
  );
}
