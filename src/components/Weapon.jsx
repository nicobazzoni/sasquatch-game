import React, { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import useSound from "./useSound";
import * as THREE from "three";

const MAGAZINE_SIZE = 9;
const RELOAD_DURATION_MS = 1150;
let reloadAudioContext = null;

const playReloadSound = () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  reloadAudioContext ??= new AudioContext();
  const context = reloadAudioContext;
  if (context.state === "suspended") context.resume();
  const now = context.currentTime;

  const playClick = (startTime, frequency, duration, volume) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(frequency, startTime);
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  };

  playClick(now, 180, 0.06, 0.08);
  playClick(now + 0.18, 520, 0.045, 0.05);
  playClick(now + 0.42, 260, 0.07, 0.075);

};

const Weapon = ({
  enabled = false,
  onFire,
  onReloadComplete,
  onReloadStateChange,
}) => {
  const { camera, scene } = useThree();
  const weaponRef = useRef();
  const mixerRef = useRef();
  const shotCountRef = useRef(0);
  const isReloadingRef = useRef(false);
  const reloadTimeoutRef = useRef(null);
  const recoilRef = useRef(0);
  const enabledRef = useRef(enabled);
  const onFireRef = useRef(onFire);
  const onReloadCompleteRef = useRef(onReloadComplete);
  const onReloadStateChangeRef = useRef(onReloadStateChange);
  const { scene: weaponModel, animations } = useGLTF(
    "https://storage.googleapis.com/new-music/c7_prototype_pistol.glb",
  );

  const playGunshotSound = useSound(
    "https://storage.googleapis.com/new-music/GunshotMachineGun_BW.56657.wav",
    false,
    0.65,
    { poolSize: 4 },
  );

  useEffect(() => {
    onFireRef.current = onFire;
    onReloadCompleteRef.current = onReloadComplete;
    onReloadStateChangeRef.current = onReloadStateChange;
    enabledRef.current = enabled;
  }, [enabled, onFire, onReloadComplete, onReloadStateChange]);

  const finishReload = () => {
    shotCountRef.current = 0;
    isReloadingRef.current = false;
    onReloadStateChangeRef.current?.(false);
    onReloadCompleteRef.current?.();
  };

  const startReload = () => {
    if (isReloadingRef.current || shotCountRef.current === 0) return;

    playReloadSound();
    isReloadingRef.current = true;
    onReloadStateChangeRef.current?.(true);

    const reloadAnimation = animations?.find((clip) => clip.name === "test");

    if (reloadAnimation && mixerRef.current) {
      const action = mixerRef.current.clipAction(reloadAnimation);
      action.setLoop(THREE.LoopOnce);
      action.clampWhenFinished = true;
      action.reset().play();

      const onAnimationFinish = (event) => {
        if (event.action === action) {
          finishReload();
          mixerRef.current.removeEventListener("finished", onAnimationFinish);
        }
      };

      mixerRef.current.addEventListener("finished", onAnimationFinish);
      return;
    }

    reloadTimeoutRef.current = window.setTimeout(finishReload, RELOAD_DURATION_MS);
  };

  const handleFire = (event) => {
    if (
      event.button !== 0 ||
      !enabledRef.current ||
      isReloadingRef.current ||
      !document.pointerLockElement
    ) return;

    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);

    const start = camera.position
      .clone()
      .add(direction.clone().multiplyScalar(0.35));

    onFireRef.current?.(start, direction);
    playGunshotSound({ restart: true });
    recoilRef.current = Math.min(recoilRef.current + 0.085, 0.16);
    camera.rotateX(THREE.MathUtils.randFloat(0.012, 0.022));

    shotCountRef.current += 1;

    if (shotCountRef.current >= MAGAZINE_SIZE) {
      startReload();
    }
  };

  const handleReloadKey = (event) => {
    if (event.code === "KeyR" && enabledRef.current) startReload();
  };

  useEffect(() => {
    camera.add(weaponModel);
    scene.add(camera);
    weaponRef.current = weaponModel;

    if (animations && animations.length > 0) {
      mixerRef.current = new THREE.AnimationMixer(weaponModel);
    }

    weaponModel.scale.set(0.010, 0.010, 0.010);
    weaponModel.position.set(0.2, -0.2, -1);
    weaponModel.rotation.set(0, Math.PI, 0);

    window.addEventListener("mousedown", handleFire);
    window.addEventListener("keydown", handleReloadKey);

    return () => {
      if (reloadTimeoutRef.current) window.clearTimeout(reloadTimeoutRef.current);
      window.removeEventListener("mousedown", handleFire);
      window.removeEventListener("keydown", handleReloadKey);
      camera.remove(weaponModel);
      onReloadStateChangeRef.current?.(false);
    };
  }, [camera, weaponModel, scene, animations]);

  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }

    recoilRef.current = THREE.MathUtils.damp(recoilRef.current, 0, 16, delta);
    if (weaponRef.current) {
      weaponRef.current.position.z = -1 + recoilRef.current;
      weaponRef.current.rotation.z = recoilRef.current * 0.16;
    }

    if (recoilRef.current > 0.002) {
      const shake = recoilRef.current * 0.018;
      camera.position.x += THREE.MathUtils.randFloatSpread(shake);
      camera.position.y += THREE.MathUtils.randFloatSpread(shake);
    }
  });

  return null;
};

export default Weapon;
