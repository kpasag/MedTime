function Header() {
  const linkClass =
    "font-medium text-[#1976D2] transition-colors duration-300 hover:text-[#346088] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1976D2] focus-visible:ring-offset-2";

  return (
    <header className="bg-[#FAFCFC] border-b-2 border-green-500 shadow-sm py-5">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-4">
        <h1 className="m-0 font-semibold tracking-[0.5px] text-[#1976D2] text-4xl">
          MedTime
        </h1>

        <nav className="flex items-center gap-6">
          <a href="#" className={linkClass}>Home</a>
          <a href="#" className={linkClass}>About</a>
          <a href="#" className={linkClass}>Contact</a>
          <a href="#" className={linkClass}>Sign Up</a>
        </nav>
      </div>
    </header>
  );
}

export default Header;
