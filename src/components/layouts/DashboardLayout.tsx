import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useAppSelector } from '@hooks/redux'
import { selectToken, selectIsAuthenticated } from '@store/features/auth/authReducer'
import { useLogout } from '@hooks/useLogout'
import Sidebar from '@components/sidebar/Sidebar'
import Header from '@components/header/Header'

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const token = useAppSelector(selectToken)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const handleLogout = useLogout()

  useEffect(() => {
    // Check if token exists and user is authenticated
    if (!token || !isAuthenticated) {
      handleLogout()
    }
  }, [token, isAuthenticated, handleLogout])

  // Function to handle unauthorized API responses
  // This can be called from API interceptors or components
  useEffect(() => {
    const handleUnauthorized = (event: CustomEvent) => {
      if (event.detail?.status === 401 || event.detail?.status === 403) {
        handleLogout()
      }
    }

    window.addEventListener('unauthorized' as any, handleUnauthorized as EventListener)
    
    return () => {
      window.removeEventListener('unauthorized' as any, handleUnauthorized as EventListener)
    }
  }, [handleLogout])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className="dashboard-content">
        <Header onMenuClick={toggleSidebar} />
        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay md:hidden"
          onClick={closeSidebar}
        ></div>
      )}
    </div>
  )
}

export default DashboardLayout

