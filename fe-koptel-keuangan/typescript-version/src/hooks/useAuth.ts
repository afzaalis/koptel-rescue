import { useContext } from 'react'

// ** Auth Context Import
import { AuthContext } from 'src/context/authContext'

export const useAuth = () => useContext(AuthContext)
