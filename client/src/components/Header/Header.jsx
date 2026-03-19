import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Avatar from '@mui/material/Avatar'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import ListItemIcon from '@mui/material/ListItemIcon'
import LogoutIcon from '@mui/icons-material/Logout'
import PersonIcon from '@mui/icons-material/Person'
import { LOGOUT } from '../../constants/actionTypes'

const Header = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [anchorEl, setAnchorEl] = useState(null)
  const user = JSON.parse(localStorage.getItem('profile'))

  const handleLogout = () => {
    dispatch({ type: LOGOUT })
    navigate('/login')
    setAnchorEl(null)
  }

  const userName = user?.result?.name || user?.result?.firstName || 'User'
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        ml: '260px',
        width: 'calc(100% - 260px)',
        zIndex: (theme) => theme.zIndex.drawer - 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'flex-end', minHeight: '64px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" sx={{ color: '#1e293b', fontWeight: 600, lineHeight: 1.2 }}>
              {userName}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
              {user?.result?.email || ''}
            </Typography>
          </Box>
          <IconButton
            onClick={(e) => setAnchorEl(e.currentTarget)}
            size="small"
            sx={{
              p: 0.5,
              border: '2px solid transparent',
              background: 'linear-gradient(#fff, #fff) padding-box, linear-gradient(135deg, #6366f1, #8b5cf6) border-box',
              borderRadius: '50%',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
              src={user?.result?.avatar}
            >
              {initials}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 180,
                borderRadius: '14px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                border: '1px solid #e2e8f0',
              },
            }}
          >
            <MenuItem
              onClick={() => { navigate('/settings'); setAnchorEl(null) }}
              sx={{ py: 1.2, borderRadius: '8px', mx: 0.5, '&:hover': { backgroundColor: '#f1f5f9' } }}
            >
              <ListItemIcon><PersonIcon fontSize="small" sx={{ color: '#6366f1' }} /></ListItemIcon>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>Settings</Typography>
            </MenuItem>
            <MenuItem
              onClick={handleLogout}
              sx={{ py: 1.2, borderRadius: '8px', mx: 0.5, '&:hover': { backgroundColor: '#fef2f2' } }}
            >
              <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: '#ef4444' }} /></ListItemIcon>
              <Typography variant="body2" sx={{ fontWeight: 500, color: '#ef4444' }}>Logout</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Header
