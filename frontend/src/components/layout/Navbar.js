'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { ROUTES, getDefaultDashboardRoute } from '../../utils/routes';
import Button from '../common/Button';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);

  const dashboardRoute = user ? getDefaultDashboardRoute(user.role) : ROUTES.HOME;

  // Close dropdown on outside click or escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setUserDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Modern 1px radius navigation link styling
  const navLinkClass = (isActive) =>
    `px-3 py-1.5 rounded-[1px] text-sm font-medium transition-all duration-150 ${
      isActive
        ? 'bg-[#111111] text-white font-medium shadow-xs'
        : 'text-[#666666] hover:text-[#111111] hover:bg-[#F4F4F5]'
    }`;

  const mobileLinkClass = (isActive) =>
    `block px-3 py-2.5 rounded-[1px] text-sm font-medium transition-colors ${
      isActive
        ? 'bg-[#111111] text-white font-semibold'
        : 'text-[#666666] hover:bg-[#F7F7F7] hover:text-[#111111]'
    }`;

  const userInitials = user?.name
    ? user.name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || user.name.slice(0, 2).toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Brand Logo & Desktop Navigation */}
          <div className="flex items-center space-x-8">
            <Link
              href={ROUTES.HOME}
              className="flex items-center space-x-2.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-black rounded-[1px] group flex-shrink-0"
            >
              <div className="w-8 h-8 rounded-[1px] bg-[#111111] flex items-center justify-center text-white flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="font-bold text-lg text-[#111111] tracking-tight">
                Service<span className="font-black">Booking</span>
              </span>
            </Link>

            {/* Desktop Navigation Links (Left/Center) */}
            <nav className="hidden md:flex items-center space-x-1" aria-label="Main navigation">
              <Link
                href={ROUTES.HOME}
                className={navLinkClass(pathname === ROUTES.HOME)}
              >
                Home
              </Link>

              <Link
                href={ROUTES.SERVICES}
                className={navLinkClass(pathname.startsWith(ROUTES.SERVICES))}
              >
                Services
              </Link>

              {isAuthenticated && user?.role === 'CUSTOMER' && (
                <>
                  <Link
                    href={ROUTES.CUSTOMER_DASHBOARD}
                    className={navLinkClass(pathname === ROUTES.CUSTOMER_DASHBOARD)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href={ROUTES.CUSTOMER_BOOKINGS}
                    className={navLinkClass(pathname.startsWith(ROUTES.CUSTOMER_BOOKINGS))}
                  >
                    My Bookings
                  </Link>
                </>
              )}

              {isAuthenticated && user?.role === 'PROVIDER' && (
                <>
                  <Link
                    href={ROUTES.PROVIDER_DASHBOARD}
                    className={navLinkClass(pathname === ROUTES.PROVIDER_DASHBOARD)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href={ROUTES.PROVIDER_SERVICES}
                    className={navLinkClass(pathname.startsWith(ROUTES.PROVIDER_SERVICES))}
                  >
                    My Services
                  </Link>
                  <Link
                    href={ROUTES.PROVIDER_BOOKINGS}
                    className={navLinkClass(pathname.startsWith(ROUTES.PROVIDER_BOOKINGS))}
                  >
                    Bookings
                  </Link>
                  <Link
                    href={ROUTES.PROVIDER_SCHEDULE}
                    className={navLinkClass(pathname.startsWith(ROUTES.PROVIDER_SCHEDULE))}
                  >
                    Schedule
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Extreme Right: User Profile Dropdown or Auth Actions */}
          <div className="hidden md:flex items-center">
            {isAuthenticated ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1 rounded-sm bg-[#F7F7F7] border border-[#E5E5E5] hover:border-[#CCCCCC] hover:bg-[#EFEFEF] transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-black group cursor-pointer"
                  aria-expanded={userDropdownOpen}
                  aria-haspopup="true"
                  id="user-menu-button"
                  title="Account menu"
                >
                  <div className="w-7 h-7 rounded-sm bg-[#111111] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs flex-shrink-0 group-hover:scale-105 transition-transform">
                    {userInitials}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-[#111111] leading-tight max-w-[110px] truncate">
                      {user?.name || 'Account'}
                    </span>
                    <span className="text-[9px] font-bold text-[#71717A] tracking-wider uppercase leading-none mt-0.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-sm bg-[#111111]" aria-hidden="true" />
                      {user?.role}
                    </span>
                  </div>
                  <svg
                    className={`w-3.5 h-3.5 text-[#666666] transition-transform duration-200 ${
                      userDropdownOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu Container (rounded-sm) */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 rounded-sm bg-white border border-[#E5E5E5] shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                  >
                    {/* User header details */}
                    <div className="px-4 py-3 border-b border-[#E5E5E5] bg-[#FAFAFA] rounded-t-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-sm bg-[#111111] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs flex-shrink-0">
                          {userInitials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#111111] leading-tight truncate">
                            {user?.name}
                          </p>
                          <p className="text-[11px] text-[#666666] leading-tight truncate mt-0.5">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold tracking-wider uppercase bg-[#111111] text-white">
                          {user?.role} Account
                        </span>
                      </div>
                    </div>

                    {/* Log Out Action */}
                    <div className="p-1">
                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-xs font-medium text-[#111111] hover:bg-[#F5F5F5] transition-colors text-left cursor-pointer"
                        role="menuitem"
                      >
                        <svg
                          className="w-4 h-4 text-[#666666]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href={ROUTES.LOGIN}>
                  <Button variant="ghost" size="sm" className="font-medium">
                    Sign In
                  </Button>
                </Link>
                <Link href={ROUTES.REGISTER}>
                  <Button variant="primary" size="sm" className="font-medium">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-[1px] text-[#666666] hover:text-[#111111] hover:bg-[#F7F7F7] focus:outline-none focus-visible:ring-1 focus-visible:ring-black"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-b border-[#E5E5E5] bg-white px-4 pt-3 pb-5 space-y-1"
        >
          <Link
            href={ROUTES.HOME}
            onClick={() => setMobileMenuOpen(false)}
            className={mobileLinkClass(pathname === ROUTES.HOME)}
          >
            Home
          </Link>

          <Link
            href={ROUTES.SERVICES}
            onClick={() => setMobileMenuOpen(false)}
            className={mobileLinkClass(pathname.startsWith(ROUTES.SERVICES))}
          >
            Services
          </Link>

          {isAuthenticated ? (
            <>
              {user?.role === 'CUSTOMER' && (
                <>
                  <Link
                    href={ROUTES.CUSTOMER_DASHBOARD}
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileLinkClass(pathname === ROUTES.CUSTOMER_DASHBOARD)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href={ROUTES.CUSTOMER_BOOKINGS}
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileLinkClass(pathname.startsWith(ROUTES.CUSTOMER_BOOKINGS))}
                  >
                    My Bookings
                  </Link>
                </>
              )}

              {user?.role === 'PROVIDER' && (
                <>
                  <Link
                    href={ROUTES.PROVIDER_DASHBOARD}
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileLinkClass(pathname === ROUTES.PROVIDER_DASHBOARD)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href={ROUTES.PROVIDER_SERVICES}
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileLinkClass(pathname.startsWith(ROUTES.PROVIDER_SERVICES))}
                  >
                    My Services
                  </Link>
                  <Link
                    href={ROUTES.PROVIDER_BOOKINGS}
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileLinkClass(pathname.startsWith(ROUTES.PROVIDER_BOOKINGS))}
                  >
                    Booking Requests
                  </Link>
                  <Link
                    href={ROUTES.PROVIDER_SCHEDULE}
                    onClick={() => setMobileMenuOpen(false)}
                    className={mobileLinkClass(pathname.startsWith(ROUTES.PROVIDER_SCHEDULE))}
                  >
                    Schedule
                  </Link>
                </>
              )}
              <div className="pt-3 mt-2 border-t border-[#E5E5E5] flex items-center justify-between px-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[1px] bg-[#111111] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                    {userInitials}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-[#111111] leading-tight">{user?.name}</p>
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded-[1px] text-[9px] font-bold tracking-wider uppercase bg-[#111111] text-white">
                        {user?.role}
                      </span>
                    </div>
                    <p className="text-xs text-[#666666] leading-tight mt-0.5">{user?.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[1px] text-xs font-medium text-[#666666] hover:text-[#111111] hover:bg-[#F4F4F5] border border-[#E5E5E5] transition-all"
                >
                  <svg className="w-3.5 h-3.5 text-[#666666]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Log Out</span>
                </button>
              </div>
            </>
          ) : (
            <div className="pt-3 border-t border-[#E5E5E5] flex flex-col space-y-2">
              <Link
                href={ROUTES.LOGIN}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full"
              >
                <Button variant="outline" size="md" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link
                href={ROUTES.REGISTER}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full"
              >
                <Button variant="primary" size="md" className="w-full">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
