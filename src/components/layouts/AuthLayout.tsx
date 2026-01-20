import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAppSelector } from '@hooks/redux'
import { selectToken, selectIsAuthenticated } from '@store/features/auth/authReducer'
import bgAuth from '@assets/png/bgAuth.png'
import Logo from '@assets/svg/logo.svg'

const AuthLayout = () => {
  const navigate = useNavigate()
  const token = useAppSelector(selectToken)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  useEffect(() => {
    // If user is already authenticated (has token), redirect to dashboard
    if (isAuthenticated && token) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, token, navigate])

  return (
    <>
      <style>{`
        @media (max-width: 500px) {
          .auth-bg-container {
            background-image: none !important;
            background-color: white;
          }
        }
        @media (min-width: 501px) {
          .auth-bg-container {
            background-image: url(${bgAuth});
          }
        }
      `}</style>
      <div className="min-h-screen bg-white bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center auth-bg-container">
        <div className="flex justify-center mb-6">
          <img src={Logo} alt="Logo" className="h-[100px] w-[83px] md:h-[158px] md:w-[123px]" />
        </div>
        <Outlet />
      </div>
    </>
  )
}

export default AuthLayout
