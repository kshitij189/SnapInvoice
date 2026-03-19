import React from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import Logo from '../Logo/Logo'
import BoltIcon from '@mui/icons-material/Bolt'
import TrackChangesIcon from '@mui/icons-material/TrackChanges'
import PeopleIcon from '@mui/icons-material/People'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import styles from './Home.module.css'

const Home = () => {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('profile'))

  return (
    <Box className={styles.wrapper}>
      {/* Animated background layers */}
      <Box className={styles.bgGradient} />
      <Box className={styles.orb1} />
      <Box className={styles.orb2} />
      <Box className={styles.orb3} />
      <Box className={styles.gridOverlay} />

      <Box className={styles.content}>
        {/* Navigation */}
        <Box className={styles.nav}>
          <Box className={styles.logo}>
            <Logo size={42} />
            <Typography
              variant="h5"
              sx={{ color: '#fff', fontWeight: 700, fontFamily: "'Poppins', sans-serif", letterSpacing: '-0.02em' }}
            >
              SnapInvoice
            </Typography>
          </Box>
          <Button
            variant="outlined"
            sx={{
              color: '#fff',
              borderColor: 'rgba(255,255,255,0.2)',
              borderRadius: '50px',
              px: 3,
              backdropFilter: 'blur(10px)',
              background: 'rgba(255,255,255,0.05)',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.4)',
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
            }}
            onClick={() => navigate(user ? '/dashboard' : '/login')}
          >
            {user ? 'Dashboard' : 'Sign In'}
          </Button>
        </Box>

        {/* Hero Section */}
        <Container maxWidth="lg" className={styles.hero} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box className={styles.badge}>
            <AutoAwesomeIcon sx={{ fontSize: 16 }} />
            Smart Invoicing Platform
          </Box>

          <Typography variant="h1" className={styles.title}>
            Invoicing Made{' '}
            <span className={styles.titleGradient}>Effortless</span>
            {' '}for Your Business
          </Typography>

          <Typography variant="h6" className={styles.subtitle}>
            Create stunning invoices, track payments in real-time, and manage your clients
            — all in one beautifully designed platform built for freelancers and small businesses.
          </Typography>

          <Box className={styles.cta}>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/login')}
              sx={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff',
                fontWeight: 600,
                px: 4.5,
                py: 1.8,
                fontSize: '1rem',
                borderRadius: '50px',
                boxShadow: '0 8px 30px rgba(99, 102, 241, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  boxShadow: '0 12px 40px rgba(99, 102, 241, 0.5)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              Get Started Free
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/login')}
              sx={{
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.2)',
                borderRadius: '50px',
                px: 4.5,
                py: 1.8,
                fontSize: '1rem',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.5)',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                },
              }}
            >
              Learn More
            </Button>
          </Box>

          {/* Feature Cards */}
          <Box className={styles.features}>
            {[
              {
                title: 'Create Invoices',
                desc: 'Generate professional, ready-to-send PDF invoices and email them directly to your clients in seconds.',
                icon: <BoltIcon sx={{ fontSize: 26, color: '#fbbf24' }} />,
                iconBg: 'rgba(251, 191, 36, 0.15)',
              },
              {
                title: 'Track Payments',
                desc: 'Easily monitor paid, partially paid, and overdue balances to keep your cash flow healthy and organized.',
                icon: <TrackChangesIcon sx={{ fontSize: 26, color: '#34d399' }} />,
                iconBg: 'rgba(52, 211, 153, 0.15)',
              },
              {
                title: 'Smart Analytics',
                desc: 'Clean, beautiful dashboards that automatically track your revenue in your preferred local currency.',
                icon: <AutoAwesomeIcon sx={{ fontSize: 26, color: '#a78bfa' }} />,
                iconBg: 'rgba(167, 139, 250, 0.15)',
              },
            ].map((f) => (
              <Box key={f.title} className={styles.featureCard}>
                <Box
                  className={styles.featureIcon}
                  sx={{ backgroundColor: f.iconBg }}
                >
                  {f.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, fontSize: '1.1rem' }}>
                  {f.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
                  {f.desc}
                </Typography>
              </Box>
            ))}
          </Box>

        </Container>

        {/* Footer */}
        <Box className={styles.footer}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>
            &copy; {new Date().getFullYear()} SnapInvoice. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default Home
