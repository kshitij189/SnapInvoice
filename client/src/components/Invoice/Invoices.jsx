import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useSnackbar } from 'notistack'
import moment from 'moment'
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
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Tooltip from '@mui/material/Tooltip'
import AddIcon from '@mui/icons-material/Add'
import VisibilityIcon from '@mui/icons-material/Visibility'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import DescriptionIcon from '@mui/icons-material/Description'
import { getInvoicesByUser, deleteInvoice } from '../../actions/invoiceActions'
import { toCommas, getStatusColor } from '../../utils/utils'

const statusStyles = {
  Paid: { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' },
  Partial: { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  Unpaid: { bg: '#f1f5f9', color: '#64748b', border: '#cbd5e1' },
  Overdue: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
}

const Invoices = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { enqueueSnackbar } = useSnackbar()
  const { invoices, isLoading } = useSelector((state) => state.invoices)
  const user = JSON.parse(localStorage.getItem('profile'))

  useEffect(() => {
    const userId = user?.result?._id || user?.result?.sub
    if (userId) dispatch(getInvoicesByUser(userId))
  }, [dispatch])

  const getStatus = (inv) => {
    const received = Number(inv.totalAmountReceived) || 0
    const total = Number(inv.total) || 0
    if (inv.status === 'Paid' || received >= total) return 'Paid'
    if (received > 0 && received < total) return 'Partial'
    if (new Date(inv.dueDate) < new Date() && inv.status !== 'Paid') return 'Overdue'
    return 'Unpaid'
  }

  const handleDelete = (id) => {
    dispatch(deleteInvoice(id, enqueueSnackbar))
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
          Invoices
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/invoice/new')}
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
          New Invoice
        </Button>
      </Box>

      {!invoices || invoices.length === 0 ? (
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
            <DescriptionIcon sx={{ fontSize: 36, color: '#6366f1' }} />
          </Box>
          <Typography variant="h6" sx={{ color: '#1e293b', mb: 1, fontFamily: "'Poppins', sans-serif" }}>
            No invoices yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
            Create your first invoice to get started.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/invoice/new')}
            sx={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: '12px',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
            }}
          >
            Create Invoice
          </Button>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.8rem', borderBottom: '2px solid #f1f5f9' }}>Invoice #</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.8rem', borderBottom: '2px solid #f1f5f9' }}>Client</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.8rem', borderBottom: '2px solid #f1f5f9' }} align="right">Amount</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.8rem', borderBottom: '2px solid #f1f5f9' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.8rem', borderBottom: '2px solid #f1f5f9' }}>Due Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#64748b', fontSize: '0.8rem', borderBottom: '2px solid #f1f5f9' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((inv) => {
                const status = getStatus(inv)
                const sStyle = statusStyles[status] || statusStyles.Unpaid
                return (
                  <TableRow
                    key={inv._id}
                    sx={{
                      cursor: 'pointer',
                      '&:last-child td': { border: 0 },
                      '&:hover': { backgroundColor: '#f8fafc' },
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <TableCell
                      sx={{ fontWeight: 600, color: '#6366f1', fontSize: '0.85rem' }}
                      onClick={() => navigate(`/invoice/${inv._id}`)}
                    >
                      {inv.invoiceNumber}
                    </TableCell>
                    <TableCell
                      sx={{ color: '#1e293b', fontSize: '0.85rem' }}
                      onClick={() => navigate(`/invoice/${inv._id}`)}
                    >
                      {inv.client?.name || 'N/A'}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.85rem' }}
                      onClick={() => navigate(`/invoice/${inv._id}`)}
                    >
                      {inv.currency} {toCommas(Number(inv.total || 0).toFixed(2))}
                    </TableCell>
                    <TableCell onClick={() => navigate(`/invoice/${inv._id}`)}>
                      <Chip
                        label={status}
                        size="small"
                        sx={{
                          backgroundColor: sStyle.bg,
                          color: sStyle.color,
                          border: `1px solid ${sStyle.border}`,
                          fontWeight: 600,
                          fontSize: '0.72rem',
                        }}
                      />
                    </TableCell>
                    <TableCell
                      sx={{ color: '#64748b', fontSize: '0.85rem' }}
                      onClick={() => navigate(`/invoice/${inv._id}`)}
                    >
                      {moment(inv.dueDate).format('MMM DD, YYYY')}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/invoice/${inv._id}`)}
                          sx={{ color: '#64748b', '&:hover': { color: '#6366f1', backgroundColor: '#eef2ff' } }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/invoice/edit/${inv._id}`)}
                          sx={{ color: '#64748b', '&:hover': { color: '#f59e0b', backgroundColor: '#fffbeb' } }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(inv._id)}
                          sx={{ color: '#64748b', '&:hover': { color: '#ef4444', backgroundColor: '#fef2f2' } }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}

export default Invoices
