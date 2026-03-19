import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useSnackbar } from 'notistack'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import { updateInvoice } from '../../actions/invoiceActions'
import paymentMethods from '../../utils/paymentMethods'

const AddPayment = ({ open, onClose, invoice }) => {
  const dispatch = useDispatch()
  const { enqueueSnackbar } = useSnackbar()
  const [payment, setPayment] = useState({
    amountPaid: '',
    datePaid: new Date().toISOString().slice(0, 10),
    paymentMethod: 'Bank Transfer',
    note: '',
  })

  const handleChange = (e) => {
    setPayment({ ...payment, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!invoice) return

    const amountPaid = Number(payment.amountPaid) || 0
    const existingReceived = Number(invoice.totalAmountReceived) || 0
    const newTotalReceived = existingReceived + amountPaid
    const total = Number(invoice.total) || 0

    let status = 'Unpaid'
    if (newTotalReceived >= total) {
      status = 'Paid'
    } else if (newTotalReceived > 0) {
      status = 'Partial'
    }

    const updatedInvoice = {
      ...invoice,
      totalAmountReceived: newTotalReceived,
      status,
      paymentRecords: [
        ...(invoice.paymentRecords || []),
        {
          amountPaid,
          datePaid: payment.datePaid,
          paymentMethod: payment.paymentMethod,
          note: payment.note,
          paidBy: 'Client',
        },
      ],
    }

    dispatch(updateInvoice(invoice._id, updatedInvoice, enqueueSnackbar))
    setPayment({
      amountPaid: '',
      datePaid: new Date().toISOString().slice(0, 10),
      paymentMethod: 'Bank Transfer',
      note: '',
    })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Record Payment</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Amount Paid"
            name="amountPaid"
            type="number"
            value={payment.amountPaid}
            onChange={handleChange}
            size="small"
            required
            inputProps={{ min: 0, step: 0.01 }}
          />
          <TextField
            label="Date Paid"
            name="datePaid"
            type="date"
            value={payment.datePaid}
            onChange={handleChange}
            size="small"
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            label="Payment Method"
            name="paymentMethod"
            value={payment.paymentMethod}
            onChange={handleChange}
            size="small"
            select
          >
            {paymentMethods.map((m) => (
              <MenuItem key={m} value={m}>{m}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Note"
            name="note"
            value={payment.note}
            onChange={handleChange}
            size="small"
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={!payment.amountPaid}>
            Record Payment
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default AddPayment
