import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../index'
import { AuthState, User, ProfileData } from './auth.types'

const initialState: AuthState = {
  user: null,
  token: null,
  profileData: null,
  isAuthenticated: false,
  isLoading: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
    },
    setProfileData: (
      state,
      action: PayloadAction<{ profileData: ProfileData; token: string }>
    ) => {
      state.profileData = action.payload.profileData
      state.token = action.payload.token
      state.isAuthenticated = true
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.profileData = null
      state.isAuthenticated = false
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
  },
})

export const { setCredentials, setProfileData, logout, setLoading } = authSlice.actions

// Selectors
export const selectAuth = (state: RootState) => state.auth
export const selectUser = (state: RootState) => state.auth.user
export const selectProfileData = (state: RootState) => state.auth.profileData
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated
export const selectToken = (state: RootState) => state.auth.token

export default authSlice.reducer
