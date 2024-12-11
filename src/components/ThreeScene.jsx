import { Canvas } from "@react-three/fiber";
import { Sky } from "@react-three/drei";
import { Physics } from "@react-three/cannon";
import { Perf } from "r3f-perf";


import FirstPersonView from "./FirstPersonView";
import Ground from "./Ground";
import Player from "./Player";
import Lights from "./Lights";


import "../App.css";

export default function App() {
  return (
    <> 
   <div style={{ height: "100vh", width: "100vw", overflow: "hidden" }}>
      <Canvas>
        <Perf />

        <Sky sunPosition={[1, 2, 3]} />
        <Lights />

        <FirstPersonView />

        <Physics>
          {/* BigFoot Model as Player */}
          <Player modelUrl="https://storage.googleapis.com/new-music/bigfoot2.glb" />

        </Physics>
      </Canvas>
      </div>
    </>
  );
}