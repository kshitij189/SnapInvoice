import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 2.5,
        px: 3,
        textAlign: 'center',
        borderTop: '1px solid #e2e8f0',
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.8rem' }}>
        &copy; {new Date().getFullYear()} SnapInvoice. Crafted with care for your business.
      </Typography>
    </Box>
  )
}

export default Footer
