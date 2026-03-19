import React from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

const colorMap = {
  '#4caf50': { text: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
  '#10b981': { text: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
  '#ff9800': { text: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
  '#f59e0b': { text: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
  '#1976d2': { text: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
  '#6366f1': { text: '#6366f1', bg: '#eef2ff', border: '#c7d2fe' },
  '#9c27b0': { text: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
  '#f44336': { text: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
  '#d32f2f': { text: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
}

const StatCard = ({ title, value, icon, color }) => {
  const style = colorMap[color] || { text: color, bg: '#f8fafc', border: '#e2e8f0' }

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        background: '#fff',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 12px 24px -4px rgba(148, 163, 184, 0.15)',
          borderColor: '#cbd5e1',
        },
      }}
    >
      <Box 
        sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '4px', 
          height: '100%', 
          backgroundColor: style.text 
        }} 
      />
      <CardContent sx={{ p: 3, pl: 3.5, '&:last-child': { pb: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography
            variant="body2"
            sx={{ 
              color: '#64748b', 
              fontSize: '0.85rem', 
              fontWeight: 600, 
              fontFamily: "'Inter', sans-serif" 
            }}
          >
            {title}
          </Typography>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              backgroundColor: style.bg,
              border: `1px solid ${style.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {React.cloneElement(icon, { sx: { color: style.text, fontSize: 18 } })}
          </Box>
        </Box>
        <Typography
          variant="h4"
          sx={{ 
            fontWeight: 700, 
            color: '#0f172a', 
            fontFamily: "'Inter', sans-serif",
            letterSpacing: '-0.02em',
            lineHeight: 1.2
          }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default StatCard
