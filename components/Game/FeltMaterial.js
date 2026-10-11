import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import {
    DataTexture,
    LinearFilter,
    LinearMipmapLinearFilter,
    RepeatWrapping,
    SRGBColorSpace,
} from "three";

function createFeltTextures(width, length, anisotropy) {
    const size = 512;
    const color = new Uint8Array(size * size * 4);
    const height = new Uint8Array(size * size * 4);
    const roughness = new Uint8Array(size * size * 4);
    let seed = 1747;
    const noise = () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 4294967296 - 0.5;
    };
    const tau = Math.PI * 2;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const offset = (y * size + x) * 4;
            const grain = noise();
            const weave =
                Math.cos((x * Math.PI) / 2) * 0.65 +
                Math.cos((y * Math.PI) / 2) * 0.35;
            const nap =
                Math.sin((x * tau) / size) * Math.cos((y * tau) / size) +
                0.35 * Math.sin(((x + y) * tau * 3) / size);
            const shade = Math.min(
                255,
                Math.round(235 + grain * 22 + nap * 8 + weave * 3),
            );
            const fiberHeight = Math.round(128 + noise() * 35 + weave * 18);
            const fiberRoughness = Math.round(240 + grain * 18 + weave * 4);
            for (let channel = 0; channel < 3; channel++) {
                color[offset + channel] = shade;
                height[offset + channel] = fiberHeight;
                roughness[offset + channel] = fiberRoughness;
            }
            color[offset + 3] =
                height[offset + 3] =
                roughness[offset + 3] =
                    255;
        }
    }

    const texture = (data, microDetail = false) => {
        const result = new DataTexture(data, size, size);
        result.wrapS = result.wrapT = RepeatWrapping;
        result.magFilter = LinearFilter;
        result.minFilter = LinearMipmapLinearFilter;
        result.generateMipmaps = true;
        result.anisotropy = anisotropy;
        if (microDetail) result.repeat.set(width / 4, length / 4);
        result.needsUpdate = true;
        return result;
    };
    const map = texture(color);
    map.colorSpace = SRGBColorSpace;
    return {
        map,
        bumpMap: texture(height, true),
        roughnessMap: texture(roughness, true),
    };
}

export default function FeltMaterial({ width, length, color }) {
    const anisotropy = useThree(({ gl }) =>
        Math.min(8, gl.capabilities.getMaxAnisotropy()),
    );
    const textures = useMemo(
        () => createFeltTextures(width, length, anisotropy),
        [width, length, anisotropy],
    );
    useEffect(
        () => () => {
            for (const texture of Object.values(textures)) texture.dispose();
        },
        [textures],
    );

    return (
        <meshPhysicalMaterial
            {...textures}
            color={color}
            roughness={0.96}
            metalness={0}
            bumpScale={0.012}
            sheen={0.3}
            sheenColor="#7baa97"
            sheenRoughness={0.95}
        />
    );
}
