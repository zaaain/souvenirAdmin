export interface User {
  id: string
  email: string
  name: string
}

/** Admin profile from get profile API - stored & persisted in auth */
export interface ProfileData {
  _id: string
  createdAt: string
  email: string
  firstname: string
  lastname: string
  isActive: boolean
  role: string
  updatedAt: string
  __v?: number
}

export interface AuthState {
  user: User | null
  token: string | null
  profileData: ProfileData | null
  isAuthenticated: boolean
  isLoading: boolean
}

