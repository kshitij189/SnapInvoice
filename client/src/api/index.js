import axios from 'axios'

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL })

API.interceptors.request.use((req) => {
  const profile = localStorage.getItem('profile')
  if (profile) {
    const { token } = JSON.parse(profile)
    if (token) {
      req.headers.Authorization = `Bearer ${token}`
    }
  }
  return req
})

// Auth
export const signIn = (formData) => API.post('/users/signin', formData)
export const signUp = (formData) => API.post('/users/signup', formData)
export const forgot = (formData) => API.post('/users/forgot', formData)
export const resetPassword = (formData) => API.post('/users/reset', formData)

// Invoices
export const getInvoicesByUser = (searchQuery) =>
  API.get(`/invoices?searchQuery=${searchQuery}`)
export const getInvoice = (id) => API.get(`/invoices/${id}`)
export const createInvoice = (invoice) => API.post('/invoices', invoice)
export const updateInvoice = (id, updatedInvoice) =>
  API.patch(`/invoices/${id}`, updatedInvoice)
export const deleteInvoice = (id) => API.delete(`/invoices/${id}`)
export const getInvoiceCount = (searchQuery) =>
  API.get(`/invoices/count?searchQuery=${searchQuery}`)

// Clients
export const getClientsByUser = (searchQuery) =>
  API.get(`/clients/user?searchQuery=${searchQuery}`)
export const getClient = (id) => API.get(`/clients/${id}`)
export const createClient = (client) => API.post('/clients', client)
export const updateClient = (id, updatedClient) =>
  API.patch(`/clients/${id}`, updatedClient)
export const deleteClient = (id) => API.delete(`/clients/${id}`)
export const getClients = (page) => API.get(`/clients/all?page=${page}`)

// Profiles
export const getProfilesByUser = (searchQuery) =>
  API.get(`/profiles?searchQuery=${searchQuery}`)
export const getProfile = (id) => API.get(`/profiles/${id}`)
export const createProfile = (profile) => API.post('/profiles', profile)
export const updateProfile = (id, updatedProfile) =>
  API.patch(`/profiles/${id}`, updatedProfile)
export const deleteProfile = (id) => API.delete(`/profiles/${id}`)

// PDF
export const sendPdf = (pdfData) => API.post('/send-pdf', pdfData)
export const createPdf = (pdfData) => API.post('/create-pdf', pdfData)
export const fetchPdf = (pdfData) =>
  API.get('/fetch-pdf', { responseType: 'blob' })
