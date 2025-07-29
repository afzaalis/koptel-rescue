import { useState, ElementType, ChangeEvent, SyntheticEvent, useEffect } from 'react' // Import useEffect

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Alert from '@mui/material/Alert'
import Select from '@mui/material/Select'
import { styled } from '@mui/material/styles'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import AlertTitle from '@mui/material/AlertTitle'
import IconButton from '@mui/material/IconButton'
import CardContent from '@mui/material/CardContent'
import FormControl from '@mui/material/FormControl'
import Button, { ButtonProps } from '@mui/material/Button'

// ** Icons Imports
import Close from 'mdi-material-ui/Close'

// ** Auth Context Import
import { useAuth } from 'src/hooks/useAuth' 

const ImgStyled = styled('img')(({ theme }) => ({
  width: 120,
  height: 120,
  marginRight: theme.spacing(6.25),
  borderRadius: theme.shape.borderRadius
}))

const ButtonStyled = styled(Button)<ButtonProps & { component?: ElementType; htmlFor?: string }>(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

const ResetButtonStyled = styled(Button)<ButtonProps>(({ theme }) => ({
  marginLeft: theme.spacing(4.5),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginLeft: 0,
    textAlign: 'center',
    marginTop: theme.spacing(4)
  }
}))

const TabAccount = () => {
  // ** State
  const auth = useAuth() // Get auth context
  const [openAlert, setOpenAlert] = useState<boolean>(true)
  const [imgSrc, setImgSrc] = useState<string>('/images/avatars/1.png')

  // State to hold user data for the form
  const [userData, setUserData] = useState({
    username: '',
    fullName: '',
    email: '',
    role: '',
    status: 'active', // Default value, as it's not in your DB schema
    company: 'ABC Pvt. Ltd.' // Default value, as it's not in your DB schema
  });

  // Effect to populate form fields when user data is available from AuthContext
  useEffect(() => {
    if (auth.user) {
      setUserData({
        username: auth.user.username || '',
        fullName: auth.user.fullName || '',
        email: auth.user.email || '',
        role: auth.user.role || '',
        status: 'active', // Keep default or fetch from a separate user_status table if exists
        company: 'Koptel' // Keep default or fetch from a separate user_company table if exists
      });
    }
  }, [auth.user]); // Re-run when auth.user changes

  const handleInputChange = (prop: keyof typeof userData) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>) => {
    setUserData({ ...userData, [prop]: event.target.value });
  };

  const onChange = (file: ChangeEvent) => {
    const reader = new FileReader()
    const { files } = file.target as HTMLInputElement
    if (files && files.length !== 0) {
      reader.onload = () => setImgSrc(reader.result as string)

      reader.readAsDataURL(files[0])
    }
  }

  // Handle Save Changes (placeholder for API call)
  const handleSaveChanges = (e: SyntheticEvent) => {
    e.preventDefault();
    console.log('Saving changes:', userData);
    // Here you would typically make an API call to update the user's profile
    // e.g., axios.put('/api/auth/profile', userData, { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } });
    // Don't forget to handle success/error messages.
  };

  return (
    <CardContent>
      <form onSubmit={handleSaveChanges}> {/* Bind form submission to handleSaveChanges */}
        <Grid container spacing={7}>
          <Grid item xs={12} sx={{ marginTop: 4.8, marginBottom: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ImgStyled src={imgSrc} alt='Profile Pic' />
              <Box>
                <ButtonStyled component='label' variant='contained' htmlFor='account-settings-upload-image'>
                  Upload New Photo
                  <input
                    hidden
                    type='file'
                    onChange={onChange}
                    accept='image/png, image/jpeg'
                    id='account-settings-upload-image'
                  />
                </ButtonStyled>
                <ResetButtonStyled color='error' variant='outlined' onClick={() => setImgSrc('/images/avatars/1.png')}>
                  Reset
                </ResetButtonStyled>
                <Typography variant='body2' sx={{ marginTop: 5 }}>
                  Allowed PNG or JPEG. Max size of 800K.
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Username'
              placeholder='johnDoe'
              value={userData.username}
              onChange={handleInputChange('username')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Name'
              placeholder='John Doe'
              value={userData.fullName}
              onChange={handleInputChange('fullName')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type='email'
              label='Email'
              placeholder='johnDoe@example.com'
              value={userData.email}
              onChange={handleInputChange('email')}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                label='Role'
                value={userData.role}
                // onChange={handleInputChange('role')}
                // Disable role selection if user is not admin
                disabled={auth.user?.role !== 'admin'}
              >
                <MenuItem value='sales'>Sales</MenuItem>
                <MenuItem value='keuangan'>Keuangan</MenuItem>
                <MenuItem value='admin'>Admin</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                label='Status'
                value={userData.status}
                // onChange={handleInputChange('status')}
                disabled
              >
                <MenuItem value='active'>Active</MenuItem>
                <MenuItem value='inactive'>Inactive</MenuItem>
                <MenuItem value='pending'>Pending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label='Company'
              placeholder='ABC Pvt. Ltd.'
              value={userData.company}
              onChange={handleInputChange('company')}
              disabled 
            />
          </Grid>

          {openAlert ? (
            <Grid item xs={12} sx={{ mb: 3 }}>
              <Alert
                severity='warning'
                sx={{ '& a': { fontWeight: 400 } }}
                action={
                  <IconButton size='small' color='inherit' aria-label='close' onClick={() => setOpenAlert(false)}>
                    <Close fontSize='inherit' />
                  </IconButton>
                }
              >
                <AlertTitle>Your email is not confirmed. Please check your inbox.</AlertTitle>
                <Link href='/' onClick={(e: SyntheticEvent) => e.preventDefault()}>
                  Resend Confirmation
                </Link>
              </Alert>
            </Grid>
          ) : null}

          <Grid item xs={12}>
            <Button variant='contained' sx={{ marginRight: 3.5 }} type='submit'> {/* Changed type to submit */}
              Save Changes
            </Button>
            <Button type='reset' variant='outlined' color='secondary' onClick={() => setUserData(auth.user ? {
              username: auth.user.username || '',
              fullName: auth.user.fullName || '',
              email: auth.user.email || '',
              role: auth.user.role || '',
              status: 'active',
              company: 'ABC Pvt. Ltd.'
            } : { username: '', fullName: '', email: '', role: '', status: 'active', company: 'ABC Pvt. Ltd.' })}> {/* Reset to initial user data */}
              Reset
            </Button>
          </Grid>
        </Grid>
      </form>
    </CardContent>
  )
}

export default TabAccount
