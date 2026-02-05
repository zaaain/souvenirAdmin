import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '@hooks/redux'
import { selectProfileData } from '@store/features/auth/authReducer'
import { useLogout } from '@hooks/useLogout'
import { US, QA } from 'country-flag-icons/react/3x2'

interface HeaderProps {
  onMenuClick?: () => void
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const profileData = useAppSelector(selectProfileData)
  const handleLogout = useLogout()
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const languageRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleLanguage = (lang: string) => {
    i18n.changeLanguage(lang)
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    setShowLanguageDropdown(false)
  }

  const handleProfileClick = () => {
    navigate('/profile')
    setShowProfileDropdown(false)
  }

  const handleSettingsClick = () => {
    navigate('/settings')
    setShowProfileDropdown(false)
  }

  const onLogout = () => {
    handleLogout()
    setShowProfileDropdown(false)
  }

  return (
    <div className="header">
      <div className="flex items-center justify-between w-full px-6 py-4">
        {/* Left Side - Menu Button */}
        <div>
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Right Side Content */}
        <div className="flex items-center gap-6">

          {/* Notification Icon */}
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {/* Notification Badge */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Language Selector */}
          <div className="relative" ref={languageRef}>
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {i18n.language === 'en' ? (
                <US className="w-5 h-4" />
              ) : (
                <QA className="w-5 h-4" />
              )}
              <span className="text-sm font-Manrope text-gray-700">
                {i18n.language === 'en' ? 'English' : 'العربية'}
              </span>
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showLanguageDropdown && (
              <div className={`absolute ${i18n.language === 'ar' ? 'left-0' : 'right-0'} mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50`}>
                <button
                  onClick={() => toggleLanguage('en')}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left"
                >
                  <US className="w-5 h-4" />
                  <span className="text-sm font-Manrope text-gray-700">English</span>
                </button>
                <button
                  onClick={() => toggleLanguage('ar')}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left"
                >
                  <QA className="w-5 h-4" />
                  <span className="text-sm font-Manrope text-gray-700">العربية</span>
                </button>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-ManropeBold text-sm">
                {profileData?.firstname?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-ManropeBold text-gray-800">
                  {profileData?.firstname || 'User'}
                </span>
                <span className="text-xs font-Manrope text-gray-500">
                  {t('header.role')}
                </span>
              </div>
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showProfileDropdown && (
              <div className={`absolute ${i18n.language === 'ar' ? 'left-0' : 'right-0'} mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50`}>
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-ManropeBold text-gray-800">
                    {profileData?.firstname || 'User'} {profileData?.lastname || ''}
                  </p>
                  <p className="text-xs font-Manrope text-gray-500">{profileData?.email || ''}</p>
                </div>
                <button 
                  onClick={handleProfileClick}
                  className="w-full px-4 py-2 text-left text-sm font-Manrope text-gray-700 hover:bg-gray-50"
                >
                  {t('header.profile')}
                </button>
                <button 
                  onClick={handleSettingsClick}
                  className="w-full px-4 py-2 text-left text-sm font-Manrope text-gray-700 hover:bg-gray-50"
                >
                  {t('header.settings')}
                </button>
                <button 
                  onClick={onLogout}
                  className="w-full px-4 py-2 text-left text-sm font-Manrope text-red-600 hover:bg-gray-50"
                >
                  {t('header.logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header

