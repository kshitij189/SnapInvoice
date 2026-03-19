import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Logo from '../Logo/Logo'
import { useDispatch } from 'react-redux'
import { GoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import { useSnackbar } from 'notistack'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import { signIn, signUp } from '../../actions/auth'
import { AUTH } from '../../constants/actionTypes'
import { createProfile } from '../../actions/profileActions'
import styles from './Login.module.css'

const initialSignIn = { email: '', password: '' }
const initialSignUp = { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' }

const Login = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { enqueueSnackbar } = useSnackbar()
  const [isSignup, setIsSignup] = useState(false)
  const [formData, setFormData] = useState(initialSignIn)
  const [loading, setLoading] = useState(false)

  const switchMode = () => {
    setIsSignup((prev) => !prev)
    setFormData(isSignup ? initialSignIn : initialSignUp)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    if (isSignup) {
      if (formData.password !== formData.confirmPassword) {
        enqueueSnackbar('Passwords do not match')
        setLoading(false)
        return
      }
      dispatch(signUp(formData, navigate, enqueueSnackbar))
    } else {
      dispatch(signIn(formData, navigate, enqueueSnackbar))
    }
    setLoading(false)
  }

  const googleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential)
      const result = {
        _id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        firstName: decoded.given_name,
        lastName: decoded.family_name,
        avatar: decoded.picture,
      }
      const token = credentialResponse.credential
      dispatch({ type: AUTH, data: { result, token } })
      dispatch(
        createProfile({
          name: result.name,
          email: result.email,
          userId: result._id,
          phoneNumber: '',
          businessName: '',
          contactAddress: '',
          logo: result.avatar,
          website: '',
        })
      )
      navigate('/dashboard')
    } catch (error) {
      console.log(error)
      enqueueSnackbar('Google Sign In failed')
    }
  }

  return (
    <Box className={styles.wrapper}>
      <Box className={styles.bgGradient} />
      <Box className={styles.bgOrb1} />
      <Box className={styles.bgOrb2} />
      <Box className={styles.bgGrid} />

      <Paper elevation={0} className={styles.card}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, justifyContent: 'center' }}>
          <Logo size={40} />
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            SnapInvoice
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ mb: 3.5, textAlign: 'center', color: '#64748b', fontWeight: 400, fontSize: '0.95rem' }}>
          {isSignup ? 'Create your account to get started' : 'Welcome back! Sign in to continue'}
        </Typography>

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                name="firstName"
                label="First Name"
                fullWidth
                required
                size="small"
                value={formData.firstName || ''}
                onChange={handleChange}
              />
              <TextField
                name="lastName"
                label="Last Name"
                fullWidth
                required
                size="small"
                value={formData.lastName || ''}
                onChange={handleChange}
              />
            </Box>
          )}
          <TextField
            name="email"
            label="Email"
            type="email"
            fullWidth
            required
            size="small"
            sx={{ mb: 2 }}
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            name="password"
            label="Password"
            type="password"
            fullWidth
            required
            size="small"
            sx={{ mb: 2 }}
            value={formData.password}
            onChange={handleChange}
          />
          {isSignup && (
            <TextField
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              fullWidth
              required
              size="small"
              sx={{ mb: 2 }}
              value={formData.confirmPassword || ''}
              onChange={handleChange}
            />
          )}

          {!isSignup && (
            <Box sx={{ textAlign: 'right', mb: 2 }}>
              <Link to="/forgot" style={{ color: '#6366f1', fontSize: '0.85rem', fontWeight: 500 }}>
                Forgot Password?
              </Link>
            </Box>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              py: 1.4,
              mb: 2.5,
              fontWeight: 600,
              fontSize: '0.95rem',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: '12px',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
              },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : isSignup ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        <Divider sx={{ mb: 2.5, color: '#94a3b8', fontSize: '0.8rem' }}>or continue with</Divider>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2.5 }}>
          <GoogleLogin
            onSuccess={googleSuccess}
            onError={() => enqueueSnackbar('Google Sign In failed')}
            shape="rectangular"
            width="100%"
          />
        </Box>

        <Typography variant="body2" sx={{ textAlign: 'center', color: '#64748b' }}>
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <Box
            component="span"
            sx={{
              color: '#6366f1',
              cursor: 'pointer',
              fontWeight: 600,
              '&:hover': { textDecoration: 'underline' },
            }}
            onClick={switchMode}
          >
            {isSignup ? 'Sign In' : 'Sign Up'}
          </Box>
        </Typography>
      </Paper>
    </Box>
  )
}

export default Login
