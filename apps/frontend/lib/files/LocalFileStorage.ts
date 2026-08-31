import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";

export async function saveLocalFile(
  file: File,
  relativePath: string,
): Promise<void> {
  if (Capacitor.getPlatform() === "web") {
    await Filesystem.writeFile({
      path: relativePath,
      data: file,
      directory: Directory.Data,
      recursive: true,
    });

    return;
  }

  const buffer = await file.arrayBuffer();

  const bytes = new Uint8Array(buffer);

  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  const base64 = btoa(binary);

  await Filesystem.writeFile({
    path: relativePath,
    data: base64,
    directory: Directory.Data, // Documents for iOS but .Data is mapped to documents for iOS NOT for android that's why .Data
    recursive: true,
  });
}
export async function getFullFilepath(filepath: string | null) {
  if (!filepath) {
    return;
  }

  if (Capacitor.getPlatform() === "web") {
    const res = await Filesystem.readFile({
      directory: Directory.Data,
      path: filepath,
    });

    if (!(res.data instanceof Blob)) {
      throw new Error("Expected a Blob type object");
    }
    return URL.createObjectURL(res.data);
  }

  const { uri } = await Filesystem.getUri({
    directory: Directory.Data,
    path: filepath,
  });

  return Capacitor.convertFileSrc(uri);
}

export async function getFullFile(filepath?: string) {
  if (!filepath) {
    return;
  }
  const data = await Filesystem.readFile({
    path: filepath,
    directory: Directory.Data,
  });

  if (data.data instanceof Blob) {
    return data.data;
  }
  const binary = atob(data.data);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Blob([bytes]);
}
