import React from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '@components/formsInput'
import { Button } from '@components/buttons'
import { forgotPasswordSchema, ForgotPasswordFormData } from '@helpers/schemas'

const ForgotPasswordForm = () => {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    console.log('Forgot password data:', data)
    // Handle forgot password logic here
    // After successful submission, navigate to OTP page
    navigate('/auth/otp')
  }

  return (
    <div className="bg-white rounded-lg p-4 md:p-8  2xl:w-[30%] xl:w-[40%] lg:w-[50%] md:w-[60%] sm:w-[80%] xs:max-w-[90%]">
      <h1 className="text-3xl  md:text-4xl font-bold text-gray-800 mb-2 text-center font-ManropeBold">
        Forgot Password
      </h1>
      <p className="text-gray-600 text-center mb-6 font-Manrope">
        Enter your email address and we'll send you a verification code
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="Email"
          {...register('email')}
          error={errors.email?.message}
        />

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send Code'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 font-Manrope">
          Remember your password?{' '}
          <Link to="/auth/login" className="text-primary font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPasswordForm

