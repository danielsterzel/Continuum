"use client";

import { RecentlyUsedList } from "@/components/_home_components/_recently_used/RecentlyUsedList";
import { HomeTitle } from "@/components/_home_components/_title_shelf/HomeTitle";
<<<<<<< Updated upstream
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
=======
import { useState, useEffect } from "react";
import { LibraryList } from "@/components/_home_components/_library_list/LibraryList";
import { PrimaryButton } from "@/components/_buttons/PrimaryButton";
import { LibraryModal } from "@/components/_home_components/LibraryModal";
import { useLibrary } from "@/app/context/LibraryContext";
import type { Library } from "@/types/library";
import { fetchLibraries } from "@/lib/api/library";
import { DeviceIcon } from "@/components/DeviceIcon";
import { list } from "@/lib/hardcoded";
import { createDevice, fetchDevice } from "@/lib/api/device";
import { Device, DeviceWrite } from "@/types/device";

export default function Home() {
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const {items, setItems} = useLibrary();
  const [device, setDevice] = useState<Device | null>(null);


  useEffect(() => {
    const handleDeviceFetch = async() => {
  
      const deviceId = localStorage.getItem("deviceId")
        if(!deviceId){
        
        const res = await createDevice({name: "default"} as DeviceWrite);
        localStorage.setItem("deviceId", res.id);
        return;
      }
      const device = await fetchDevice(deviceId);
    
      if(!device)
        {
          // only one try then fuck off
          throw new Error(`Err setting device`);
        }

      setDevice(device);
    }
    handleDeviceFetch();

    console.log(device?.id);
  }, []);

  useEffect(() => {

    if (items.length > 0) {
      
      return;

    }
    async function getLibs() {
      try {


        const res = await fetchLibraries();

        if (!res.ok) {

          return;
        }
        const data = (await res.json()) as Library[];
        setItems(data);

        data.forEach(e => {
          console.log("ID:", e.id);
        })

      } catch (e) {}
    }

    getLibs();
  }, [items.length, setItems]);
>>>>>>> Stashed changes

  return (
    <>
      <div className="relative min-h-screen w-full px-4 py-6 max-w-5xl mx-auto">
        <SlideMenu />

        <div className="animate-fade-in">
          <HomeTitle />
          {/* <DeviceIcon device={device}/> */}

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
