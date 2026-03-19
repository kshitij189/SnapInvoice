import {
  ADD_NEW_CLIENT,
  UPDATE_CLIENT,
  DELETE_CLIENT,
  FETCH_CLIENTS_BY_USER,
  FETCH_CLIENT,
  ALL_CLIENTS,
} from '../constants/actionTypes'

const initialState = {
  isLoading: true,
  clients: [],
  client: null,
}

const clientReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_CLIENTS_BY_USER:
      return { ...state, clients: action.payload, isLoading: false }
    case ALL_CLIENTS:
      return { ...state, clients: action.payload, isLoading: false }
    case FETCH_CLIENT:
      return { ...state, client: action.payload, isLoading: false }
    case ADD_NEW_CLIENT:
      return { ...state, clients: [...state.clients, action.payload] }
    case UPDATE_CLIENT:
      return {
        ...state,
        clients: state.clients.map((c) =>
          c._id === action.payload._id ? action.payload : c
        ),
      }
    case DELETE_CLIENT:
      return {
        ...state,
        clients: state.clients.filter((c) => c._id !== action.payload),
      }
    default:
      return state
  }
}

export default clientReducer
