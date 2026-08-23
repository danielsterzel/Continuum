import { MonitorSmartphone } from "lucide-react";
import type { Device } from "@/types/device";

type DeviceIconProps = {
  device: Pick<Device, "name"> | null;
};

export function DeviceIcon({ device }: DeviceIconProps) {
  if (!device) {
    return null;
  }

  return (
    <div className="flex w-full items-center gap-3 rounded-2xl border border-primary/20 bg-primary-subtle/60 p-3.5 sm:w-auto sm:min-w-64 sm:p-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-card text-primary-active shadow-sm ring-1 ring-primary/10">
        <MonitorSmartphone className="h-6 w-6" strokeWidth={1.6} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_0_4px_rgba(52,211,153,0.14)]" />
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-primary-active">
            Current device
          </p>
        </div>
        <p className="mt-1 truncate text-sm font-semibold text-text-primary sm:text-base">
          {device.name || "Unnamed device"}
        </p>
      </div>
    </div>
  );
}
