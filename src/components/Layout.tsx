import { Link, Outlet, useLocation } from "react-router-dom";

const Layout: React.FC = () => {

  // get the current route
  const location = useLocation();

  return (
    <div className="w-full h-full flex flex-col px-8 py-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold mb-4">RumorAnno</h1>
        {location.pathname !== '/' && (
          <Link to="/">
            <button className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:shadow-lg transition-shadow">
              Back to datasets
            </button>
          </Link>
        )}
      </div>
      <div className="flex-grow overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
