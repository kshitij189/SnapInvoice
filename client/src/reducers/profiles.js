import {
  CREATE_PROFILE,
  UPDATE_PROFILE,
  DELETE_PROFILE,
  FETCH_PROFILE,
  FETCH_PROFILES_BY_USER,
  FETCH_PROFILE_BY_USER,
} from '../constants/actionTypes'

const initialState = {
  isLoading: true,
  profiles: [],
  profile: null,
}

const profileReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_PROFILES_BY_USER:
      return { ...state, profiles: action.payload, isLoading: false }
    case FETCH_PROFILE_BY_USER:
      return { ...state, profiles: action.payload, isLoading: false }
    case FETCH_PROFILE:
      return { ...state, profile: action.payload, isLoading: false }
    case CREATE_PROFILE:
      return { ...state, profiles: [...state.profiles, action.payload] }
    case UPDATE_PROFILE:
      return {
        ...state,
        profiles: state.profiles.map((p) =>
          p._id === action.payload._id ? action.payload : p
        ),
      }
    case DELETE_PROFILE:
      return {
        ...state,
        profiles: state.profiles.filter((p) => p._id !== action.payload),
      }
    default:
      return state
  }
}

export default profileReducer
