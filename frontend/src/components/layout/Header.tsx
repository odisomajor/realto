'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Bars3Icon, 
  XMarkIcon, 
  UserIcon, 
  HomeIcon, 
  ChevronDownIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ClipboardDocumentListIcon,
  HeartIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth'
import Image from 'next/image'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const userMenuRef = useRef<HTMLDivElement>(null)

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Buy', href: '/properties?type=sale' },
    { name: 'Rent', href: '/properties?type=rent' },
    { name: 'Properties', href: '/properties' },
    { name: 'Agents', href: '/agents' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' }
  ]

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/')
    setIsUserMenuOpen(false)
  }

  const navigateTo = (path: string) => {
    router.push(path)
    setIsUserMenuOpen(false)
    setIsMenuOpen(false)
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">X</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Xillix</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons or User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-green-600 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {user.avatar ? (
                      <Image 
                        src={user.avatar} 
                        alt={`${user.firstName} ${user.lastName}`}
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-green-600 text-white">
                        {user.firstName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="font-medium">{user.firstName}</span>
                  <ChevronDownIcon className="h-4 w-4" />
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    
                    <button
                      onClick={() => navigateTo('/dashboard')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <ClipboardDocumentListIcon className="h-4 w-4 mr-2" />
                      Dashboard
                    </button>
                    
                    {user.role === 'AGENT' && (
                      <button
                        onClick={() => navigateTo('/properties/create')}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <HomeIcon className="h-4 w-4 mr-2" />
                        Add Property
                      </button>
                    )}
                    
                    <button
                      onClick={() => navigateTo('/favorites')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <HeartIcon className="h-4 w-4 mr-2" />
                      Favorites
                    </button>
                    
                    <button
                      onClick={() => navigateTo('/profile')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Cog6ToothIcon className="h-4 w-4 mr-2" />
                      Settings
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => router.push('/auth/login')}
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => router.push('/auth/register')}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-green-600 p-2"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-green-600 block px-3 py-2 text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Auth Section */}
              <div className="pt-4 pb-3 border-t border-gray-200">
                {isAuthenticated && user ? (
                  <div className="space-y-2">
                    {/* User Info */}
                    <div className="flex items-center px-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                        {user.avatar ? (
                          <Image 
                            src={user.avatar} 
                            alt={`${user.firstName} ${user.lastName}`}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-green-600 text-white">
                            {user.firstName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-base font-medium text-gray-800">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    
                    {/* Mobile User Menu */}
                    <div className="space-y-1 px-2">
                      <button
                        onClick={() => navigateTo('/dashboard')}
                        className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                      >
                        <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
                        Dashboard
                      </button>
                      
                      {user.role === 'AGENT' && (
                        <button
                          onClick={() => navigateTo('/properties/create')}
                          className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                        >
                          <HomeIcon className="h-5 w-5 mr-2" />
                          Add Property
                        </button>
                      )}
                      
                      <button
                        onClick={() => navigateTo('/favorites')}
                        className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                      >
                        <HeartIcon className="h-5 w-5 mr-2" />
                        Favorites
                      </button>
                      
                      <button
                        onClick={() => navigateTo('/profile')}
                        className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                      >
                        <Cog6ToothIcon className="h-5 w-5 mr-2" />
                        Settings
                      </button>
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-3 py-2 text-base font-medium text-red-600 hover:bg-gray-100 rounded-md"
                      >
                        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                        Sign out
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center px-3 space-y-2 flex-col">
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        router.push('/auth/login')
                        setIsMenuOpen(false)
                      }}
                    >
                      Sign In
                    </Button>
                    <Button
                      className="w-full"
                      onClick={() => {
                        router.push('/auth/register')
                        setIsMenuOpen(false)
                      }}
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
