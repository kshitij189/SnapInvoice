import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import ReceiptIcon from '@mui/icons-material/Receipt'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import CancelIcon from '@mui/icons-material/Cancel'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import moment from 'moment'
import { getInvoicesByUser } from '../../actions/invoiceActions'
import { toCommas, getStatusColor } from '../../utils/utils'
import StatCard from './StatCard'
import Chart from './Chart'

const Dashboard = () => {
  const dispatch = useDispatch()
  const { invoices, isLoading } = useSelector((state) => state.invoices)
  const user = JSON.parse(localStorage.getItem('profile'))

  useEffect(() => {
    if (user?.result?._id || user?.result?.sub) {
      dispatch(getInvoicesByUser(user.result._id || user.result.sub))
    }
  }, [dispatch])

  const stats = useMemo(() => {
    if (!invoices || invoices.length === 0) {
      return {
        totalReceived: 0,
        pendingAmount: 0,
        totalAmount: 0,
        totalInvoices: 0,
        paid: 0,
        partial: 0,
        unpaid: 0,
        overdue: 0,
      }
    }

    let totalReceived = 0
    let totalAmount = 0
    let pendingAmount = 0
    let paid = 0
    let partial = 0
    let unpaid = 0
    let overdue = 0

    invoices.forEach((inv) => {
      const received = Number(inv.totalAmountReceived) || 0
      const total = Number(inv.total) || 0
      totalReceived += received
      totalAmount += total
      pendingAmount += Math.max(0, total - received)

      if (inv.status === 'Paid' || received >= total) {
        paid++
      } else if (received > 0 && received < total) {
        partial++
      } else if (new Date(inv.dueDate) < new Date() && inv.status !== 'Paid') {
        overdue++
      } else {
        unpaid++
      }
    })

    return {
      totalReceived,
      pendingAmount,
      totalAmount,
      totalInvoices: invoices.length,
      paid,
      partial,
      unpaid,
      overdue,
    }
  }, [invoices])

  const recentPayments = useMemo(() => {
    if (!invoices) return []
    const allPayments = []
    invoices.forEach((inv) => {
      if (inv.paymentRecords && inv.paymentRecords.length > 0) {
        inv.paymentRecords.forEach((p) => {
          allPayments.push({
            ...p,
            invoiceNumber: inv.invoiceNumber,
            clientName: inv.client?.name || 'N/A',
          })
        })
      }
    })
    allPayments.sort((a, b) => new Date(b.datePaid) - new Date(a.datePaid))
    return allPayments.slice(0, 10)
  }, [invoices])

  const paymentHistory = useMemo(() => {
    if (!invoices) return []
    const all = []
    invoices.forEach((inv) => {
      if (inv.paymentRecords) {
        all.push(...inv.paymentRecords)
      }
    })
    return all
  }, [invoices])

    const currencySymbol = useMemo(() => {
    if (!invoices || invoices.length === 0) return '₹'
    const invCurrency = invoices[0].currency || 'INR'
    const symbolMap = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹',
      AUD: 'A$',
      CAD: 'C$',
      SGD: 'S$',
      JPY: '¥',
    }
    return symbolMap[invCurrency] || '₹'
  }, [invoices])

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 10 }}>
        <CircularProgress sx={{ color: '#6366f1' }} />
      </Box>
    )
  }

  return (
    <Box sx={{ animation: 'fadeInUp 0.5s ease-out' }}>
      {/* Dashboard Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'flex-end' }, 
          mb: 4, 
          gap: 2 
        }}
      >
        <Box>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              color: '#0f172a', 
              mb: 0.5, 
              letterSpacing: '-0.02em',
              fontFamily: "'Inter', sans-serif"
            }}
          >
            Dashboard Overview
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b' }}>
            Welcome back, {user?.result?.name ? user.result.name.split(' ')[0] : 'User'}. Here's what's happening with your business today.
          </Typography>
        </Box>
        <Box 
          sx={{ 
            display: { xs: 'none', md: 'flex' }, 
            alignItems: 'center', 
            backgroundColor: '#fff', 
            px: 2, 
            py: 1, 
            borderRadius: '10px', 
            border: '1px solid #e2e8f0', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)' 
          }}
        >
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
            {moment().format('MMMM Do, YYYY')}
          </Typography>
        </Box>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Payment Received"
            value={`${currencySymbol}${toCommas(stats.totalReceived.toFixed(2))}`}
            icon={<AttachMoneyIcon />}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Amount"
            value={`${currencySymbol}${toCommas(stats.pendingAmount.toFixed(2))}`}
            icon={<PendingActionsIcon />}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Amount"
            value={`${currencySymbol}${toCommas(stats.totalAmount.toFixed(2))}`}
            icon={<AccountBalanceWalletIcon />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Invoices"
            value={stats.totalInvoices}
            icon={<ReceiptIcon />}
            color="#9c27b0"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Paid" value={stats.paid} icon={<CheckCircleIcon />} color="#4caf50" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Partially Paid"
            value={stats.partial}
            icon={<HourglassEmptyIcon />}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Unpaid" value={stats.unpaid} icon={<CancelIcon />} color="#f44336" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Overdue" value={stats.overdue} icon={<WarningAmberIcon />} color="#d32f2f" />
        </Grid>
      </Grid>

      {/* Chart and Recent Payments */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={7}>
          <Chart paymentHistory={paymentHistory} currencySymbol={currencySymbol} />
        </Grid>
        <Grid item xs={12} md={5}>
          <Card
            elevation={0}
            sx={{
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              height: '100%',
              background: '#fff',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': { 
                boxShadow: '0 12px 24px -4px rgba(148, 163, 184, 0.15)',
                borderColor: '#cbd5e1',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, mb: 2, color: '#1e293b', fontFamily: "'Poppins', sans-serif" }}
              >
                Recent Payments
              </Typography>
              {recentPayments.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    No payments recorded yet.
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#64748b', borderBottom: '2px solid #f1f5f9' }}>Invoice</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#64748b', borderBottom: '2px solid #f1f5f9' }}>Amount</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#64748b', borderBottom: '2px solid #f1f5f9' }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#64748b', borderBottom: '2px solid #f1f5f9' }}>Method</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentPayments.map((p, i) => (
                        <TableRow key={i} sx={{ '&:last-child td': { border: 0 }, '&:hover': { backgroundColor: '#f8fafc' } }}>
                          <TableCell sx={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: 500 }}>{p.invoiceNumber}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>
                            {currencySymbol}{toCommas(Number(p.amountPaid).toFixed(2))}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {moment(p.datePaid).format('MMM DD')}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: '#64748b' }}>{p.paymentMethod}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard
