import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSnackbar } from 'notistack'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import { getProfilesByUser, createProfile, updateProfile } from '../../actions/profileActions'
import Uploader from './Uploader'

const initialProfile = {
  name: '',
  email: '',
  phoneNumber: '',
  businessName: '',
  contactAddress: '',
  logo: '',
  website: '',
}

const Settings = () => {
  const dispatch = useDispatch()
  const { enqueueSnackbar } = useSnackbar()
  const { profiles, isLoading } = useSelector((state) => state.profiles)
  const user = JSON.parse(localStorage.getItem('profile'))

  const [editing, setEditing] = useState(false)
  const [profileData, setProfileData] = useState(initialProfile)

  useEffect(() => {
    const userId = user?.result?._id || user?.result?.sub
    if (userId) dispatch(getProfilesByUser(userId))
  }, [dispatch])

  useEffect(() => {
    if (profiles && profiles.length > 0) {
      setProfileData(profiles[0])
    } else if (user?.result) {
      setProfileData({
        ...initialProfile,
        name: user.result.name || `${user.result.firstName || ''} ${user.result.lastName || ''}`.trim(),
        email: user.result.email || '',
      })
    }
  }, [profiles])

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const userId = user?.result?._id || user?.result?.sub

    if (profiles && profiles.length > 0) {
      dispatch(updateProfile(profiles[0]._id, { ...profileData, userId }, enqueueSnackbar))
    } else {
      dispatch(createProfile({ ...profileData, userId }, enqueueSnackbar))
    }
    setEditing(false)
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress sx={{ color: '#6366f1' }} />
      </Box>
    )
  }

  return (
    <Box sx={{ animation: 'fadeInUp 0.5s ease-out' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: "'Poppins', sans-serif", color: '#1e293b' }}>
          Settings
        </Typography>
        {!editing && (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setEditing(true)}
            sx={{
              borderColor: '#6366f1',
              color: '#6366f1',
              borderRadius: '12px',
              px: 3,
              '&:hover': {
                borderColor: '#4f46e5',
                backgroundColor: '#eef2ff',
              },
            }}
          >
            Edit Profile
          </Button>
        )}
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          background: '#fff',
        }}
      >
        {editing ? (
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Uploader
                value={profileData.logo}
                onChange={(url) => setProfileData({ ...profileData, logo: url })}
              />
            </Box>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Full Name"
                  name="name"
                  value={profileData.name || ''}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={profileData.email || ''}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  required
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone Number"
                  name="phoneNumber"
                  value={profileData.phoneNumber || ''}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Business Name"
                  name="businessName"
                  value={profileData.businessName || ''}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Website"
                  name="website"
                  value={profileData.website || ''}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Contact Address"
                  name="contactAddress"
                  value={profileData.contactAddress || ''}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => {
                  setEditing(false)
                  if (profiles && profiles.length > 0) setProfileData(profiles[0])
                }}
                sx={{
                  borderColor: '#e2e8f0',
                  color: '#64748b',
                  borderRadius: '12px',
                  '&:hover': { borderColor: '#cbd5e1', backgroundColor: '#f8fafc' },
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  },
                }}
              >
                Save Profile
              </Button>
            </Box>
          </form>
        ) : (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              {profileData.logo ? (
                <Box
                  component="img"
                  src={profileData.logo}
                  alt="Logo"
                  sx={{
                    width: 110,
                    height: 110,
                    borderRadius: '20px',
                    objectFit: 'cover',
                    border: '3px solid #e2e8f0',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: 110,
                    height: 110,
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
                  }}
                >
                  <Typography variant="h3" sx={{ color: '#fff', fontWeight: 700, fontFamily: "'Poppins', sans-serif" }}>
                    {(profileData.name || 'U')[0].toUpperCase()}
                  </Typography>
                </Box>
              )}
            </Box>
            <Grid container spacing={3}>
              {[
                { label: 'Name', value: profileData.name },
                { label: 'Email', value: profileData.email },
                { label: 'Phone', value: profileData.phoneNumber },
                { label: 'Business', value: profileData.businessName },
                { label: 'Website', value: profileData.website },
                { label: 'Address', value: profileData.contactAddress },
              ].map(({ label, value }) => (
                <Grid item xs={12} sm={6} key={label}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #f1f5f9',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.08em', fontWeight: 600 }}>
                      {label}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: '#1e293b', mt: 0.5 }}>
                      {value || '-'}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Paper>
    </Box>
  )
}

export default Settings
