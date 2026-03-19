import * as api from '../api'
import { AUTH } from '../constants/actionTypes'

export const signIn = (formData, navigate, openSnackbar) => async (dispatch) => {
  try {
    const { data } = await api.signIn(formData)
    dispatch({ type: AUTH, data })
    navigate('/dashboard')
    openSnackbar('Signed in successfully')
  } catch (error) {
    const message = error?.response?.data?.message || 'Something went wrong'
    openSnackbar(message)
    console.log(error)
  }
}

export const signUp = (formData, navigate, openSnackbar) => async (dispatch) => {
  try {
    const { data } = await api.signUp(formData)
    dispatch({ type: AUTH, data })
    navigate('/dashboard')
    openSnackbar('Signed up successfully')
  } catch (error) {
    const message = error?.response?.data?.message || 'Something went wrong'
    openSnackbar(message)
    console.log(error)
  }
}

export const forgot = (formData, openSnackbar) => async () => {
  try {
    await api.forgot(formData)
    openSnackbar('Password reset link sent to your email')
  } catch (error) {
    const message = error?.response?.data?.message || 'Something went wrong'
    openSnackbar(message)
    console.log(error)
  }
}

export const resetPassword = (formData, openSnackbar) => async () => {
  try {
    await api.resetPassword(formData)
    openSnackbar('Password reset successful. You can now log in.')
  } catch (error) {
    const message = error?.response?.data?.message || 'Something went wrong'
    openSnackbar(message)
    console.log(error)
  }
}
