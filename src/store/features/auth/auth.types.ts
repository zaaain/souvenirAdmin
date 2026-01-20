export interface User {
  id: string
  email: string
  name: string
}

export interface ProfileData {
  _id: string
  phone: string
  firstname: string
  lastname: string
  isActive: boolean
  status: string
  createdAt: string
  updatedAt: string
  _v: number
  isPhoneVerified: boolean
  passwordResetToken: string | null
}

export interface AuthState {
  user: User | null
  token: string | null
  profileData: ProfileData | null
  isAuthenticated: boolean
  isLoading: boolean
}

