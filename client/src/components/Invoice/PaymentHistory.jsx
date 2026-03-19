import React from 'react'
import moment from 'moment'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { toCommas } from '../../utils/utils'

const PaymentHistory = ({ records, currency = 'USD' }) => {
  if (!records || records.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e8ecf1', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No payment records yet.
        </Typography>
      </Paper>
    )
  }

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{ borderRadius: 2, border: '1px solid #e8ecf1' }}
    >
      <Table size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
            <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Method</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Note</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {records.map((record, index) => (
            <TableRow key={index}>
              <TableCell>{moment(record.datePaid).format('MMM DD, YYYY')}</TableCell>
              <TableCell sx={{ fontWeight: 500, color: '#4caf50' }}>
                {currency} {toCommas(Number(record.amountPaid).toFixed(2))}
              </TableCell>
              <TableCell>{record.paymentMethod}</TableCell>
              <TableCell>{record.note || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default PaymentHistory
