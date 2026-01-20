import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from './redux'
import { logout } from '@store/features/auth/authReducer'
import { persistor } from '@store'

/**
 * Custom hook for handling logout functionality
 * Clears all storage (localStorage, sessionStorage, Redux persist) and redirects to login
 */
export const useLogout = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const handleLogout = useCallback(async () => {
    try {
      // Clear Redux state
      dispatch(logout())

      // Purge Redux Persist storage
      await persistor.purge()

      // Clear localStorage
      localStorage.clear()

      // Clear sessionStorage
      sessionStorage.clear()

      // Redirect to login page
      navigate('/auth/login', { replace: true })
    } catch (error) {
      console.error('Error during logout:', error)
      // Even if there's an error, try to redirect
      navigate('/auth/login', { replace: true })
    }
  }, [dispatch, navigate])

  return handleLogout
}
