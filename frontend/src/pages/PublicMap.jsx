import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useBuses } from '../context/BusContext'
import { useEffect, useMemo, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

delete L.Icon.Default.prototype._getIconUrl

const busIcon = L.divIcon({
    className: 'bus-marker',
    html: `<div style="background:#2563eb;color:white;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)">🚌</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
})

export default function PublicMap() {
    const { buses } = useBuses()
    const [selectedBusId, setSelectedBusId] = useState("")

    const selectableBusIds = useMemo(() => {
        return buses
            .filter(b => b.active)
            .map(b => String(b.id))
            .sort((a, b) => a.localeCompare(b))
    }, [buses])

    const selectedBus = useMemo(() => {
        if (!selectedBusId) return null
        return buses.find(b => String(b.id) === selectedBusId && b.location)
    }, [buses, selectedBusId])

    return (
        <div className="flex min-h-screen w-full flex-col">
            <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
                    <div className="text-sm font-medium">Select Bus</div>
                    <div className="w-56">
                        <Select value={selectedBusId} onValueChange={setSelectedBusId}>
                            <SelectTrigger aria-label="Select bus">
                                <SelectValue placeholder="Choose a bus ID" />
                            </SelectTrigger>
                            <SelectContent>
                                {selectableBusIds.length === 0 && (
                                    <SelectItem disabled value="none">No active buses</SelectItem>
                                )}
                                {selectableBusIds.map(id => (
                                    <SelectItem key={id} value={id}>Bus {id}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {selectedBus && (
                        <Button variant="outline" size="sm" onClick={() => setSelectedBusId("")}>Clear</Button>
                    )}
                </div>
            </div>

            <div className="relative h-[calc(100vh-64px)] w-full">
                <MapContainer center={[30.9010, 75.8573]} zoom={13} className="h-full w-full">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <RecenterOnSelection bus={selectedBus} />
                    {selectedBus && selectedBus.location && (
                        <Marker key={selectedBus.id} position={[selectedBus.location.lat, selectedBus.location.lng]} icon={busIcon}>
                            <Popup>
                                <div className="text-sm">
                                    <div className="font-semibold">Bus {selectedBus.id}</div>
                                    <div>Updated: {selectedBus.updatedAt ? new Date(selectedBus.updatedAt).toLocaleTimeString() : 'now'}</div>
                                </div>
                            </Popup>
                        </Marker>
                    )}
                </MapContainer>
                {!selectedBus && (
                    <div className="pointer-events-none absolute inset-0 grid place-items-center">
                        <div className="pointer-events-auto rounded-md border bg-card/90 p-4 text-center shadow">
                            <div className="text-sm font-medium">Select a bus to view its location</div>
                            <div className="mt-1 text-xs text-muted-foreground">Choose from the list above</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function RecenterOnSelection({ bus }) {
    const map = useMap()
    useEffect(() => {
        if (bus && bus.location) {
            map.setView([bus.location.lat, bus.location.lng], 16, { animate: true })
        }
    }, [bus, map])
    return null
}


