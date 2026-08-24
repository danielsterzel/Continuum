

import { Directory, Filesystem } from "@capacitor/filesystem";

export async function saveLocalFile(
    file: File,
    relativePath: string
): Promise<void>
{
    const buffer = await file.arrayBuffer();

    const bytes = new Uint8Array(buffer);

    let binary = "";

    for(const byte of bytes)
        {
            binary += String.fromCharCode(byte);
        }
    const base64 = btoa(binary);

    await Filesystem.writeFile({
        path: relativePath,
        data: base64,
        directory: Directory.Data,
        recursive: true
    });
}