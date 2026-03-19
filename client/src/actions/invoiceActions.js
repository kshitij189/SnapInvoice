import * as api from '../api'
import {
  ADD_NEW,
  UPDATE,
  DELETE,
  GET_INVOICE,
  FETCH_INVOICE_BY_USER,
  START_LOADING,
  END_LOADING,
} from '../constants/actionTypes'

export const getInvoicesByUser = (searchQuery) => async (dispatch) => {
  try {
    dispatch({ type: START_LOADING })
    const { data } = await api.getInvoicesByUser(searchQuery)
    dispatch({ type: FETCH_INVOICE_BY_USER, payload: data })
    dispatch({ type: END_LOADING })
  } catch (error) {
    console.log(error)
  }
}

export const getInvoice = (id) => async (dispatch) => {
  try {
    dispatch({ type: START_LOADING })
    const { data } = await api.getInvoice(id)
    dispatch({ type: GET_INVOICE, payload: data })
    dispatch({ type: END_LOADING })
  } catch (error) {
    console.log(error)
  }
}

export const createInvoice = (invoice, navigate, openSnackbar) => async (dispatch) => {
  try {
    dispatch({ type: START_LOADING })
    const { data } = await api.createInvoice(invoice)
    dispatch({ type: ADD_NEW, payload: data })
    dispatch({ type: END_LOADING })
    openSnackbar('Invoice created successfully')
    navigate(`/invoice/${data._id}`)
  } catch (error) {
    const message = error?.response?.data?.message || 'Something went wrong'
    openSnackbar(message)
    console.log(error)
  }
}

export const updateInvoice = (id, invoice, openSnackbar) => async (dispatch) => {
  try {
    const { data } = await api.updateInvoice(id, invoice)
    dispatch({ type: UPDATE, payload: data })
    if (openSnackbar) openSnackbar('Invoice updated successfully')
  } catch (error) {
    const message = error?.response?.data?.message || 'Something went wrong'
    if (openSnackbar) openSnackbar(message)
    console.log(error)
  }
}

export const deleteInvoice = (id, openSnackbar) => async (dispatch) => {
  try {
    await api.deleteInvoice(id)
    dispatch({ type: DELETE, payload: id })
    if (openSnackbar) openSnackbar('Invoice deleted successfully')
  } catch (error) {
    console.log(error)
  }
}
