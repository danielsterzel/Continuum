import type { DeviceRead } from "@/lib/types/Device";

async function getErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const body = (await response.json()) as { detail?: string };
    return typeof body.detail === "string" ? body.detail : fallback;
  } catch {
    return fallback;
  }
}

export async function getRegisteredDevices(
  userId: string,
): Promise<DeviceRead[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/devices/${encodeURIComponent(userId)}`,
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Could not load registered devices"),
    );
  }

  return response.json();
}

export async function removeRegisteredDevice(
  userId: string,
  deviceId: string,
  requestingDeviceId: string,
): Promise<void> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/devices/${encodeURIComponent(userId)}/${encodeURIComponent(deviceId)}`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestingDeviceId }),
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Could not remove the device"),
    );
  }
}
