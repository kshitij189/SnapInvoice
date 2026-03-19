import React from 'react'
import ReactApexChart from 'react-apexcharts'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

const Chart = ({ paymentHistory, currencySymbol = '$' }) => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ]

  const currentYear = new Date().getFullYear()

  const monthlyData = months.map((_, index) => {
    const total = paymentHistory
      .filter((p) => {
        const date = new Date(p.datePaid)
        return date.getMonth() === index && date.getFullYear() === currentYear
      })
      .reduce((sum, p) => sum + (Number(p.amountPaid) || 0), 0)
    return Math.round(total * 100) / 100
  })

  const options = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      fontFamily: 'Inter, sans-serif',
    },
    plotOptions: {
      bar: { borderRadius: 8, columnWidth: '45%' },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: months,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: '#94a3b8', fontSize: '12px' } },
    },
    yaxis: {
      labels: {
        formatter: (val) => `${currencySymbol}${val.toLocaleString()}`,
        style: { colors: '#94a3b8', fontSize: '12px' },
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.2,
        gradientToColors: ['#8b5cf6'],
        opacityFrom: 1,
        opacityTo: 0.85,
        stops: [0, 100],
      },
    },
    colors: ['#6366f1'],
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
    },
    tooltip: {
      theme: 'light',
      y: { formatter: (val) => `${currencySymbol}${val.toLocaleString()}` },
      style: { fontSize: '13px' },
    },
  }

  const series = [{ name: 'Payments Received', data: monthlyData }]

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        background: '#fff',
        transition: 'box-shadow 0.3s ease',
        '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.06)' },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, mb: 2, color: '#1e293b', fontFamily: "'Poppins', sans-serif" }}
        >
          Payment History ({currentYear})
        </Typography>
        <ReactApexChart options={options} series={series} type="bar" height={320} />
      </CardContent>
    </Card>
  )
}

export default Chart
