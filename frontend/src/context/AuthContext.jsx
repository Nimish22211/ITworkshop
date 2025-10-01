import { createContext, useContext, useReducer, useEffect } from 'react'
import toast from 'react-hot-toast'
import { auth, googleProvider, signInWithPopup, onAuthStateChanged, signOut } from '../services/firebaseClient'
import { apiService } from '../services/apiService'

const AuthContext = createContext()

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  role: null,
  approved: false,
}

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        role: action.payload.role || null,
        approved: Boolean(action.payload.approved),
      }
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        role: null,
        approved: false,
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        role: null,
        approved: false,
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      }
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken(true)
        const decoded = await firebaseUser.getIdTokenResult(true)
        localStorage.setItem('token', token)
        const mappedUser = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        }
        const role = decoded.claims?.role || 'student'
        const approved = Boolean(decoded.claims?.approved)
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user: mappedUser, token, role, approved } })
      } else {
        localStorage.removeItem('token')
        dispatch({ type: 'LOGIN_FAILURE' })
      }
    })
    return () => unsubscribe()
  }, [])

  const loginWithGoogle = async (selectedRole = 'driver') => {
    try {
      dispatch({ type: 'LOGIN_START' })
      const result = await signInWithPopup(auth, googleProvider)
      const token = await result.user.getIdToken(true)
      const decoded = await result.user.getIdTokenResult(true)
      const user = {
        uid: result.user.uid,
        name: result.user.displayName || result.user.email,
        email: result.user.email,
        photoURL: result.user.photoURL,
      }
      localStorage.setItem('token', token)
      // Ensure user exists in backend (will also set claims on first login)
      try {
        await apiService.post('/admin/users/ensure', { role: selectedRole })
      } catch (e) {
        console.error('ensure user failed', e)
      }

      // Re-fetch token to get potential updated claims
      const freshToken = await result.user.getIdToken(true)
      const freshDecoded = await result.user.getIdTokenResult(true)
      localStorage.setItem('token', freshToken)
      const role = freshDecoded.claims?.role || selectedRole || 'student'
      const approved = Boolean(freshDecoded.claims?.approved)
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: freshToken, role, approved } })
      toast.success('Login successful!')
      let redirectPath = '/map'
      if (role === 'admin') redirectPath = '/admin'
      else if (role === 'driver') redirectPath = '/driver'
      return { success: true, redirectPath }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' })
      toast.error('Login failed')
      return { success: false, error: 'Login failed' }
    }
  }

  const logout = async () => {
    await signOut(auth)
    localStorage.removeItem('token')
    dispatch({ type: 'LOGOUT' })
    toast.success('Logged out successfully')
  }



  const updateUser = (userData) => {
    dispatch({
      type: 'UPDATE_USER',
      payload: userData
    })
  }

  const value = {
    ...state,
    loginWithGoogle,
    logout,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
