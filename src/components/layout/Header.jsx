"use client";

import { useState, useEffect, useRef } from "react";
import { GraduationCap, User, LogOut, ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSiteName } from "@/hooks/useSiteName";
import { useLogoUrl } from "@/hooks/useLogoUrl";
import { getOptimizedImageUrl } from "@/utils/imageUtils";

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const siteName = useSiteName();
  const logoUrl = useLogoUrl();

  // Don't show header on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLogoLoaded, setIsLogoLoaded] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Function to update login state from localStorage
  const updateLoginState = () => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("name");
    const email = localStorage.getItem("email");
    
    if (token) {
      setIsLoggedIn(true);
      setUserName(name || "User");
      setUserEmail(email || "");
    } else {
      setIsLoggedIn(false);
      setUserName("");
      setUserEmail("");
    }
  };

  // Track when logo URL has been loaded
  useEffect(() => {
    // The logoUrl hook fetches asynchronously from API or uses cache
    // We wait for the fetch to complete before showing the header
    let mounted = true;
    
    // Mark as loaded after a delay to allow the hook's fetch to complete
    // This handles both cached (immediate) and API fetch (async) cases
    // 500ms should be sufficient for most network conditions
    const timer = setTimeout(() => {
      if (mounted) {
        setIsLogoLoaded(true);
      }
    }, 500);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  // Dispatch event when header is fully loaded and displayed
  useEffect(() => {
    if (isLogoLoaded) {
      // Small delay to ensure header is fully rendered in DOM
      const timer = setTimeout(() => {
        window.dispatchEvent(new CustomEvent("headerLoaded"));
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isLogoLoaded]);

  useEffect(() => {
    // Check initial login state
    updateLoginState();

    // Listen for custom login/logout events
    const handleLoginEvent = () => {
      updateLoginState();
    };

    // Listen for storage changes (for cross-tab updates)
    const handleStorageChange = (e) => {
      if (e.key === "token" || e.key === "name" || e.key === "email") {
        updateLoginState();
      }
    };

    // Add event listeners
    window.addEventListener("userLoggedIn", handleLoginEvent);
    window.addEventListener("userLoggedOut", handleLoginEvent);
    window.addEventListener("storage", handleStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener("userLoggedIn", handleLoginEvent);
      window.removeEventListener("userLoggedOut", handleLoginEvent);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAnchorClick = (e, anchorId) => {
    e.preventDefault();
    if (pathname === "/") {
      // Use requestAnimationFrame to avoid forced reflow
      requestAnimationFrame(() => {
        const element = document.getElementById(anchorId);
        if (element) {
          // Account for fixed header height (64px mobile, 80px desktop)
          const headerHeight = window.innerWidth >= 768 ? 80 : 64;
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - headerHeight;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }
      });
    } else {
      // Navigate to home page with hash, the page's useEffect will handle scrolling
      window.location.href = `/#${anchorId}`;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    setShowDropdown(false);
    
    // Dispatch logout event
    window.dispatchEvent(new CustomEvent("userLoggedOut"));
    
    router.push("/");
  };

  const getInitial = () => {
    return userName.charAt(0).toUpperCase() || "U";
  };

  // Don't render header until logo URL has been loaded
  if (!isLogoLoaded) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          {logoUrl ? (
            <img 
              // src={getOptimizedImageUrl(logoUrl, 120, 32)} 
              src={logoUrl}
              alt={siteName || "Logo"} 
              width={120}
              height={32}
              className="h-8 w-auto  object-contain"
              style={{  height: 'auto' }}
              loading="lazy"
              sizes="(max-width: 768px) 80px, 120px"
              decoding="async"
            />
          ) : (""
          // <GraduationCap className="w-6 h-6 md:w-8 md:h-8 text-[#1A73E8]" />
          )}
          {/* {siteName && siteName.trim() && (
          <span className="text-lg md:text-xl font-bold text-[#0C1A35]">{siteName}</span>
          )} */}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-10">
          <Link 
            href="/" 
            className={`transition-colors font-semibold min-h-[44px] min-w-[44px] flex items-center px-2 ${
              pathname === "/" 
                ? "text-[#1A73E8]" 
                : "text-[#0C1A35] hover:text-[#1A73E8]"
            }`}
          >
            Home
          </Link>

          <Link 
            href="/#featured-exams"
            onClick={(e) => handleAnchorClick(e, "featured-exams")}
            className="text-[#0C1A35] hover:text-[#1A73E8] transition-colors font-semibold min-h-[44px] min-w-[44px] flex items-center px-2"
          >
            Popular Exams
          </Link>

          <Link 
            href="/exams" 
            className={`transition-colors font-semibold min-h-[44px] min-w-[44px] flex items-center px-2 ${
              pathname === "/exams" 
                ? "text-[#1A73E8]" 
                : "text-[#0C1A35] hover:text-[#1A73E8]"
            }`}
          >
            All Exams
          </Link>

          <Link 
            href="/#popular-providers"
            onClick={(e) => handleAnchorClick(e, "popular-providers")}
            className="text-[#0C1A35] hover:text-[#1A73E8] transition-colors font-semibold min-h-[44px] min-w-[44px] flex items-center px-2"
          >
            Providers
          </Link>

          <Link 
            href="/blog" 
            className={`transition-colors font-semibold min-h-[44px] min-w-[44px] flex items-center px-2 ${
              pathname === "/blog" 
                ? "text-[#1A73E8]" 
                : "text-[#0C1A35] hover:text-[#1A73E8]"
            }`}
          >
            Blog
          </Link>

          <Link 
            href="/testimonials" 
            className={`transition-colors font-semibold min-h-[44px] min-w-[44px] flex items-center px-2 ${
              pathname === "/testimonials" 
                ? "text-[#1A73E8]" 
                : "text-[#0C1A35] hover:text-[#1A73E8]"
            }`}
          >
            Testimonials
          </Link>
        </nav>

        {/* Desktop Auth Buttons or Profile Dropdown */}
        <div className="hidden md:flex items-center gap-4">
          {!isLoggedIn ? (
            <>
              <Button 
                variant="ghost" 
                className="text-[#0C1A35] hover:text-[#1A73E8] font-semibold"
                asChild
              >
                <Link href="/login">Login</Link>
              </Button>

              <Button 
                className="bg-[#1A73E8] text-white hover:bg-[#1557B0] shadow-[0_4px_14px_rgba(26,115,232,0.4)] font-semibold"
                asChild
              >
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          ) : (
            <div className="relative" ref={dropdownRef}>
              {/* Profile Avatar Button */}
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity  p-2"
              >
                <div className="w-10 h-10 p-6 min-w-[44px] min-h-[44px] rounded-full bg-gradient-to-br from-[#1A73E8] to-[#4A90E2] flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {getInitial()}
                </div>
                <ChevronDown className={`w-4 h-4 text-[#0C1A35] transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-[#0C1A35]">{userName}</p>
                    <p className="text-xs text-[#0C1A35]/75 truncate">{userEmail}</p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-3 min-h-[44px] text-sm text-[#0C1A35] hover:bg-[#1A73E8]/5 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span className="font-medium">My Dashboard</span>
                    </Link>

                    <Link
                      href="/profile"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-3 min-h-[44px] text-sm text-[#0C1A35] hover:bg-[#1A73E8]/5 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span className="font-medium">View Profile</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 min-h-[44px] text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-3 min-h-[44px] min-w-[44px] flex items-center justify-center text-[#0C1A35] hover:text-[#1A73E8] transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div ref={mobileMenuRef} className="md:hidden border-t border-gray-200 bg-white">
          <nav className="container mx-auto px-4 py-4 space-y-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 min-h-[44px] rounded-lg transition-colors font-semibold flex items-center ${
                pathname === "/"
                  ? "text-[#1A73E8] bg-[#1A73E8]/5"
                  : "text-[#0C1A35] hover:bg-gray-50"
              }`}
            >
              Home
            </Link>

            <Link
              href="/#featured-exams"
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleAnchorClick(e, "featured-exams");
              }}
              className="block px-4 py-3 min-h-[44px] rounded-lg text-[#0C1A35] hover:bg-gray-50 hover:text-[#1A73E8] transition-colors font-semibold flex items-center"
            >
              Popular Exams
            </Link>

            <Link
              href="/exams"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 min-h-[44px] rounded-lg transition-colors font-semibold flex items-center ${
                pathname === "/exams"
                  ? "text-[#1A73E8] bg-[#1A73E8]/5"
                  : "text-[#0C1A35] hover:bg-gray-50"
              }`}
            >
              All Exams
            </Link>

            <Link
              href="/#popular-providers"
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleAnchorClick(e, "popular-providers");
              }}
              className="block px-4 py-3 min-h-[44px] rounded-lg text-[#0C1A35] hover:bg-gray-50 hover:text-[#1A73E8] transition-colors font-semibold flex items-center"
            >
              Providers
            </Link>

            <Link
              href="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 min-h-[44px] rounded-lg transition-colors font-semibold flex items-center ${
                pathname === "/blog"
                  ? "text-[#1A73E8] bg-[#1A73E8]/5"
                  : "text-[#0C1A35] hover:bg-gray-50"
              }`}
            >
              Blog
            </Link>

            <Link
              href="/testimonials"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-4 py-3 min-h-[44px] rounded-lg transition-colors font-semibold flex items-center ${
                pathname === "/testimonials"
                  ? "text-[#1A73E8] bg-[#1A73E8]/5"
                  : "text-[#0C1A35] hover:bg-gray-50"
              }`}
            >
              Testimonials
            </Link>

            {/* Mobile Auth Buttons */}
            <div className="pt-4 border-t border-gray-200 space-y-2">
              {!isLoggedIn ? (
                <>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-[#0C1A35] hover:text-[#1A73E8] font-semibold min-h-[44px]"
                    asChild
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button
                    className="w-full bg-[#1A73E8] text-white hover:bg-[#1557B0] font-semibold min-h-[44px]"
                    asChild
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </>
              ) : (
                <>
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-[#0C1A35]">{userName}</p>
                    <p className="text-xs text-[#0C1A35]/75 truncate">{userEmail}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 min-h-[44px] text-sm text-[#0C1A35] hover:bg-gray-50 transition-colors font-semibold"
                  >
                    <User className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 min-h-[44px] text-sm text-[#0C1A35] hover:bg-gray-50 transition-colors font-semibold"
                  >
                    <User className="w-4 h-4" />
                    <span>View Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 min-h-[44px] text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left font-semibold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
