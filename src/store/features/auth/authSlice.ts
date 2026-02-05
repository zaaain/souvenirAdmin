import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Custom baseQuery with error handling for unauthorized responses
const baseQuery = fetchBaseQuery({ 
  baseUrl: 'http://18.130.102.234:9078/api/',
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
export const authSlice = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (body: { firstname: string; lastname: string; phone: string; password: string }) => ({
        url: 'auth/user/register',
        method: 'POST',
        body,
      }),
    }),
    login: builder.mutation({
      query: (body: { email: string; password: string }) => ({
        url: '/admin/login',
        method: 'POST',
        body,
      }),
    }),
    verifyOTP: builder.mutation({
      query: (body: { phone: string; otp: string }) => ({
        url: 'auth/user/verify/registration/otp',
        method: 'POST',
        body,
      }),
    }),
  }),
})

// Export hooks for usage in functional components
export const { useRegisterMutation, useLoginMutation, useVerifyOTPMutation } = authSlice

