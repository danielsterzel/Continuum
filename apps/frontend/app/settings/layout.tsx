import { VerifyUserAndDevice } from "@/components/on_mount/VerifyUserAndDevice";

export default function SettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <VerifyUserAndDevice>{children}</VerifyUserAndDevice>;
}
