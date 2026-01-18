import "./Header.css";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="header">
      <Link to="/" className="link">
        <h1 className="title">
          MedTime
        </h1>
      </Link>

      <nav className="nav">
        <Link to="/" className="link">
          Home
        </Link>
        <Link to="/dashboard" className="link">
          Dashboard
        </Link>
        <Link to="/profile" className="link">
          Profile
        </Link>
        <Link to="/login" className="link">
          Login
        </Link>
      </nav>
    </header >
  );
}

export default Header;
