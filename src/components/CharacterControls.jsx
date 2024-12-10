import * as THREE from "three";
export class CharacterControls {
    constructor(model, mixer, animationsMap, orbitControl, camera, currentAction) {
      this.model = model;
      this.mixer = mixer;
      this.animationsMap = animationsMap;
      this.currentAction = currentAction;
      this.orbitControl = orbitControl;
      this.camera = camera;
  
      this.toggleRun = true;
      this.walkDirection = new THREE.Vector3();
      this.rotateAngle = new THREE.Vector3(0, 1, 0);
      this.rotateQuaternion = new THREE.Quaternion();
      this.cameraTarget = new THREE.Vector3();
  
      this.fadeDuration = 0.2;
      this.runVelocity = 5;
      this.walkVelocity = 2;
  
      this.animationsMap.forEach((value, key) => {
        if (key === currentAction) {
          value.play();
        }
      });
      this.updateCameraTarget(0, 0);
    }
  
    switchRunToggle() {
      this.toggleRun = !this.toggleRun;
    }
  
    update(delta, keysPressed) {
        const directionPressed = ["w", "a", "s", "d"].some(
          (key) => keysPressed[key] === true
        );
      
        let play = "";
        if (keysPressed["t"]) {
          play = "throw"; // Throw animation when 't' is pressed
        } else if (directionPressed && keysPressed["shift"]) {
          play = "run"; // Run when direction keys + Shift are pressed
        } else if (directionPressed) {
          play = "walk"; // Walk when only direction keys are pressed
        } else {
          play = "idle"; // Idle when no keys are pressed
        }
      
        // Switch animation if needed
        if (this.currentAction !== play) {
          console.log(`Switching animation from ${this.currentAction} to ${play}`);
          const toPlay = this.animationsMap.get(play);
          const current = this.animationsMap.get(this.currentAction);
      
          if (current) current.fadeOut(this.fadeDuration);
          if (toPlay) toPlay.reset().fadeIn(this.fadeDuration).play();
      
          this.currentAction = play;
        }
      
        this.mixer.update(delta);
      
        if (this.currentAction === "run" || this.currentAction === "walk") {
          const angleYCameraDirection = Math.atan2(
            this.camera.position.x - this.model.position.x,
            this.camera.position.z - this.model.position.z
          );
      
          const directionOffset = this.directionOffset(keysPressed);
      
          this.rotateQuaternion.setFromAxisAngle(
            this.rotateAngle,
            angleYCameraDirection + directionOffset
          );
          this.model.quaternion.rotateTowards(this.rotateQuaternion, 0.2);
      
          this.camera.getWorldDirection(this.walkDirection);
          this.walkDirection.y = 0;
          this.walkDirection.normalize();
          this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset);
      
          // Determine velocity based on the current action
          const velocity =
            this.currentAction === "run" ? this.runVelocity : this.walkVelocity;
      
          // Move model & update camera target
          const moveX = this.walkDirection.x * velocity * delta;
          const moveZ = this.walkDirection.z * velocity * delta;
          this.model.position.x += moveX;
          this.model.position.z += moveZ;
      
          this.updateCameraTarget(moveX, moveZ);
        }
      }
    updateCameraTarget(moveX, moveZ) {
      this.camera.position.x += moveX;
      this.camera.position.z += moveZ;
  
      this.cameraTarget.x = this.model.position.x;
      this.cameraTarget.y = this.model.position.y + 1;
      this.cameraTarget.z = this.model.position.z;
      this.orbitControl.target = this.cameraTarget;
    }
  
    directionOffset(keysPressed) {
      let directionOffset = 0;
  
      if (keysPressed["w"]) {
        if (keysPressed["a"]) {
          directionOffset = Math.PI / 4;
        } else if (keysPressed["d"]) {
          directionOffset = -Math.PI / 4;
        }
      } else if (keysPressed["s"]) {
        if (keysPressed["a"]) {
          directionOffset = Math.PI / 4 + Math.PI / 2;
        } else if (keysPressed["d"]) {
          directionOffset = -Math.PI / 4 - Math.PI / 2;
        } else {
          directionOffset = Math.PI;
        }
      } else if (keysPressed["a"]) {
        directionOffset = Math.PI / 2;
      } else if (keysPressed["d"]) {
        directionOffset = -Math.PI / 2;
      }
  
      return directionOffset;
    }
  }