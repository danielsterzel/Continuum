"use client";

import { RecentlyUsedList } from "@/components/_home_components/_recently_used/RecentlyUsedList";
import { HomeTitle } from "@/components/_home_components/_title_shelf/HomeTitle";
import { useState, useEffect } from "react";
import { LibraryList } from "@/components/_home_components/_library_list/LibraryList";
import { PrimaryButton } from "@/components/_buttons/PrimaryButton";
import { LibraryModal } from "@/components/_home_components/LibraryModal";
import { useLibrary } from "@/app/context/LibraryContext";
import type { LibraryRead } from "@/types/library";
import { fetchLibraries } from "@/lib/api/library";
import { DeviceIcon } from "@/components/DeviceIcon";
import { list } from "@/lib/hardcoded";
import { createDevice, fetchDevice } from "@/lib/api/device";
import { DeviceRead, DeviceWrite } from "@/types/device";

export default function Home() {
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const {items, setItems} = useLibrary();
  const [device, setDevice] = useState<DeviceRead | null>(null);


  useEffect(() => {

      const savedDevice = localStorage.getItem("device");

      if(savedDevice)
        {
          setDevice(JSON.parse(savedDevice) as DeviceRead);
          return;
        }
      
      const create = async () => {

        //TODO: problematyczne bo i tak nie utowrzy sie bez backenud
        const createdDevice = await createDevice({
          name: "default"
        } as DeviceWrite);

        setDevice(device);
      }

      localStorage.setItem("device", JSON.stringify(device))

      create();

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
        const data = (await res.json()) as LibraryRead[];
        setItems(data);

        data.forEach(e => {
          console.log("ID:", e.id);
        })

      } catch (e) {}
    }

    getLibs();
  }, [items.length, setItems]);

  return (
    <>
      <div className="relative min-h-screen w-full px-4 py-6 max-w-5xl mx-auto">
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
