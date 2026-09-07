import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        padding: "10px",
      }}
    >
      <Link to="/dashboard">
        Dashboard
      </Link>

      <Link to="/labs">
        Labs
      </Link>

      <Link to="/compare">
        Compare
      </Link>
    </div>
  );
}

export default Navbar;