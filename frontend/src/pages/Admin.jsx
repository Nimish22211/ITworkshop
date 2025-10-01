import React, { useState } from 'react'
import { apiService } from '../services/apiService'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { useAuth } from '../context/AuthContext'
import { Shield, UserCheck } from 'lucide-react'

export default function Admin() {
    const { role } = useAuth()
    const [uid, setUid] = useState('')
    const [status, setStatus] = useState('')

    const approve = async () => {
        setStatus('')
        try {
            await apiService.post('/admin/drivers/approve', { uid, role: 'driver', approved: true })
            setStatus('Approved')
        } catch (e) {
            setStatus('Failed')
        }
    }

    return (
        <div className="mx-auto max-w-3xl p-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <CardTitle className="text-base">Admin Panel</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">Secure</Badge>
                        <Badge>{role || 'unknown'}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="mb-1 block text-xs text-muted-foreground">Driver UID</label>
                        <Input value={uid} onChange={e => setUid(e.target.value)} placeholder="Enter Firebase UID" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={approve}>
                            <UserCheck className="mr-2 h-4 w-4" /> Approve Driver
                        </Button>
                    </div>
                    {status && <div className="text-sm text-muted-foreground">{status}</div>}
                </CardContent>
            </Card>
        </div>
    )
}


