"use client";

import { LibraryClient } from "./LibraryClient";
import { Suspense } from "react";

export default function LibraryPage() {
    return (<Suspense fallback={null}>
        <LibraryClient />
    </Suspense>)
}
