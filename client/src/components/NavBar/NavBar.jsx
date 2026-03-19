import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import DashboardIcon from '@mui/icons-material/Dashboard'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline'
import SettingsIcon from '@mui/icons-material/Settings'
import DescriptionIcon from '@mui/icons-material/Description'
import Logo from '../Logo/Logo'

const DRAWER_WIDTH = 260

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Create Invoice', icon: <AddCircleOutlineIcon />, path: '/invoice/new' },
  { text: 'Invoices', icon: <DescriptionIcon />, path: '/invoices' },
  { text: 'Customers', icon: <PeopleOutlineIcon />, path: '/customers' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
]

const NavBar = () => {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)',
          color: '#fff',
          borderRight: 'none',
          overflowX: 'hidden',
        },
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2.5,
          py: 3,
        }}
      >
        <Logo size={42} />
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: '#fff', fontFamily: "'Poppins', sans-serif", letterSpacing: '-0.02em' }}
        >
          SnapInvoice
        </Typography>
      </Box>

      {/* Divider */}
      <Box sx={{ mx: 2.5, mb: 1, borderTop: '1px solid rgba(255,255,255,0.08)' }} />

      {/* Navigation label */}
      <Typography
        variant="overline"
        sx={{ px: 3, pt: 1, pb: 1, color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', letterSpacing: '0.1em' }}
      >
        Navigation
      </Typography>

      <List sx={{ px: 1.5 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: '12px',
                  backgroundColor: isActive
                    ? 'rgba(99, 102, 241, 0.2)'
                    : 'transparent',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                  '&:hover': {
                    backgroundColor: isActive
                      ? 'rgba(99, 102, 241, 0.25)'
                      : 'rgba(255,255,255,0.06)',
                  },
                  py: 1.2,
                  px: 2,
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? '#a5b4fc' : 'rgba(255,255,255,0.5)',
                    minWidth: 40,
                    transition: 'color 0.2s ease',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.88rem',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                    transition: 'all 0.2s ease',
                  }}
                />
                {isActive && (
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#6366f1',
                      boxShadow: '0 0 10px rgba(99, 102, 241, 0.6)',
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      {/* Bottom decoration */}
      <Box sx={{ flexGrow: 1 }} />
      <Box
        sx={{
          mx: 2,
          mb: 2,
          p: 2.5,
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.1))',
          border: '1px solid rgba(99, 102, 241, 0.15)',
        }}
      >
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem', fontWeight: 600, mb: 0.5 }}>
          Quick Tip
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', lineHeight: 1.5 }}>
          Update your business details in settings to auto-fill future invoices.
        </Typography>
        <Box
          component="span"
          onClick={() => navigate('/settings')}
          sx={{
            display: 'inline-block',
            mt: 1.5,
            color: '#a5b4fc',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'color 0.2s',
            '&:hover': { color: '#c7d2fe' },
          }}
        >
          Go to Settings →
        </Box>
      </Box>
    </Drawer>
  )
}

export default NavBar
