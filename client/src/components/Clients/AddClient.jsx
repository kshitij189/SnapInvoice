import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useSnackbar } from 'notistack'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { createClient } from '../../actions/clientActions'

const AddClient = ({ open, onClose, editData, onUpdate }) => {
  const dispatch = useDispatch()
  const { enqueueSnackbar } = useSnackbar()
  const user = JSON.parse(localStorage.getItem('profile'))

  const initialState = editData || { name: '', email: '', phone: '', address: '' }
  const [clientData, setClientData] = useState(initialState)

  React.useEffect(() => {
    if (editData) {
      setClientData(editData)
    } else {
      setClientData({ name: '', email: '', phone: '', address: '' })
    }
  }, [editData, open])

  const handleChange = (e) => {
    setClientData({ ...clientData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editData && onUpdate) {
      onUpdate(clientData)
    } else {
      dispatch(
        createClient(
          {
            ...clientData,
            userId: user?.result?._id || user?.result?.sub,
          },
          enqueueSnackbar
        )
      )
    }
    setClientData({ name: '', email: '', phone: '', address: '' })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        {editData ? 'Edit Client' : 'Add New Client'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Name"
            name="name"
            value={clientData.name}
            onChange={handleChange}
            size="small"
            required
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={clientData.email}
            onChange={handleChange}
            size="small"
            required
          />
          <TextField
            label="Phone"
            name="phone"
            value={clientData.phone}
            onChange={handleChange}
            size="small"
          />
          <TextField
            label="Address"
            name="address"
            value={clientData.address}
            onChange={handleChange}
            size="small"
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {editData ? 'Update' : 'Add Client'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default AddClient
