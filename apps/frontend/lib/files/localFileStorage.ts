

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
        directory: Directory.Data, // Documents for iOS but .Data is mapped to documents for iOS NOT for android that's why .Data
        recursive: true
    });
}
export async function getFullFilepath(filepath: string | null)
{
    if(!filepath){return;}
    const {uri} = await Filesystem.getUri({
        directory: Directory.Data,
        path:filepath
    });

    return uri;
}