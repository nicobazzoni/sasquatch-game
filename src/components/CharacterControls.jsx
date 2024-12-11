import { useState, useEffect, useCallback } from "react";

const actionByKey = (key) => {
  const keyActionMap = {
    KeyW: "moveForward",
    KeyS: "moveBackward",
    KeyA: "moveLeft",
    KeyD: "moveRight",
    Space: "jump"
  };

  return keyActionMap[key];
};

const useKeyboard = () => {
  const [actions, setActions] = useState({
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    jump: false
  });

  const handleKeyChange = useCallback((keyCode, value) => {
    const action = actionByKey(keyCode);

    if (action) {
      setActions((previousActions) => ({
        ...previousActions,
        [action]: value
      }));
    }
  }, []);

  const handleKeyDown = useCallback(
    (event) => {
      handleKeyChange(event.code, true);
    },
    [handleKeyChange]
  );

  const handleKeyUp = useCallback(
    (event) => {
      handleKeyChange(event.code, false);
    },
    [handleKeyChange]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return actions;
};

export default useKeyboard;