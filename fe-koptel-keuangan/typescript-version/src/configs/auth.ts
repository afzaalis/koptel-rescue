// export default {
//   meEndpoint: '/api/auth/me', // Endpoint untuk mendapatkan data user berdasarkan token (simulasi)
//   loginEndpoint: '/api/auth/login', // Endpoint untuk login
//   registerEndpoint: '/api/auth/register', // Endpoint untuk register (jika ada)
//   storageTokenKeyName: 'accessToken', // Nama kunci untuk menyimpan token di localStorage
//   onTokenExpiration: 'refreshToken' // Nama kunci untuk refresh token (opsional)
// }

export default {
  meEndpoint: 'http://10.64.210.66:5000/api/auth/me',
  loginEndpoint: 'http://10.64.210.66:5000/api/auth/login',
  registerEndpoint: 'http://10.64.210.66:5000/api/auth/register',
  storageTokenKeyName: 'accessToken',
  onTokenExpiration: 'refreshToken'
}


// export default {
//   meEndpoint: '/api/auth/me', // Ini akan memanggil GET /api/auth/me di backend
//   loginEndpoint: '/api/auth/login', // Ini akan memanggil POST /api/auth/login di backend
//   registerEndpoint: '/api/auth/register', // Jika Anda mengimplementasikan register
//   storageTokenKeyName: 'accessToken',
//   onTokenExpiration: 'refreshToken'
// }
