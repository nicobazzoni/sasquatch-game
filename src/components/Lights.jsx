const Lights = () => {
  return (
    <>
      <ambientLight />
      <directionalLight position={[1, 2, 3]} />
    </>
  );
};

export default Lights;