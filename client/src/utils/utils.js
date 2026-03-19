export const toCommas = (value) => {
  if (value === undefined || value === null) return '0.00'
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export const getStatusColor = (status) => {
  switch (status) {
    case 'Paid':
      return '#4caf50'
    case 'Partial':
      return '#ff9800'
    case 'Unpaid':
      return '#f44336'
    case 'Overdue':
      return '#d32f2f'
    default:
      return '#9e9e9e'
  }
}

export const getInvoiceStatus = (invoice) => {
  if (!invoice) return 'Unpaid'
  const { totalAmountReceived, total, dueDate, status } = invoice
  if (status === 'Paid' || totalAmountReceived >= total) return 'Paid'
  if (totalAmountReceived > 0 && totalAmountReceived < total) return 'Partial'
  if (new Date(dueDate) < new Date() && status !== 'Paid') return 'Overdue'
  return 'Unpaid'
}
