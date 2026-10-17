import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import {
    DataTexture,
    DoubleSide,
    FrontSide,
    LinearFilter,
    LinearMipmapLinearFilter,
    RepeatWrapping,
    SRGBColorSpace,
} from "three";

function makeTexture(data, size, repeatX, repeatY, anisotropy, color = false) {
    const texture = new DataTexture(data, size, size);
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(repeatX, repeatY);
    texture.magFilter = LinearFilter;
    texture.minFilter = LinearMipmapLinearFilter;
    texture.generateMipmaps = true;
    texture.anisotropy = anisotropy;
    if (color) texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
}

function makeSurfaceTextures(kind, repeatX, repeatY, anisotropy) {
    const size = 128;
    const color = new Uint8Array(size * size * 4);
    const height = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const offset = (y * size + x) * 4;
            const noise = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
            const grain = noise - Math.floor(noise);
            let rgb;
            let relief;
            if (kind === "wood") {
                const board = Math.floor(x / 32);
                const seam = x % 32 < 2;
                const fibers = Math.sin(
                    x * 2.8 + Math.sin(y * 0.055 + board * 1.7) * 2.5,
                );
                const shade = seam
                    ? 0.45
                    : 0.86 + fibers * 0.09 + grain * 0.09 + board * 0.025;
                rgb = [144 * shade, 94 * shade, 53 * shade];
                relief = seam ? 45 : 138 + fibers * 17 + grain * 12;
            } else {
                const seam = x < 2 || y < 2;
                const fleck = grain > 0.91 ? 30 : grain * 9;
                const shade = seam ? 177 : 237 - fleck;
                rgb = [shade, shade * 0.99, shade * 0.96];
                relief = seam ? 45 : 170 - fleck * 2;
            }
            color.set([...rgb, 255], offset);
            height.set([relief, relief, relief, 255], offset);
        }
    }
    return {
        map: makeTexture(color, size, repeatX, repeatY, anisotropy, true),
        bumpMap: makeTexture(height, size, repeatX, repeatY, anisotropy),
    };
}

function useSurfaceTextures(kind, repeatX, repeatY) {
    const anisotropy = useThree(({ gl }) =>
        Math.min(8, gl.capabilities.getMaxAnisotropy()),
    );
    const textures = useMemo(
        () => makeSurfaceTextures(kind, repeatX, repeatY, anisotropy),
        [kind, repeatX, repeatY, anisotropy],
    );
    useEffect(
        () => () => {
            Object.values(textures).forEach((texture) => texture.dispose());
        },
        [textures],
    );
    return textures;
}

export function WoodMaterial({ width = 300, height = 20, ...props }) {
    const textures = useSurfaceTextures("wood", width / 40, height / 60);
    return (
        <meshStandardMaterial
            {...textures}
            roughness={0.68}
            bumpScale={0.12}
            {...props}
        />
    );
}

export function CeilingMaterial() {
    const textures = useSurfaceTextures("ceiling", 12, 12);
    return (
        <meshStandardMaterial
            {...textures}
            side={FrontSide}
            shadowSide={DoubleSide}
            roughness={0.95}
            bumpScale={0.15}
        />
    );
}
