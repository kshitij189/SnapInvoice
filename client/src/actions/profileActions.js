import * as api from '../api'
import {
  CREATE_PROFILE,
  UPDATE_PROFILE,
  DELETE_PROFILE,
  FETCH_PROFILE,
  FETCH_PROFILES_BY_USER,
} from '../constants/actionTypes'

export const getProfilesByUser = (searchQuery) => async (dispatch) => {
  try {
    const { data } = await api.getProfilesByUser(searchQuery)
    dispatch({ type: FETCH_PROFILES_BY_USER, payload: data })
  } catch (error) {
    console.log(error)
  }
}

export const getProfile = (id) => async (dispatch) => {
  try {
    const { data } = await api.getProfile(id)
    dispatch({ type: FETCH_PROFILE, payload: data })
  } catch (error) {
    console.log(error)
  }
}

export const createProfile = (profile, openSnackbar) => async (dispatch) => {
  try {
    const { data } = await api.createProfile(profile)
    dispatch({ type: CREATE_PROFILE, payload: data })
    if (openSnackbar) openSnackbar('Profile created successfully')
  } catch (error) {
    const message = error?.response?.data?.message || 'Something went wrong'
    if (openSnackbar) openSnackbar(message)
    console.log(error)
  }
}

export const updateProfile = (id, profile, openSnackbar) => async (dispatch) => {
  try {
    const { data } = await api.updateProfile(id, profile)
    dispatch({ type: UPDATE_PROFILE, payload: data })
    if (openSnackbar) openSnackbar('Profile updated successfully')
  } catch (error) {
    console.log(error)
  }
}

export const deleteProfile = (id, openSnackbar) => async (dispatch) => {
  try {
    await api.deleteProfile(id)
    dispatch({ type: DELETE_PROFILE, payload: id })
    if (openSnackbar) openSnackbar('Profile deleted successfully')
  } catch (error) {
    console.log(error)
  }
}
