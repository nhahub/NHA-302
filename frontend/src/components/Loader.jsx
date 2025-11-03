import { HashLoader } from "react-spinners";

const Loader = () => {
  return (
    <div className="flex justify-center items-center h-[100vh]">
      <HashLoader color="#579BB1" loading size={50} />
    </div>
  );
};

export default Loader;
