import { Outlet } from "react-router-dom";

const Layout: React.FC = () => {
  return (
    <>
      {/* <nav>
        <Link to="/some-route">
          <button>Go to some route</button>
        </Link>
      </nav> */}
      <div>
        <Outlet />
      </div>
    </>
  );
};

export default Layout;
