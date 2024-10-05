import { Outlet } from "react-router-dom";

const Layout: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col px-8 py-4">
      <h1 className="text-3xl font-bold mb-4">RumorAnno</h1>
      <div className="flex-grow overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
