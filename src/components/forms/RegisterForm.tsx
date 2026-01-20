import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '@components/formsInput'
import { Button } from '@components/buttons'
import { registerSchema, RegisterFormData } from '@helpers/schemas'
import { useRegisterMutation } from '@store/features/auth/authSlice'
import { eSnack, sSnack } from '@hooks/useToast'

const RegisterForm = () => {
  const navigate = useNavigate()
  const [registerUser, { isLoading }] = useRegisterMutation()
  
  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
    trigger,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      firstname: '',
      lastname: '',
      phone: '',
      password: '',
    },
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const result = await registerUser(data).unwrap()
      console.log('Registration successful:', result)
      
      // Show success message only if API returns a message
      if (result?.message || result?.data?.message) {
        sSnack(result?.message || result?.data?.message)
      }
      
      // Navigate to OTP page after successful registration with phone number
      navigate('/auth/otp', { state: { phone: data.phone.trim(), fromRegistration: true } })
    } catch (error: any) {
      console.error('Registration failed:', error)
      
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
    
    // Trim whitespace from all fields
    const trimmedData = {
      firstname: formData.firstname?.trim() || '',
      lastname: formData.lastname?.trim() || '',
      phone: formData.phone?.trim() || '',
      password: formData.password || '',
    }

    console.log('Form values being sent:', trimmedData)

    // Call API only if validation passes
    try {
      const result = await registerUser(trimmedData).unwrap()
      console.log('Registration successful:', result)
      
      // Show success message only if API returns a message
      if (result?.message || result?.data?.message) {
        sSnack(result?.message || result?.data?.message)
      }
      
      // Navigate to OTP page after successful registration with phone number
      navigate('/auth/otp', { state: { phone: trimmedData.phone, fromRegistration: true } })
    } catch (error: any) {
      console.error('Registration failed:', error)
      
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
        Create an Account
      </h1>
      <p className="text-gray-600 text-center mb-6 font-Manrope">
        Create a account to continue
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          name="firstname"
          control={control}
          render={({ field }) => (
            <Input
              label="First Name"
              type="text"
              placeholder="First Name"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.firstname?.message}
            />
          )}
        />

        <Controller
          name="lastname"
          control={control}
          render={({ field }) => (
            <Input
              label="Last Name"
              type="text"
              placeholder="Last Name"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.lastname?.message}
            />
          )}
        />

        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <Input
              label="Phone"
              type="tel"
              placeholder="Phone Number"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.phone?.message}
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

        <Button 
          type="button" 
          fullWidth 
          disabled={isSubmitting} 
          loader={isSubmitting}
          onClick={handleButtonClick}
        >
          {isSubmitting ? 'Creating Account...' : 'Sign Up'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 font-Manrope">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-primary font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterForm

