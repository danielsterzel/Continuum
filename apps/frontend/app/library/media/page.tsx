
import { Suspense } from "react";
import { MediaClient } from "./MediaClient";


export default function MediaPage() {

  return(
    <Suspense fallback={null}>
      <MediaClient />
    </Suspense>
  )
  
}
