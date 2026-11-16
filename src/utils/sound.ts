import { convertFileSrc } from "@tauri-apps/api/core";
import { resolveResource } from "@tauri-apps/api/path";
import { platform } from "@tauri-apps/plugin-os";
import { getDefaultStore } from "jotai";
import { commands } from "@/bindings/generated";
import { soundCollectionAtom, soundVolumeAtom } from "@/state/atoms";

const POOL_SIZE = 5;
const audioPool = Array.from({ length: POOL_SIZE }, () => new Audio());
let poolIndex = 0;

let soundServerPort: number | null = null;
const soundUrlCache = new Map<string, string>();

function isLinux(): boolean {
    try {
        return platform() === "linux";
    } catch {
        return false;
    }
}

let lastTime = 0;

async function getSoundServerPort(): Promise<number> {
    if (soundServerPort !== null) {
        return soundServerPort;
    }
    const result = await commands.getSoundServerPort();
    if (result.status === "ok") {
        soundServerPort = result.data;
        return soundServerPort;
    }
    throw new Error("Failed to get sound server port");
}

export function playSound(capture: boolean, check: boolean, brilliant = false) {
    // only play at most 1 sound every 75ms
    const now = Date.now();
    if (now - lastTime < 75) {
        return;
    }
    lastTime = now;

    const store = getDefaultStore();
    const collection = store.get(soundCollectionAtom);
    const volume = store.get(soundVolumeAtom);

    let relativePath: string;
    if (brilliant) {
        // Shared across collections: a brilliant move always uses the same cue.
        relativePath = "Brilliant.wav";
    } else {
        let type = "Move";
        if (capture) {
            type = "Capture";
        }
        if (check) {
            type = "Check";
        }
        relativePath = `${collection}/${type}.mp3`;
    }

    const playWithUrl = (url: string) => {
        const player = audioPool[poolIndex];
        poolIndex = (poolIndex + 1) % POOL_SIZE;

        player.src = url;
        player.volume = volume;
        player.play().catch((e) => console.error("Audio playback error:", e));
    };

    if (isLinux()) {
        getSoundServerPort()
            .then((port) => {
                const url = `http://127.0.0.1:${port}/${relativePath}`;
                playWithUrl(url);
            })
            .catch(() => {
                // fails if Tauri APIs are unavailable (e.g., in tests)
            });
    } else {
        const path = `sound/${relativePath}`;

        if (soundUrlCache.has(relativePath)) {
            playWithUrl(soundUrlCache.get(relativePath)!);
            return;
        }
        resolveResource(path)
            .then((filePath) => {
                const assetUrl = convertFileSrc(filePath);
                soundUrlCache.set(relativePath, assetUrl);

                playWithUrl(assetUrl);
            })
            .catch(() => {
                // fails if Tauri APIs are unavailable (e.g., in tests)
            });
    }
}
