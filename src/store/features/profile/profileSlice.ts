import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../../index'

// Custom baseQuery with error handling for unauthorized responses
const baseQuery = fetchBaseQuery({ 
  baseUrl: 'https://api.souvenir.live/api/',
  prepareHeaders: (headers, { getState }) => {
    // Get token from Redux state
    const token = (getState() as RootState).auth.token
    
    // If token exists, add it to headers
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    
    return headers
  },
})

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  const result = await baseQuery(args, api, extraOptions)
  
  // Check for unauthorized responses (401 or 403)
  if (result.error && (result.error.status === 401 || result.error.status === 403)) {
    // Dispatch custom event for unauthorized response
    window.dispatchEvent(new CustomEvent('unauthorized', { 
      detail: { status: result.error.status } 
    }))
  }
  
  return result
}

// Define a service using a base URL and expected endpoints
export const profileSlice = createApi({
  reducerPath: 'profileApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Profile'],
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => ({
        url: 'admin/profile',
        method: 'GET',
      }),
      providesTags: ['Profile'],
    }),
    updateProfile: builder.mutation({
      query: (body: { 
        fullName?: string
        email?: string
        phone?: string
        address?: string
        profilePicture?: string
      }) => ({
        url: 'admin/profile',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),
  }),
})

// Export hooks for usage in functional components
export const { 
  useGetProfileQuery, 
  useLazyGetProfileQuery,
  useUpdateProfileMutation 
} = profileSlice
