import { createContext, useContext, useReducer, useEffect } from 'react'
import { apiService } from '../services/apiService'
import toast from 'react-hot-toast'

const IssueContext = createContext()

const initialState = {
  issues: [],
  loading: false,
  filters: {
    category: 'all',
    status: 'all',
    severity: null,
    assigned_to: null
  },
  selectedIssue: null,
  analytics: null
}

const issueReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ISSUES':
      return { ...state, issues: action.payload, loading: false }
    case 'ADD_ISSUE':
      return { ...state, issues: [action.payload, ...state.issues] }
    case 'UPDATE_ISSUE':
      return {
        ...state,
        issues: state.issues.map(issue =>
          issue.id === action.payload.id ? action.payload : issue
        )
      }
    case 'SET_SELECTED_ISSUE':
      return { ...state, selectedIssue: action.payload }
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } }
    case 'SET_ANALYTICS':
      return { ...state, analytics: action.payload }
    default:
      return state
  }
}

export const IssueProvider = ({ children }) => {
  const [state, dispatch] = useReducer(issueReducer, initialState)

  const fetchIssues = async (filters = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await apiService.get('/issues', { params: filters })
      dispatch({ type: 'SET_ISSUES', payload: response.data })
    } catch (error) {
      console.error('Error fetching issues:', error)
      toast.error('Failed to fetch issues')
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const fetchIssueById = async (id) => {
    try {
      const response = await apiService.get(`/issues/${id}`)
      dispatch({ type: 'SET_SELECTED_ISSUE', payload: response.data })
      return response.data
    } catch (error) {
      console.error('Error fetching issue:', error)
      toast.error('Failed to fetch issue details')
      return null
    }
  }

  const createIssue = async (issueData) => {
    try {
      const response = await apiService.post('/issues', issueData)
      dispatch({ type: 'ADD_ISSUE', payload: response.data })
      toast.success('Issue reported successfully!')
      return { success: true, issue: response.data }
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to create issue'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const updateIssueStatus = async (id, status, internalNotes = null) => {
    try {
      const response = await apiService.put(`/issues/${id}/status`, {
        status,
        internal_notes: internalNotes
      })
      dispatch({ type: 'UPDATE_ISSUE', payload: response.data })
      toast.success('Issue status updated successfully!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update issue status'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const assignIssue = async (id, officialId) => {
    try {
      const response = await apiService.put(`/issues/${id}/assign`, {
        assigned_to: officialId
      })
      dispatch({ type: 'UPDATE_ISSUE', payload: response.data })
      toast.success('Issue assigned successfully!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to assign issue'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await apiService.get('/issues/analytics')
      dispatch({ type: 'SET_ANALYTICS', payload: response.data })
      return response.data
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to fetch analytics')
      return null
    }
  }

  const setFilters = (filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters })
  }

  const clearFilters = () => {
    dispatch({ type: 'SET_FILTERS', payload: initialState.filters })
  }

  const value = {
    ...state,
    fetchIssues,
    fetchIssueById,
    createIssue,
    updateIssueStatus,
    assignIssue,
    fetchAnalytics,
    setFilters,
    clearFilters
  }

  return (
    <IssueContext.Provider value={value}>
      {children}
    </IssueContext.Provider>
  )
}

export const useIssues = () => {
  const context = useContext(IssueContext)
  if (!context) {
    throw new Error('useIssues must be used within an IssueProvider')
  }
  return context
}
