import { Computer } from "lucide-react";
import type { Device } from "@/types/device";

type DeviceIconProps = {
  device: Device | null;
};

export function DeviceIcon({ device }: DeviceIconProps) {
  if (!device) {
    return null;
  }

  return (
    <div className="cursor-pointer fixed top-20 right-6 flex flex-col items-center gap-2">
      <Computer className="w-6 h-6" />
      {device.name}
    </div>
  );
}