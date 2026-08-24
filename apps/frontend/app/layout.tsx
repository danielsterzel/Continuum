import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { Provider } from "./providers";
import { SlideMenu } from "@/components/_home_components/SlideMenu";
import { SyncService } from "./worker/SyncService";
import { BootstrapDb } from "./BootstrapDb";
import { UserProvider } from "./context/UserContext";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Continuum — Your personal media space",
  description:
    "Keep your media, notes and progress together in one calm, organized space.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={montserrat.className}>
        <BootstrapDb >
          <UserProvider>
        <SyncService />
        <Provider>
          <SlideMenu />
          {children}
        </Provider>
        </UserProvider>
        </BootstrapDb>
      </body>
    </html>
  );
}
