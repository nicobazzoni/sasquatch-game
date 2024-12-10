import React from 'react';
import { useGLTF } from '@react-three/drei';

const Terrain = () => {
    const { scene } = useGLTF('https://storage.googleapis.com/new-music/rock_terrain_3.glb');

    return (
        <primitive
            object={scene}
            scale={[20, 20, 20]} // Adjust the size
            position={[0, 0, 0]} // Position the terrain
        />
    );
};

export default Terrain;