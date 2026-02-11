import * as yup from 'yup'

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .email('Invalid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  rememberMe: yup.boolean().default(false),
})

export const registerSchema = yup.object().shape({
  firstname: yup
    .string()
    .trim()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters'),
  lastname: yup
    .string()
    .trim()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters'),
  phone: yup
    .string()
    .trim()
    .required('Phone number is required')
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
})

export const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
})

export const addCategorySchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required('Category name is required')
    .min(2, 'Category name must be at least 2 characters'),
  description: yup
    .string()
    .trim()
    .optional()
    .default(''),
})

export type LoginFormData = yup.InferType<typeof loginSchema>
export type RegisterFormData = yup.InferType<typeof registerSchema>
export type ForgotPasswordFormData = yup.InferType<typeof forgotPasswordSchema>
export type AddCategoryFormData = yup.InferType<typeof addCategorySchema>

