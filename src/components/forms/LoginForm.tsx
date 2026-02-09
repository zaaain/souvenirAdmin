import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '@components/formsInput'
import { Button } from '@components/buttons'
import { loginSchema, LoginFormData } from '@helpers/schemas'
import { useLoginMutation } from '@store/features/auth/authSlice'
import { setProfileData } from '@store/features/auth/authReducer'
import { useLazyGetProfileQuery } from '@store/features/profile/profileSlice'
import { useAppDispatch } from '@hooks/redux'
import { eSnack, sSnack } from '@hooks/useToast'

const LoginForm = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [loginUser, { isLoading }] = useLoginMutation()
  const [getProfile] = useLazyGetProfileQuery()
  
  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
    trigger,
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      const loginData = {
        email: data.email.trim(),
        password: data.password,
      }
      const result = await loginUser(loginData).unwrap()
      console.log('Login successful:', result)
      
      // Store profileData and token in Redux
      if (result?.data) {
        const { token, ...profileData } = result.data
        dispatch(setProfileData({
          profileData: profileData,
          token: token
        }))
      }
      
      // Show success message only if API returns a message
      if (result?.message || result?.data?.message) {
        sSnack(result?.message || result?.data?.message)
      }
      
      // Navigate to dashboard after successful login
      navigate('')
    } catch (error: any) {
      console.error('Login failed:', error)
      
      // Show error message only if API returns an error message
      if (error?.data?.message || error?.data?.error || error?.error?.data?.message) {
        const errorMessage = error?.data?.message || error?.data?.error || error?.error?.data?.message
        eSnack(errorMessage)
      }
    }
  }

  const handleButtonClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    
    // Trigger validation first
    const isValid = await trigger()
    
    // If validation fails, errors will show below inputs automatically
    if (!isValid) {
      return
    }
    
    // Get values from controlled inputs
    const formData = getValues()
    
    // Trim whitespace from email
    const loginData = {
      email: formData.email?.trim() || '',
      password: formData.password || '',
    }

    console.log('Login data being sent:', loginData)

    // Call API only if validation passes
    try {
      const result = await loginUser(loginData).unwrap()
      console.log('Login successful:', result)
      
      // Store profileData and token in Redux
      let token = ''
      if (result?.data) {
        const { token: authToken, ...profileData } = result.data
        token = authToken
        dispatch(setProfileData({
          profileData: profileData,
          token: authToken
        }))
      }
      
      // Call get profile API after successful login
      try {
        const profileResult = await getProfile(undefined).unwrap()
        console.log('Profile fetched:', profileResult)
        if (profileResult?.data) {
          dispatch(setProfileData({
            profileData: profileResult.data,
            token: token,
          }))
        }
      } catch (profileError) {
        console.error('Error fetching profile:', profileError)
      }

      // Show success message only if API returns a message
      if (result?.message || result?.data?.message) {
        sSnack(result?.message || result?.data?.message)
      }
      
      // Navigate to dashboard after successful login
      navigate('')
    } catch (error: any) {
      console.error('Login failed:', error)
      
      // Show error message only if API returns an error message (not schema errors)
      if (error?.data?.message || error?.data?.error || error?.error?.data?.message) {
        const errorMessage = error?.data?.message || error?.data?.error || error?.error?.data?.message
        eSnack(errorMessage)
      }
    }
  }

  const isSubmitting = isLoading

  return (
    <div className="bg-white rounded-lg p-4 md:p-8  2xl:w-[30%] xl:w-[40%] lg:w-[50%] md:w-[60%] sm:w-[80%] xs:max-w-[90%]">
      <h1 className="text-3xl  md:text-4xl font-bold text-gray-800 mb-2 text-center font-ManropeBold">
        Login to Account
      </h1>
      <p className="text-gray-600 text-center mb-6 font-Manrope">
        Please enter your email and password to continue
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input
              label="Email"
              type="email"
              placeholder="Email"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <Input
              label="Password"
              type="password"
              placeholder="Password"
              showPasswordToggle
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.password?.message}
            />
          )}
        />

        <div className="flex items-center justify-between">
          <Controller
            name="rememberMe"
            control={control}
            render={({ field }) => (
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 font-Manrope">Remember me</span>
              </label>
            )}
          />
          <Link
            to="/auth/forgot-password"
            className="text-sm text-primary font-Manrope"
          >
            Forget Password?
          </Link>
        </div>

        <Button 
          type="button" 
          fullWidth 
          disabled={isSubmitting} 
          loader={isSubmitting}
          onClick={handleButtonClick}
        >
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>

      {/* <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 font-Manrope">
          Don't have an account?{' '}
          <Link to="/auth/register" className="text-primary font-semibold">
            Sign Up
          </Link>
        </p>
      </div> */}

      <div className="mt-4 flex justify-center space-x-4 text-sm">
        <Link to="/terms" className="text-primary font-Manrope">
          Terms of Service
        </Link>
        <span className="text-gray-300">|</span>
        <Link to="/privacy" className="text-primary font-Manrope">
          Privacy Policy
        </Link>
      </div>
    </div>
  )
}

export default LoginForm

