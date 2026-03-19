import { combineReducers } from 'redux'
import auth from './auth'
import invoices from './invoices'
import clients from './clients'
import profiles from './profiles'

export default combineReducers({
  auth,
  invoices,
  clients,
  profiles,
})
