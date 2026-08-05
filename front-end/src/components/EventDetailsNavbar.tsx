import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import Logo from "../assets/Svgs/navbar/Logo.svg";
import ProfileImage from "../assets/imges/photoProfil.jpg";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface EventDetailsNavbarProps {
  isLoggedIn?: boolean;
}

const EventDetailsNavbar = ({
  isLoggedIn = false,
}: EventDetailsNavbarProps) => {
  const navigate = useNavigate();
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const { t } = useTranslation();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
    navigate("/login");
  };

  return (
    <nav className="w-full h-14 md:h-16 bg-white px-3 sm:px-4 md:px-8 flex items-center justify-between border-b border-[#D0D0D0] gap-2 relative z-40">
      {/* Left section: Logo + Need Assistance */}
      <div className="flex items-center gap-3 md:gap-4 min-w-0">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={Logo} alt="Ormeet Logo" className="w-6 h-8" />
          <span className="text-lg md:text-xl font-bold text-black">
            Ormeet
          </span>
        </Link>
        <div
          className="hidden md:block h-5 w-px bg-[#D0D0D0]"
          aria-hidden="true"
        />
        <button
          onClick={() => navigate("/support")}
          className="hidden md:inline-flex px-6 py-2 text-[#FF4000] border border-[#FF4000] rounded-full hover:bg-[#FFF4F3] transition-colors text-sm font-semibold whitespace-nowrap"
        >
          {t("header.needAssistance")}
        </button>
      </div>

      {/* Right section: Language + Auth/Profile + Hamburger */}
      <div className="flex items-center gap-2 md:gap-3 lg:gap-4 shrink-0">
        {/* Language selector — desktop only */}
        <span className="hidden md:inline-flex">
          <LanguageSwitcher />
        </span>

        {/* Conditional: Profile icon with dropdown or Auth buttons.
            Rely on the AuthContext user directly (source of truth) rather
            than the isLoggedIn prop — this prevents a parent that hasn't
            re-rendered from wrongly showing Login/Sign Up after login. */}
        {isAuthLoading ? (
          <div className="w-10 h-10 rounded-full bg-[#F5F5F5] animate-pulse" />
        ) : user ? (
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="w-10 h-10 rounded-full overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#FF4000] transition-all"
            >
              <img
                src={user.avatarUrl || ProfileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </button>

            {/* Profile Dropdown menu */}
            {isProfileMenuOpen && (
              <div className="absolute end-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-[#EEEEEE] py-2 z-50">
                {/* User Info Section */}
                {user && (
                  <div className="px-4 py-3 border-b border-[#EEEEEE]">
                    <p className="text-sm font-semibold text-black truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-[#757575] truncate">
                      {user.email}
                    </p>
                    {user.emailVerified && (
                      <span className="inline-flex items-center gap-1 mt-1 text-xs text-[#34A853]">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path
                            d="M3 6l2 2 4-4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {t("userMenu.verified")}
                      </span>
                    )}
                  </div>
                )}
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    navigate("/profile");
                  }}
                  className="w-full text-start px-4 py-2.5 text-sm text-[#4F4F4F] hover:bg-[#F8F8F8] hover:text-[#FF4000] transition-colors cursor-pointer"
                >
                  {t("userMenu.profile")}
                </button>
                {user?.role === "attendee" && (
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      navigate("/dashboard-attendee");
                    }}
                    className="w-full text-start px-4 py-2.5 text-sm text-[#4F4F4F] hover:bg-[#F8F8F8] hover:text-[#FF4000] transition-colors cursor-pointer"
                  >
                    {t("userMenu.attendeeDashboard")}
                  </button>
                )}
                {user?.role === "organizer" && (
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      navigate("/dashboard-organizer");
                    }}
                    className="w-full text-start px-4 py-2.5 text-sm text-[#4F4F4F] hover:bg-[#F8F8F8] hover:text-[#FF4000] transition-colors cursor-pointer"
                  >
                    {t("userMenu.organizerDashboard")}
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    navigate("/dashboard-attendee");
                  }}
                  className="w-full text-start px-4 py-2.5 text-sm text-[#4F4F4F] hover:bg-[#F8F8F8] hover:text-[#FF4000] transition-colors cursor-pointer"
                >
                  {t("userMenu.myTickets")}
                </button>
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    navigate("/settings");
                  }}
                  className="w-full text-start px-4 py-2.5 text-sm text-[#4F4F4F] hover:bg-[#F8F8F8] hover:text-[#FF4000] transition-colors cursor-pointer"
                >
                  {t("userMenu.settings")}
                </button>
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    navigate("/dashboard-attendee");
                  }}
                  className="w-full text-start px-4 py-2.5 text-sm text-[#4F4F4F] hover:bg-[#F8F8F8] hover:text-[#FF4000] transition-colors cursor-pointer"
                >
                  {t("userMenu.accountOptions")}
                </button>
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    navigate("/support");
                  }}
                  className="w-full text-start px-4 py-2.5 text-sm text-[#4F4F4F] hover:bg-[#F8F8F8] hover:text-[#FF4000] transition-colors cursor-pointer"
                >
                  {t("userMenu.helpSupport")}
                </button>
                <div className="border-t border-[#EEEEEE] my-1"></div>
                <button
                  onClick={handleLogout}
                  className="w-full text-start px-4 py-2.5 text-sm text-[#FF4000] hover:bg-[#FFF4F3] transition-colors font-medium"
                >
                  {t("nav.logout")}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 md:gap-3">
            <Link
              to="/onboarding-choice"
              className="px-3 md:px-6 py-2 text-xs md:text-sm font-medium text-[#FF4000] border border-[#FF4000] rounded-full hover:bg-[#FFF4F3] transition-colors whitespace-nowrap"
            >
              {t("nav.login")}
            </Link>
            <Link
              to="/onboarding-choice"
              className="hidden sm:inline-flex px-3 md:px-6 py-2 text-xs md:text-sm font-medium text-white bg-[#FF4000] rounded-full hover:bg-[#E63900] transition-colors whitespace-nowrap"
            >
              {t("nav.signup")}
            </Link>
          </div>
        )}

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#F5F5F5] transition-colors shrink-0"
          aria-label="Menu"
          aria-expanded={mobileMenuOpen}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        </button>
      </div>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/40 z-40"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            className="md:hidden fixed top-0 end-0 h-full w-[80%] max-w-xs bg-white z-50 shadow-xl flex flex-col"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#EEEEEE]">
              <span className="text-base font-bold text-black">Ormeet</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F5F5F5]"
                aria-label="Close"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              </button>
            </div>

            {/* Drawer content */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/support");
                }}
                className="w-full px-4 py-3 text-start text-base font-medium text-[#FF4000] border border-[#FF4000] rounded-full hover:bg-[#FFF4F3] transition-colors"
              >
                {t("header.needAssistance")}
              </button>

              {!user && !isAuthLoading && (
                <>
                  <Link
                    to="/onboarding-choice"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full px-4 py-3 text-center text-base font-medium text-[#FF4000] border border-[#FF4000] rounded-full hover:bg-[#FFF4F3] transition-colors"
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    to="/onboarding-choice"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full px-4 py-3 text-center text-base font-medium text-white bg-[#FF4000] rounded-full hover:bg-[#E63900] transition-colors"
                  >
                    {t("nav.signup")}
                  </Link>
                </>
              )}

              {/* Language switcher */}
              <div className="mt-2 pt-3 border-t border-[#EEEEEE]">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default EventDetailsNavbar;
