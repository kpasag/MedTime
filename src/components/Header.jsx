import './Header.css';

function Header() {
  return (
    <header className="header">
      <h1 className="title">MedTime</h1>
      <nav className="nav">
        <a href="#" className="link">Home</a>
        <a href="#" className="link">About</a>
        <a href="#" className="link">Contact</a>
        <a href="#" className="link">Sign Up</a>
      </nav>
    </header>
  );
}

export default Header;
