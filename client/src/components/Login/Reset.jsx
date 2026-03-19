import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useSnackbar } from 'notistack'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import CircularProgress from '@mui/material/CircularProgress'
import Logo from '../Logo/Logo'
import { resetPassword } from '../../actions/auth'
import styles from './Login.module.css'

const Reset = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { enqueueSnackbar } = useSnackbar()
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      enqueueSnackbar('Passwords do not match')
      return
    }
    setLoading(true)
    dispatch(resetPassword({ password: formData.password, token }, enqueueSnackbar))
    setLoading(false)
    setTimeout(() => navigate('/login'), 2000)
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
        <Typography variant="h6" sx={{ mb: 3.5, textAlign: 'center', color: '#1e293b', fontWeight: 600 }}>
          Reset Password
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            name="password"
            label="New Password"
            type="password"
            fullWidth
            required
            size="small"
            sx={{ mb: 2 }}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <TextField
            name="confirmPassword"
            label="Confirm New Password"
            type="password"
            fullWidth
            required
            size="small"
            sx={{ mb: 2.5 }}
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              py: 1.4,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: '12px',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
          </Button>
        </form>
      </Paper>
    </Box>
  )
}

export default Reset
