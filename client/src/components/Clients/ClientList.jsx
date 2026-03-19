import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSnackbar } from 'notistack'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import CircularProgress from '@mui/material/CircularProgress'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline'
import { getClientsByUser, deleteClient, updateClient } from '../../actions/clientActions'
import AddClient from './AddClient'

const ClientList = () => {
  const dispatch = useDispatch()
  const { enqueueSnackbar } = useSnackbar()
  const { clients, isLoading } = useSelector((state) => state.clients)
  const user = JSON.parse(localStorage.getItem('profile'))

  const [openModal, setOpenModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [page, setPage] = useState(0)
  const rowsPerPage = 8

  useEffect(() => {
    const userId = user?.result?._id || user?.result?.sub
    if (userId) dispatch(getClientsByUser(userId))
  }, [dispatch])

  const handleDelete = (id) => {
    dispatch(deleteClient(id, enqueueSnackbar))
  }

  const handleEdit = (client) => {
    setEditData(client)
    setOpenModal(true)
  }

  const handleUpdate = (data) => {
    dispatch(updateClient(editData._id, data, enqueueSnackbar))
    setEditData(null)
  }

  const handleCloseModal = () => {
    setOpenModal(false)
    setEditData(null)
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress sx={{ color: '#6366f1' }} />
      </Box>
    )
  }

  const paginatedClients = clients
    ? clients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : []

  return (
    <Box sx={{ animation: 'fadeInUp 0.5s ease-out' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: "'Poppins', sans-serif", color: '#1e293b' }}>
          Customers
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditData(null)
            setOpenModal(true)
          }}
          sx={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: '12px',
            px: 3,
            py: 1.2,
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
            },
          }}
        >
          Add Client
        </Button>
      </Box>

      {!clients || clients.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            background: '#fff',
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <PeopleOutlineIcon sx={{ fontSize: 36, color: '#6366f1' }} />
          </Box>
          <Typography variant="h6" sx={{ color: '#1e293b', mb: 1, fontFamily: "'Poppins', sans-serif" }}>
            No clients yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
            Add your first client to get started.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenModal(true)}
            sx={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: '12px',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
            }}
          >
            Add Client
          </Button>
        </Paper>
      ) : (
        <Paper
          elevation={0}
          sx={{
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.8rem', borderBottom: '2px solid #f1f5f9' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.8rem', borderBottom: '2px solid #f1f5f9' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.8rem', borderBottom: '2px solid #f1f5f9' }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.8rem', borderBottom: '2px solid #f1f5f9' }}>Address</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.8rem', borderBottom: '2px solid #f1f5f9' }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedClients.map((client) => (
                  <TableRow
                    key={client._id}
                    sx={{
                      '&:hover': { backgroundColor: '#f8fafc' },
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.85rem' }}>{client.name}</TableCell>
                    <TableCell sx={{ color: '#64748b', fontSize: '0.85rem' }}>{client.email}</TableCell>
                    <TableCell sx={{ color: '#64748b', fontSize: '0.85rem' }}>{client.phone || '-'}</TableCell>
                    <TableCell sx={{ color: '#64748b', fontSize: '0.85rem' }}>{client.address || '-'}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(client)}
                          sx={{ color: '#64748b', '&:hover': { color: '#f59e0b', backgroundColor: '#fffbeb' } }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(client._id)}
                          sx={{ color: '#64748b', '&:hover': { color: '#ef4444', backgroundColor: '#fef2f2' } }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={clients.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[]}
            sx={{ borderTop: '1px solid #f1f5f9' }}
          />
        </Paper>
      )}

      <AddClient
        open={openModal}
        onClose={handleCloseModal}
        editData={editData}
        onUpdate={handleUpdate}
      />
    </Box>
  )
}

export default ClientList
