import { combineReducers } from '@reduxjs/toolkit'
import { authSlice } from './features/auth/authSlice'
import { categorySlice } from './features/category'
import { productSlice } from './features/product'
import { profileSlice } from './features/profile/profileSlice'
import { vendorSlice } from './features/vendor/vendorSlice'
import authReducer from './features/auth/authReducer'

const rootReducer = combineReducers({
  [authSlice.reducerPath]: authSlice.reducer,
  [categorySlice.reducerPath]: categorySlice.reducer,
  [productSlice.reducerPath]: productSlice.reducer,
  [profileSlice.reducerPath]: profileSlice.reducer,
  [vendorSlice.reducerPath]: vendorSlice.reducer,
  auth: authReducer,
})

export type RootState = ReturnType<typeof rootReducer>

export default rootReducer

