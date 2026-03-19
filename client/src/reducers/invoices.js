import {
  ADD_NEW,
  UPDATE,
  DELETE,
  GET_INVOICE,
  FETCH_INVOICE_BY_USER,
  FETCH_ALL,
  START_LOADING,
  END_LOADING,
} from '../constants/actionTypes'

const initialState = {
  isLoading: true,
  invoices: [],
  invoice: null,
}

const invoiceReducer = (state = initialState, action) => {
  switch (action.type) {
    case START_LOADING:
      return { ...state, isLoading: true }
    case END_LOADING:
      return { ...state, isLoading: false }
    case FETCH_ALL:
      return { ...state, invoices: action.payload }
    case FETCH_INVOICE_BY_USER:
      return { ...state, invoices: action.payload }
    case GET_INVOICE:
      return { ...state, invoice: action.payload }
    case ADD_NEW:
      return { ...state, invoices: [...state.invoices, action.payload] }
    case UPDATE:
      return {
        ...state,
        invoices: state.invoices.map((inv) =>
          inv._id === action.payload._id ? action.payload : inv
        ),
        invoice: action.payload,
      }
    case DELETE:
      return {
        ...state,
        invoices: state.invoices.filter((inv) => inv._id !== action.payload),
      }
    default:
      return state
  }
}

export default invoiceReducer
