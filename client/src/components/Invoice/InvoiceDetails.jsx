import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useSnackbar } from 'notistack'
import { saveAs } from 'file-saver'
import moment from 'moment'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SendIcon from '@mui/icons-material/Send'
import DownloadIcon from '@mui/icons-material/Download'
import PaymentIcon from '@mui/icons-material/Payment'
import { getInvoice, deleteInvoice, updateInvoice } from '../../actions/invoiceActions'
import { getProfilesByUser } from '../../actions/profileActions'
import { sendPdf, createPdf, fetchPdf } from '../../api'
import { toCommas, getStatusColor } from '../../utils/utils'
import AddPayment from './AddPayment'
import PaymentHistory from './PaymentHistory'
import styles from './InvoiceDetails.module.css'

const InvoiceDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { enqueueSnackbar } = useSnackbar()
  const { invoice, isLoading } = useSelector((state) => state.invoices)
  const { profiles } = useSelector((state) => state.profiles)
  const user = JSON.parse(localStorage.getItem('profile'))

  const [openPayment, setOpenPayment] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [sendEmail, setSendEmail] = useState('')
  const [openSend, setOpenSend] = useState(false)
  const [sendLoading, setSendLoading] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)

  useEffect(() => {
    if (id) dispatch(getInvoice(id))
  }, [id, dispatch])

  useEffect(() => {
    const userId = user?.result?._id || user?.result?.sub
    if (userId) dispatch(getProfilesByUser(userId))
  }, [dispatch])

  const profile = profiles && profiles.length > 0 ? profiles[0] : null

  const getStatus = () => {
    if (!invoice) return 'Unpaid'
    const received = Number(invoice.totalAmountReceived) || 0
    const total = Number(invoice.total) || 0
    if (invoice.status === 'Paid' || received >= total) return 'Paid'
    if (received > 0 && received < total) return 'Partial'
    if (new Date(invoice.dueDate) < new Date() && invoice.status !== 'Paid') return 'Overdue'
    return 'Unpaid'
  }

  const handleDelete = () => {
    dispatch(deleteInvoice(id, enqueueSnackbar))
    navigate('/invoices')
    setOpenDelete(false)
  }

  const handleSendPdf = async () => {
    setSendLoading(true)
    try {
      const received = Number(invoice.totalAmountReceived) || 0
      const total = Number(invoice.total) || 0
      const balance = Math.max(0, total - received)

      await sendPdf({
        name: profile?.name || user?.result?.name,
        email: sendEmail,
        company: profile?.businessName || 'SnapInvoice',
        phone: profile?.phoneNumber || '',
        address: profile?.contactAddress || '',
        balance: balance,
        currency: invoice.currency || 'USD',
        link: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/public/pdf/${invoice._id}`,
        invoiceData: invoice,
        profileData: profile,
      })
      enqueueSnackbar('Invoice sent successfully')
      setOpenSend(false)
    } catch (error) {
      enqueueSnackbar('Failed to send invoice')
    }
    setSendLoading(false)
  }

  const handleDownloadPdf = async () => {
    setDownloadLoading(true)
    try {
      await createPdf({
        name: profile?.name || user?.result?.name,
        company: profile?.businessName || 'SnapInvoice',
        phone: profile?.phoneNumber || '',
        address: profile?.contactAddress || '',
        invoiceData: invoice,
        profileData: profile,
      })
      const { data } = await fetchPdf()
      const blob = new Blob([data], { type: 'application/pdf' })
      saveAs(blob, `${invoice.invoiceNumber || 'invoice'}.pdf`)
    } catch (error) {
      enqueueSnackbar('Failed to download PDF')
    }
    setDownloadLoading(false)
  }

  if (isLoading || !invoice) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    )
  }

  const status = getStatus()

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {invoice.invoiceNumber || 'Invoice'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<SendIcon />}
            onClick={() => {
              setSendEmail(invoice.client?.email || '')
              setOpenSend(true)
            }}
          >
            Send
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={downloadLoading ? <CircularProgress size={16} /> : <DownloadIcon />}
            onClick={handleDownloadPdf}
            disabled={downloadLoading}
          >
            Download
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/invoice/edit/${id}`)}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setOpenDelete(true)}
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid #e8ecf1', mb: 3 }}>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            {profile && (
              <>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                  {profile.businessName || profile.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">{profile.email}</Typography>
                <Typography variant="body2" color="text.secondary">{profile.phoneNumber}</Typography>
                <Typography variant="body2" color="text.secondary">{profile.contactAddress}</Typography>
              </>
            )}
          </Grid>
          <Grid item xs={12} sm={6} sx={{ textAlign: { sm: 'right' } }}>
            <Chip
              label={status}
              sx={{
                backgroundColor: getStatusColor(status),
                color: '#fff',
                fontWeight: 600,
                mb: 1,
              }}
            />
            <Typography variant="body2" color="text.secondary">
              Type: {invoice.type || 'Invoice'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Date: {moment(invoice.createdAt).format('MMM DD, YYYY')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Due: {moment(invoice.dueDate).format('MMM DD, YYYY')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Currency: {invoice.currency || 'USD'}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ color: '#888', mb: 0.5 }}>BILL TO</Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {invoice.client?.name || 'N/A'}
          </Typography>
          <Typography variant="body2" color="text.secondary">{invoice.client?.email}</Typography>
          <Typography variant="body2" color="text.secondary">{invoice.client?.phone}</Typography>
          <Typography variant="body2" color="text.secondary">{invoice.client?.address}</Typography>
        </Box>

        <Table size="small" sx={{ mb: 3 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
              <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Qty</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Price</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Disc</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoice.items?.map((item, i) => {
              const price = Number(item.unitPrice) || 0
              const qty = Number(item.quantity) || 0
              const disc = Number(item.discount) || 0
              const amount = price * qty * (1 - disc / 100)
              return (
                <TableRow key={i}>
                  <TableCell>{item.itemName}</TableCell>
                  <TableCell align="right">{qty}</TableCell>
                  <TableCell align="right">{price.toFixed(2)}</TableCell>
                  <TableCell align="right">{disc}%</TableCell>
                  <TableCell align="right">{amount.toFixed(2)}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Box sx={{ minWidth: 280 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" color="text.secondary">Subtotal:</Typography>
              <Typography variant="body2">{toCommas(Number(invoice.subTotal || 0).toFixed(2))}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" color="text.secondary">VAT ({invoice.vat || 0}%):</Typography>
              <Typography variant="body2">
                {toCommas(((Number(invoice.subTotal) || 0) * (Number(invoice.vat) / 100)).toFixed(2))}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Total:</Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2' }}>
                {invoice.currency} {toCommas(Number(invoice.total || 0).toFixed(2))}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" color="text.secondary">Paid:</Typography>
              <Typography variant="body2" sx={{ color: '#4caf50' }}>
                {toCommas(Number(invoice.totalAmountReceived || 0).toFixed(2))}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Balance Due:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#f44336' }}>
                {invoice.currency} {toCommas(Math.max(0, Number(invoice.total || 0) - Number(invoice.totalAmountReceived || 0)).toFixed(2))}
              </Typography>
            </Box>
          </Box>
        </Box>

        {invoice.notes && (
          <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5, color: '#888' }}>Notes</Typography>
            <Typography variant="body2">{invoice.notes}</Typography>
          </Box>
        )}
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Payment History
        </Typography>
        {status !== 'Paid' && (
          <Button
            variant="contained"
            size="small"
            startIcon={<PaymentIcon />}
            onClick={() => setOpenPayment(true)}
          >
            Record Payment
          </Button>
        )}
      </Box>

      <PaymentHistory records={invoice.paymentRecords || []} currency={invoice.currency} />

      <AddPayment
        open={openPayment}
        onClose={() => setOpenPayment(false)}
        invoice={invoice}
      />

      {/* Send Dialog */}
      <Dialog open={openSend} onClose={() => setOpenSend(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Send Invoice</DialogTitle>
        <DialogContent>
          <TextField
            label="Recipient Email"
            type="email"
            value={sendEmail}
            onChange={(e) => setSendEmail(e.target.value)}
            fullWidth
            size="small"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSend(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSendPdf}
            disabled={sendLoading || !sendEmail}
          >
            {sendLoading ? <CircularProgress size={20} /> : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Invoice</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this invoice? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default InvoiceDetails
