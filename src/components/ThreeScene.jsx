import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { CharacterControls } from "./CharacterControls";
import { KeyDisplay, DIRECTIONS } from "../utils/KeyDisplay"; // Import KeyDisplay
import Terrain from "./Terrain"; // Import Terrain component
import { Cache } from "three";

Cache.clear(); // Clears all cached files
const ThreeScene = () => {
  const characterControls = useRef(null);
  const keysPressed = useRef({});
  const keyDisplay = useRef(new KeyDisplay()); // Initialize KeyDisplay

  useEffect(() => {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa8def0);

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 20);
    camera.fov = 50; // Lower FOV narrows the view and effectively zooms in
camera.updateProjectionMatrix();

    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 50, 0);
    scene.add(light);

   //terrain
   renderer.autoClear = true;

    // Load BigFoot model
    const loader = new GLTFLoader();
    loader.load("https://storage.googleapis.com/new-music/bigfoot2.glb", (gltf) => {
      const model = gltf.scene;
      scene.add(model);
     
      model.position.set(0, 1, 0); // Adjust position
      model.scale.set(10, 10, 10);
      const animations = gltf.animations;
      const mixer = new THREE.AnimationMixer(model);
      const animationsMap = new Map();

      animations.forEach((clip) => {
        animationsMap.set(clip.name, mixer.clipAction(clip));
      });

      characterControls.current = new CharacterControls(
        model,
        mixer,
        animationsMap,
        orbitControls,
        camera,
        "idle" // Default action
      );
    });

    const clock = new THREE.Clock();
    const planeGeometry = new THREE.PlaneGeometry(200, 200); // Width and height of the plane
    const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 }); // Grey ground
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2; // Rotate the plane to lay flat
    plane.position.y = 1; // Position it below the character
    plane.receiveShadow = true; // Allow shadows to fall on the ground
    scene.add(plane);
    const animate = () => {
      const delta = clock.getDelta();
      if (characterControls.current) {
        characterControls.current.update(delta, keysPressed.current);
      }
      orbitControls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    const handleKeyDown = (e) => {
      keysPressed.current[e.key.toLowerCase()] = true;
      keyDisplay.current.down(e.key); // Update key display
    };

    const handleKeyUp = (e) => {
      keysPressed.current[e.key.toLowerCase()] = false;
      keyDisplay.current.up(e.key); // Update key display
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      renderer.dispose();
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return <div></div>;
};

export default ThreeScene;