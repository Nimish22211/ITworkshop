import React, { useEffect, useRef, useState } from 'react'
import { apiService } from '../services/apiService'
import { useAuth } from '../context/AuthContext'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { MapPin, Power, Activity } from 'lucide-react'
import Header from '../components/Common/Header'

export default function DriverDashboard() {
    const { isAuthenticated, approved, role } = useAuth()
    const watchIdRef = useRef(null)
    const [busId, setBusId] = useState('bus-1')
    const [active, setActive] = useState(false)

    useEffect(() => {
        return () => {
            if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current)
        }
    }, [])

    const startSharing = async () => {
        if (!navigator.geolocation || !isAuthenticated || !approved) return

        // Validate busId
        if (!busId || busId.trim() === '') {
            alert('Please enter a valid Bus ID')
            return
        }

        const geoOptions = { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }

        // First, get current position immediately
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude, heading, speed } = pos.coords
                try {
                    // Send initial location to activate bus immediately
                    await apiService.post('/driver/heartbeat', { busId, latitude, longitude, heading, speed })
                    setActive(true)

                    // Now start watching for continuous updates
                    watchIdRef.current = navigator.geolocation.watchPosition(
                        async (updatePos) => {
                            const { latitude: lat, longitude: lng, heading: hdg, speed: spd } = updatePos.coords
                            try {
                                await apiService.post('/driver/heartbeat', { busId, latitude: lat, longitude: lng, heading: hdg, speed: spd })
                            } catch (e) {
                                console.error('heartbeat failed', e)
                            }
                        },
                        (err) => {
                            console.error('geolocation watch error', err)
                        },
                        geoOptions
                    )
                } catch (e) {
                    console.error('Failed to start sharing location', e)
                    setActive(false)
                }
            },
            (err) => {
                console.error('Failed to get initial location', err)
                alert('Unable to get your location. Please check your browser permissions and try again.')
            },
            geoOptions
        )
    }

    const stopSharing = async () => {
        if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
        setActive(false)
        try {
            await apiService.post('/driver/status', { busId, active: false })
        } catch { }
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="mx-auto max-w-3xl p-4 pt-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            <CardTitle className="text-base">Driver Console</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">{role || 'unknown'}</Badge>
                            <Badge variant={approved ? 'default' : 'secondary'}>{approved ? 'Approved' : 'Pending'}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="mb-1 block text-xs text-muted-foreground">Bus ID</label>
                            <Input
                                value={busId}
                                onChange={e => setBusId(e.target.value)}
                                placeholder="e.g. 7"
                                disabled={active}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button onClick={startSharing} disabled={active || !approved}>
                                <Activity className="mr-2 h-4 w-4" /> Start Sharing
                            </Button>
                            <Button variant="secondary" onClick={stopSharing} disabled={!active}>
                                <Power className="mr-2 h-4 w-4" /> Stop
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Location sharing uses your device GPS to send updates in real time.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}


