import * as api from '../api'
import {
  ADD_NEW_CLIENT,
  UPDATE_CLIENT,
  DELETE_CLIENT,
  FETCH_CLIENTS_BY_USER,
  FETCH_CLIENT,
} from '../constants/actionTypes'

export const getClientsByUser = (searchQuery) => async (dispatch) => {
  try {
    const { data } = await api.getClientsByUser(searchQuery)
    dispatch({ type: FETCH_CLIENTS_BY_USER, payload: data })
  } catch (error) {
    console.log(error)
  }
}

export const getClient = (id) => async (dispatch) => {
  try {
    const { data } = await api.getClient(id)
    dispatch({ type: FETCH_CLIENT, payload: data })
  } catch (error) {
    console.log(error)
  }
}

export const createClient = (client, openSnackbar) => async (dispatch) => {
  try {
    const { data } = await api.createClient(client)
    dispatch({ type: ADD_NEW_CLIENT, payload: data })
    if (openSnackbar) openSnackbar('Client added successfully')
  } catch (error) {
    const message = error?.response?.data?.message || 'Something went wrong'
    if (openSnackbar) openSnackbar(message)
    console.log(error)
  }
}

export const updateClient = (id, client, openSnackbar) => async (dispatch) => {
  try {
    const { data } = await api.updateClient(id, client)
    dispatch({ type: UPDATE_CLIENT, payload: data })
    if (openSnackbar) openSnackbar('Client updated successfully')
  } catch (error) {
    console.log(error)
  }
}

export const deleteClient = (id, openSnackbar) => async (dispatch) => {
  try {
    await api.deleteClient(id)
    dispatch({ type: DELETE_CLIENT, payload: id })
    if (openSnackbar) openSnackbar('Client deleted successfully')
  } catch (error) {
    console.log(error)
  }
}
