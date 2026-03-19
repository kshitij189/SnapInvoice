import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useSnackbar } from 'notistack'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Autocomplete from '@mui/material/Autocomplete'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import SaveIcon from '@mui/icons-material/Save'
import currencies from '../../constants/currencies.json'
import { createInvoice, updateInvoice, getInvoice } from '../../actions/invoiceActions'
import { getClientsByUser } from '../../actions/clientActions'
import { getInvoiceCount } from '../../api'
import AddClient from '../Clients/AddClient'
import styles from './Invoice.module.css'

const invoiceTypes = ['Invoice', 'Receipt', 'Estimate', 'Quotation', 'Bill']

const emptyItem = { itemName: '', unitPrice: '', quantity: 1, discount: 0 }

const Invoice = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { enqueueSnackbar } = useSnackbar()
  const { invoice } = useSelector((state) => state.invoices)
  const { clients } = useSelector((state) => state.clients)
  const user = JSON.parse(localStorage.getItem('profile'))
  const isEdit = Boolean(id)

  const [openClientModal, setOpenClientModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: '',
    client: null,
    type: 'Invoice',
    status: 'Unpaid',
    currency: 'INR',
    dueDate: new Date().toISOString().slice(0, 10),
    items: [{ ...emptyItem }],
    vat: 0,
    notes: '',
    total: 0,
    subTotal: 0,
    totalAmountReceived: 0,
    paymentRecords: [],
    creator: user?.result?._id || user?.result?.sub || '',
  })

  useEffect(() => {
    const userId = user?.result?._id || user?.result?.sub
    if (userId) {
      dispatch(getClientsByUser(userId))
    }
  }, [dispatch])

  useEffect(() => {
    if (isEdit && id) {
      dispatch(getInvoice(id))
    }
  }, [id, dispatch])

  useEffect(() => {
    if (isEdit && invoice) {
      setInvoiceData({
        ...invoice,
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().slice(0, 10) : '',
      })
    }
  }, [invoice, isEdit])

  useEffect(() => {
    if (!isEdit) {
      const userId = user?.result?._id || user?.result?.sub
      if (userId) {
        getInvoiceCount(userId).then(({ data }) => {
          const count = (data?.totalCount || 0) + 1
          setInvoiceData((prev) => ({
            ...prev,
            invoiceNumber: `INV-${String(count).padStart(3, '0')}`,
            currency: 'INR',
          }))
        }).catch(() => {
          setInvoiceData((prev) => ({ ...prev, invoiceNumber: 'INV-001', currency: 'INR' }))
        })
      }
    }
  }, [isEdit])

  const calculateTotals = (items, vat) => {
    const subTotal = items.reduce((sum, item) => {
      const price = Number(item.unitPrice) || 0
      const qty = Number(item.quantity) || 0
      const disc = Number(item.discount) || 0
      return sum + price * qty * (1 - disc / 100)
    }, 0)
    const vatAmount = subTotal * (Number(vat) / 100)
    return {
      subTotal: Math.round(subTotal * 100) / 100,
      total: Math.round((subTotal + vatAmount) * 100) / 100,
    }
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...invoiceData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    const { subTotal, total } = calculateTotals(newItems, invoiceData.vat)
    setInvoiceData({ ...invoiceData, items: newItems, subTotal, total })
  }

  const addItem = () => {
    setInvoiceData({ ...invoiceData, items: [...invoiceData.items, { ...emptyItem }] })
  }

  const removeItem = (index) => {
    if (invoiceData.items.length === 1) return
    const newItems = invoiceData.items.filter((_, i) => i !== index)
    const { subTotal, total } = calculateTotals(newItems, invoiceData.vat)
    setInvoiceData({ ...invoiceData, items: newItems, subTotal, total })
  }

  const handleVatChange = (e) => {
    const vat = e.target.value
    const { subTotal, total } = calculateTotals(invoiceData.items, vat)
    setInvoiceData({ ...invoiceData, vat, subTotal, total })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    if (isEdit) {
      dispatch(updateInvoice(id, invoiceData, enqueueSnackbar))
      navigate(`/invoice/${id}`)
    } else {
      dispatch(createInvoice(invoiceData, navigate, enqueueSnackbar))
    }
    setLoading(false)
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        {isEdit ? 'Edit Invoice' : 'Create Invoice'}
      </Typography>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e8ecf1' }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Invoice Number"
                value={invoiceData.invoiceNumber}
                onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })}
                fullWidth
                size="small"
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Invoice Type"
                value={invoiceData.type}
                onChange={(e) => setInvoiceData({ ...invoiceData, type: e.target.value })}
                fullWidth
                size="small"
                select
              >
                {invoiceTypes.map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Currency"
                value={invoiceData.currency}
                onChange={(e) => setInvoiceData({ ...invoiceData, currency: e.target.value })}
                fullWidth
                size="small"
                select
              >
                {currencies.map((c) => (
                  <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Autocomplete
                  fullWidth
                  size="small"
                  options={clients || []}
                  getOptionLabel={(option) => option?.name || ''}
                  value={invoiceData.client}
                  onChange={(_, newValue) => setInvoiceData({ ...invoiceData, client: newValue })}
                  isOptionEqualToValue={(option, value) => option?._id === value?._id}
                  renderInput={(params) => <TextField {...params} label="Select Client" required />}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setOpenClientModal(true)}
                  sx={{ minWidth: 'auto', px: 1, height: 40 }}
                >
                  <AddIcon />
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Due Date"
                type="date"
                value={invoiceData.dueDate}
                onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Tax / VAT (%)"
                type="number"
                value={invoiceData.vat}
                onChange={handleVatChange}
                fullWidth
                size="small"
                inputProps={{ min: 0, max: 100, step: 0.01 }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Line Items
          </Typography>
          <Table size="small" sx={{ mb: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Item Name</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 120 }}>Unit Price</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 80 }}>Qty</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 100 }}>Disc (%)</TableCell>
                <TableCell sx={{ fontWeight: 600, width: 120 }} align="right">Amount</TableCell>
                <TableCell sx={{ width: 50 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {invoiceData.items.map((item, index) => {
                const price = Number(item.unitPrice) || 0
                const qty = Number(item.quantity) || 0
                const disc = Number(item.discount) || 0
                const amount = price * qty * (1 - disc / 100)
                return (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        value={item.itemName}
                        onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                        size="small"
                        fullWidth
                        placeholder="Item name"
                        required
                        variant="standard"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        size="small"
                        type="number"
                        variant="standard"
                        inputProps={{ min: 0, step: 0.01 }}
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        size="small"
                        type="number"
                        variant="standard"
                        inputProps={{ min: 1 }}
                        required
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={item.discount}
                        onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                        size="small"
                        type="number"
                        variant="standard"
                        inputProps={{ min: 0, max: 100 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {amount.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => removeItem(index)}
                        disabled={invoiceData.items.length === 1}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={addItem}
            sx={{ mb: 3 }}
          >
            Add Item
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Box sx={{ minWidth: 250 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Subtotal:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {invoiceData.subTotal?.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  VAT ({invoiceData.vat}%):
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {((invoiceData.subTotal || 0) * (Number(invoiceData.vat) / 100)).toFixed(2)}
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Total:</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2' }}>
                  {invoiceData.currency} {invoiceData.total?.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Box>

          <TextField
            label="Notes"
            multiline
            rows={3}
            fullWidth
            size="small"
            value={invoiceData.notes || ''}
            onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
              disabled={loading}
            >
              {isEdit ? 'Update Invoice' : 'Save Invoice'}
            </Button>
          </Box>
        </form>
      </Paper>

      <AddClient open={openClientModal} onClose={() => setOpenClientModal(false)} />
    </Box>
  )
}

export default Invoice
