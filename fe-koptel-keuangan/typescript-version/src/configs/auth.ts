
export default {
  meEndpoint: 'http://localhost:5001/api/auth/me',
  loginEndpoint: 'http://localhost:5001/api/auth/login',
  registerEndpoint: 'http://localhost:5001/api/auth/register',
  storageTokenKeyName: 'accessToken',
  onTokenExpiration: 'refreshToken'
}

// export default {
//   meEndpoint: 'http://10.64.210.66:5000/api/auth/me',
//   loginEndpoint: 'http://10.64.210.66:5000/api/auth/login',
//   registerEndpoint: 'http://10.64.210.66:5000/api/auth/register',
//   storageTokenKeyName: 'accessToken',
//   onTokenExpiration: 'refreshToken'
// }

