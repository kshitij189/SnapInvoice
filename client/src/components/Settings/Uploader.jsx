import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Avatar from '@mui/material/Avatar'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'

const Uploader = ({ value, onChange }) => {
  const [loading, setLoading] = useState(false)

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', import.meta.env.VITE_UPLOAD_PRESET || '')
    formData.append('cloud_name', import.meta.env.VITE_CLOUD_NAME || '')

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      )
      const data = await res.json()
      onChange(data.secure_url)
    } catch (error) {
      console.log('Upload failed:', error)
    }
    setLoading(false)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      {value ? (
        <Avatar src={value} sx={{ width: 100, height: 100 }} variant="rounded" />
      ) : (
        <Box
          sx={{
            width: 100,
            height: 100,
            borderRadius: 2,
            border: '2px dashed #ccc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8f9fa',
          }}
        >
          <CloudUploadIcon sx={{ color: '#bbb', fontSize: 36 }} />
        </Box>
      )}
      <Button
        variant="outlined"
        component="label"
        size="small"
        disabled={loading}
        startIcon={loading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
      >
        {loading ? 'Uploading...' : 'Upload Logo'}
        <input type="file" hidden accept="image/*" onChange={handleUpload} />
      </Button>
      {value && (
        <Typography variant="caption" color="text.secondary">
          Click to change
        </Typography>
      )}
    </Box>
  )
}

export default Uploader
