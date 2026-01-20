import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import OtpInput from 'react-otp-input'
import { Button } from '@components/buttons'
import { useVerifyOTPMutation } from '@store/features/auth/authSlice'
import { setProfileData } from '@store/features/auth/authReducer'
import { useLazyGetProfileQuery } from '@store/features/profile/profileSlice'
import { useAppDispatch } from '@hooks/redux'
import { eSnack, sSnack } from '@hooks/useToast'

const OTPForm = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const [verifyOTP, { isLoading }] = useVerifyOTPMutation()
  const [getProfile] = useLazyGetProfileQuery()
  
  // Get phone from location state or use empty string
  const phone = (location.state as { phone?: string })?.phone || ''
  
  const [otp, setOtp] = useState('')
  const [timer, setTimer] = useState(60) // 60 seconds = 01:00
  const [canResend, setCanResend] = useState(false)

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    } else {
      setCanResend(true)
    }
  }, [timer])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleVerify = async () => {
    if (otp.length === 4 && phone) {
      try {
        const result = await verifyOTP({ phone, otp }).unwrap()
        console.log('OTP verified:', result)
        
        // Store profileData and token in Redux
        if (result?.data) {
          const { token, ...profileData } = result.data
          dispatch(setProfileData({
            profileData: profileData,
            token: token
          }))
        }
        
        // Call get profile API after successful OTP verification
        try {
          const profileResult = await getProfile().unwrap()
          console.log('Profile fetched:', profileResult)
          
          // Update profile data if API returns different structure
          if (profileResult?.data) {
            dispatch(setProfileData({
              profileData: profileResult.data,
              token: result?.data?.token || token
            }))
          }
        } catch (profileError) {
          console.error('Error fetching profile:', profileError)
          // Don't block navigation if profile fetch fails
        }
        
        // Show success message only if API returns a message
        if (result?.message || result?.data?.message) {
          sSnack(result?.message || result?.data?.message)
        }
        
        // Navigate to dashboard after successful verification
        navigate('')
      } catch (error: any) {
        console.error('OTP verification failed:', error)
        
        // Show error message only if API returns an error message
        if (error?.data?.message || error?.data?.error || error?.error?.data?.message) {
          const errorMessage = error?.data?.message || error?.data?.error || error?.error?.data?.message
          eSnack(errorMessage)
        }
      }
    }
  }

  const handleResend = () => {
    console.log('Resending OTP...')
    setTimer(60)
    setCanResend(false)
    setOtp('')
    // Handle resend OTP logic here
  }

  return (
    <div className="bg-white rounded-lg p-6 md:p-8 2xl:w-[30%] xl:w-[40%] lg:w-[50%] md:w-[60%] sm:w-[80%] xs:max-w-[90%]">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 text-center font-ManropeBold">
        OTP
      </h1>
      <p className="text-gray-600 text-center mb-8 font-Manrope">
        Enter the Verification Code sent.
      </p>

      <div className="space-y-6">
        <div className="flex justify-center">
          <OtpInput
            value={otp}
            onChange={setOtp}
            numInputs={4}
            renderSeparator={<span className="mx-2"></span>}
            renderInput={(props) => (
              <input
                {...props}
                className="min-w-[40px] min-h-[40px] md:min-w-[60px] md:min-h-[60px] text-center text-xl font-ManropeBold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary bg-white"
              />
            )}
            inputType="number"
          />
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600 font-Manrope">
            You will receive the code soon. Please wait{' '}
            <span className="font-ManropeBold">{formatTime(timer)}</span> to resend the code.
          </p>
        </div>

        <Button
          type="button"
          fullWidth
          disabled={otp.length !== 4 || !phone || isLoading}
          loader={isLoading}
          onClick={handleVerify}
        >
          {isLoading ? 'Verifying...' : 'Verify'}
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-600 font-Manrope">
            Didn't receive the code?{' '}
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                className="text-primary font-ManropeBold hover:underline"
              >
                Resend Code
              </button>
            ) : (
              <span className="text-primary font-ManropeBold">Resend Code</span>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

export default OTPForm
