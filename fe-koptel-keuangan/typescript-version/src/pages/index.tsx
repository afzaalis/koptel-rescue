import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'
import Link from 'next/link'
import { Grid, Card, CardContent, Typography, Box } from '@mui/material'
import { styled, useTheme } from '@mui/material/styles'
import { Icon } from '@iconify/react'
import type { NextPage } from 'next'
import { ReactNode } from 'react' 

// Define a custom type that extends NextPage to include authGuard
type NextPageWithAuth = NextPage & {
  authGuard?: boolean;
  getLayout?: (page: ReactNode) => ReactNode; 
}

const dashboardLinks = [
  { title: 'Revenue', path: '/dashboard/revenue', icon: 'mdi:currency-usd' },
  { title: 'Sales', path: '/dashboard/sales', icon: 'mdi:cart-outline' },
  { title: 'Collection', path: '/dashboard/collection', icon: 'mdi:cash' },
  { title: 'Utility Expenses', path: '/dashboard/utility-expenses', icon: 'mdi:flash' },
  { title: 'KM', path: '/dashboard/km', icon: 'mdi:map-marker-distance' },
  { title: 'AI Helper', path: '/dashboard/aihelper', icon: 'mdi:robot' },
]

const GlassCard = styled(Card)(({ theme }) => ({
  background: theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(0, 0, 0, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(15px)',
  borderRadius: '20px',
  transition: '0.3s',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
}))

// Ubah tipe komponen Dashboard menjadi NextPageWithAuth
const Dashboard: NextPageWithAuth = () => {
  const theme = useTheme()

  return (
    <ApexChartWrapper>
      <Grid container spacing={4}>
        {dashboardLinks.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Link href={item.path} passHref>
              <GlassCard>
                <CardContent>
                  <Box display='flex' alignItems='center' gap={2}>
                    <Box
                      sx={{
                        background: 'linear-gradient(135deg, #43CBFF 0%, #9708CC 100%)',
                        borderRadius: '12px',
                        padding: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon icon={item.icon} style={{ color: '#fff', fontSize: 28 }} />
                    </Box>
                    <Box>
                      <Typography
                        variant='h6'
                        sx={{
                          color: theme.palette.text.primary
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        variant='body2'
                        sx={{
                          color: theme.palette.text.secondary,
                          letterSpacing: '0.25px'
                        }}
                      >
                        Go to {item.title} page
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </GlassCard>
            </Link>
          </Grid>
        ))}
      </Grid>
    </ApexChartWrapper>
  )
}

// Ini adalah bagian yang perlu Anda tambahkan
Dashboard.authGuard = true;

export default Dashboard