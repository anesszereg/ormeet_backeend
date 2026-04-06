import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
  return (
    <nav className="w-full px-6 md:px-10 lg:px-16 xl:px-20 py-4 flex items-center justify-between bg-white">
      {/* Left: Logo + Nav Links */}
      <div className="flex items-center gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <Image
            src="/svgs/Logo.svg"
            alt="Ormeet Logo"
            width={28}
            height={38}
            priority
          />
          <span className="text-xl font-bold text-black">Ormeet</span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/browse"
            className="text-sm font-medium text-black hover:text-primary transition-colors"
          >
            Browse events
          </Link>
          <Link
            href="/host"
            className="text-sm font-medium text-black hover:text-primary transition-colors"
          >
            Host events
          </Link>
          <Link
            href="/support"
            className="text-sm font-medium text-black hover:text-primary transition-colors"
          >
            Support
          </Link>
        </div>
      </div>

      {/* Right: Language + Auth Buttons */}
      <div className="flex items-center gap-4">
        {/* Language Selector */}
        <button className="hidden md:flex items-center gap-1.5 text-sm font-medium text-black hover:text-primary transition-colors cursor-pointer">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="10"
              cy="10"
              r="9"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <ellipse
              cx="10"
              cy="10"
              rx="4"
              ry="9"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M1 10H19"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M3 5.5H17"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M3 14.5H17"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span>EN</span>
        </button>

        {/* Log In Button */}
        <Link
          href="/login"
          className="px-5 py-2 text-sm font-semibold text-primary border border-primary rounded-full hover:bg-primary-light transition-colors"
        >
          Log In
        </Link>

        {/* Sign Up Button */}
        <Link
          href="/register"
          className="px-5 py-2 text-sm font-semibold text-white bg-primary rounded-full hover:bg-primary-dark transition-colors"
        >
          Sign up
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
