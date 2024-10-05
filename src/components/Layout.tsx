import { Outlet } from "react-router-dom";

const Layout: React.FC = () => {
  return (
    <div className="px-8 py-4">
      <h1 className="text-3xl font-bold mb-4">RumorAnno</h1>
      
      {/* <nav>
        <Link to="/some-route">
          <button>Go to some route</button>
        </Link>
      </nav> */}
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
