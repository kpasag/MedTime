import "./Header.css";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth } from "../../firebase.config";
import { signOut } from "firebase/auth";

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });
    return unsubscribe;
  }, []);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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
        <Link to="/login" className="link" onClick={isLoggedIn ? handleLogout : null}>
          {isLoggedIn ? 'Logout' : 'Login'}
        </Link>
      </nav>
    </header >
  );
}

export default Header;
