import { createContext, useContext, useEffect, useReducer } from 'react'
import { apiService } from '../services/apiService'
import SocketService from '../services/socketService'

const BusContext = createContext()

const initialState = {
    buses: [],
    loading: true,
}

function reducer(state, action) {
    switch (action.type) {
        case 'SET_BUSES':
            return { ...state, buses: action.payload, loading: false }
        case 'UPSERT_BUS': {
            const bus = action.payload
            const existingIndex = state.buses.findIndex(b => b.id === bus.id)
            if (existingIndex >= 0) {
                const updated = [...state.buses]
                updated[existingIndex] = { ...updated[existingIndex], ...bus }
                return { ...state, buses: updated }
            }
            return { ...state, buses: [...state.buses, bus] }
        }
        case 'SET_LOADING':
            return { ...state, loading: action.payload }
        default:
            return state
    }
}

export const BusProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState)

    useEffect(() => {
        const load = async () => {
            try {
                dispatch({ type: 'SET_LOADING', payload: true })
                const { data } = await apiService.get('/buses')
                dispatch({ type: 'SET_BUSES', payload: data })
            } catch (e) {
                dispatch({ type: 'SET_LOADING', payload: false })
            }
        }
        load()

        const socket = SocketService.connect()
        socket.on('bus-location', (bus) => {
            dispatch({ type: 'UPSERT_BUS', payload: bus })
        })
        socket.on('bus-status', (bus) => {
            // Handle both old format { id, active } and new format with full bus object
            dispatch({ type: 'UPSERT_BUS', payload: bus })
        })
        return () => {
            socket.off('bus-location')
            socket.off('bus-status')
            SocketService.disconnect()
        }
    }, [])

    return (
        <BusContext.Provider value={{ ...state }}>
            {children}
        </BusContext.Provider>
    )
}

export const useBuses = () => {
    const ctx = useContext(BusContext)
    if (!ctx) throw new Error('useBuses must be used within BusProvider')
    return ctx
}


