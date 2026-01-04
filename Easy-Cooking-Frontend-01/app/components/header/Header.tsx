'use client'

import Link from 'next/link'
import { FaSearch, FaBars, FaTimes } from 'react-icons/fa'
import { useRef, useState } from 'react'
import { useClickOutside } from '@/app/hooks/useClickOutside'
import { useAuth } from '@/app/contexts/AuthContext'
import { Search } from '../search/Search'
import { UserMenu } from './UserMenu'
import { MenuItem } from './MenuItem'
import { NotificationBell } from "./NotificationBell";

export const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const userMenuRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  const { user } = useAuth()

  useClickOutside(userMenuRef, () => setIsUserMenuOpen(false))
  useClickOutside(mobileMenuRef, () => setIsMobileMenuOpen(false))

  const menu = [
    { title: 'Trang Chủ', link: '/' },
    { title: 'Danh Mục', link: '/categories' },
    { title: 'Liên Hệ', link: '/about-us' },
  ]

  return (
    <>
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 sm:py-[20px] py-[16px]">
        <div className="container mx-auto px-[16px]">
          <div className="flex items-center justify-between">

            {/* LOGO */}
            <Link href="/">
              <img
                src="/logoBepViet.png"
                alt="logo"
                className="w-[150px] cursor-pointer"
              />
            </Link>

            {/* MENU DESKTOP */}
            <nav className="hidden lg:block">
              <ul className="flex gap-[60px]">
                {menu.map((item, index) => (
                  <MenuItem key={index} item={item} />
                ))}
              </ul>
            </nav>

            {/* RIGHT ICON GROUP */}
            <div className="flex items-center gap-4">

              {/* SEARCH */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center justify-center w-10 h-10"
              >
                <FaSearch className="w-6 h-6" />
              </button>

              {/* MOBILE MENU */}
              <div className="relative lg:hidden w-10 h-10 flex items-center justify-center" ref={mobileMenuRef}>
                <button onClick={() => setIsMobileMenuOpen(p => !p)}>
                  {isMobileMenuOpen ? (
                    <FaTimes className="w-7 h-7" />
                  ) : (
                    <FaBars className="w-7 h-7" />
                  )}
                </button>

                {isMobileMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white shadow-lg rounded-lg border border-gray-200 py-3 z-[9999]">
                    <ul className="flex flex-col gap-2 px-4">
                      {menu.map((item, index) => (
                        <li key={index}>
                          <Link
                            href={item.link}
                            className="block text-gray-800 text-base py-2 hover:text-orange-500"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {item.title}
                          </Link>
                        </li>
                      ))}

                      {!user && (
                        <>
                          <Link
                            href="/login"
                            className="block text-gray-800 py-2 hover:text-orange-500"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Đăng nhập
                          </Link>

                          <Link
                            href="/register"
                            className="block py-2 bg-orange-500 text-white rounded-lg text-center hover:bg-orange-600 transition"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Đăng ký
                          </Link>
                        </>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* NOTIFICATION + AVATAR */}
              {user && (
                <>
                  <div className="flex items-center justify-center w-10 h-10">
                    <NotificationBell />
                  </div>

                  <div className="relative w-10 h-10 flex items-center justify-center" ref={userMenuRef}>
                    <button onClick={() => setIsUserMenuOpen(p => !p)}>
                      <img
                        src={user.avatarUrl || '/default-avatar.png'}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full object-cover border border-gray-200 bg-gray-100"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/default-avatar.png';
                        }}
                      />
                    </button>

                    {isUserMenuOpen && <UserMenu onClose={() => setIsUserMenuOpen(false)} />}
                  </div>
                </>
              )}

              {/* LOGIN / REGISTER */}
              {!user && (
                <div className="hidden sm:flex items-center gap-4">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Đăng nhập
                  </Link>

                  <Link
                    href="/register"
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isSearchOpen && <Search onClose={() => setIsSearchOpen(false)} />}
    </>
  )
}
