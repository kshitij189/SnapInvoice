import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useSnackbar } from 'notistack'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import CircularProgress from '@mui/material/CircularProgress'
import Logo from '../Logo/Logo'
import { forgot } from '../../actions/auth'
import styles from './Login.module.css'

const Forgot = () => {
  const dispatch = useDispatch()
  const { enqueueSnackbar } = useSnackbar()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    dispatch(forgot({ email }, enqueueSnackbar))
    setLoading(false)
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
        <Typography variant="h6" sx={{ mb: 1, textAlign: 'center', color: '#1e293b', fontWeight: 600 }}>
          Forgot Password
        </Typography>
        <Typography variant="body2" sx={{ mb: 3.5, textAlign: 'center', color: '#94a3b8' }}>
          Enter your email and we'll send you a reset link.
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            name="email"
            label="Email"
            type="email"
            fullWidth
            required
            size="small"
            sx={{ mb: 2.5 }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              py: 1.4,
              mb: 2.5,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: '12px',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
          </Button>
        </form>

        <Typography variant="body2" sx={{ textAlign: 'center' }}>
          <Link to="/login" style={{ color: '#6366f1', fontWeight: 600 }}>
            Back to Sign In
          </Link>
        </Typography>
      </Paper>
    </Box>
  )
}

export default Forgot
