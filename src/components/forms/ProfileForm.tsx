import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Input } from '@components/formsInput'
import { Button } from '@components/buttons'
import { useAppSelector } from '@hooks/redux'
import { selectProfileData } from '@store/features/auth/authReducer'

interface ProfileFormData {
  fullName: string
  email: string
  phone: string
  address: string
}

const ProfileForm = () => {
  const profileData = useAppSelector(selectProfileData)
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    defaultValues: {
      fullName: profileData?.firstname && profileData?.lastname 
        ? `${profileData.firstname} ${profileData.lastname}` 
        : '',
      email: profileData?.email || '',
      phone: '',
      address: '',
    },
  })

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePicture(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true)
    try {
      console.log('Profile data:', data)
      // API integration will be added here
      // await updateProfile(data)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    reset()
    setProfilePicture(null)
  }

  return (
    <div className="w-full  mx-auto">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 font-ManropeBold">
            Edit Profile
          </h1>
          <p className="text-gray-600 font-Manrope">
            Update your profile information
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            loader={isSubmitting}
            className="px-6"
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* Personal Information Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 font-ManropeBold">
          Personal Information
        </h2>

        {/* Profile Picture Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8 pb-8 border-b border-gray-200">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <svg
                    className="w-8 h-8 md:w-12 md:h-12 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 mb-2 font-ManropeBold">
              Profile Picture
            </h3>
            <p className="text-sm text-gray-600 mb-4 font-Manrope">
              Upload a photo for shipper's profile
            </p>
            <label className="inline-block">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="profile-picture-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('profile-picture-upload')?.click()}
                className="px-4 py-2"
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span>Upload New Picture</span>
                </div>
              </Button>
            </label>
          </div>
        </div>

        {/* Form Fields - Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <Controller
            name="fullName"
            control={control}
            rules={{ required: 'Full name is required' }}
            render={({ field }) => (
              <Input
                label="Full Name"
                type="text"
                placeholder="Full Name"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.fullName?.message}
              />
            )}
          />

          {/* Email */}
          <Controller
            name="email"
            control={control}
            rules={{
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            }}
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

          {/* Phone */}
          <Controller
            name="phone"
            control={control}
            rules={{ required: 'Phone is required' }}
            render={({ field }) => (
              <Input
                label="Phone"
                type="tel"
                placeholder="Phone"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.phone?.message}
              />
            )}
          />

          {/* Address */}
          <Controller
            name="address"
            control={control}
            rules={{ required: 'Address is required' }}
            render={({ field }) => (
              <Input
                label="Address"
                type="text"
                placeholder="Address"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.address?.message}
              />
            )}
          />
        </div>
      </div>
    </div>
  )
}

export default ProfileForm
