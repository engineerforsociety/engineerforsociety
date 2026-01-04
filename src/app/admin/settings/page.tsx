'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Shield, ArrowLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function AdminSettingsPage() {
    const [formData, setFormData] = useState({
        newName: '',
        newEmail: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match')
            return
        }

        setLoading(true)

        try {
            const response = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newEmail: formData.newEmail || undefined,
                    newPassword: formData.newPassword || undefined,
                    newName: formData.newName || undefined
                }),
            })

            const data = await response.json()

            if (data.success) {
                setSuccess('Settings updated successfully!')
                setFormData({
                    ...formData,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                })
                router.refresh()
            } else {
                setError(data.error || 'Failed to update settings')
            }
        } catch (err) {
            setError('An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-muted/40 p-4 md:p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/dashboard">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold">Admin Settings</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Security & Account</CardTitle>
                            <CardDescription>
                                Update your login credentials and profile information.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            {success && (
                                <Alert className="border-green-500 bg-green-50 text-green-700">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <AlertDescription>{success}</AlertDescription>
                                </Alert>
                            )}

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="newName">Full Name</Label>
                                    <Input
                                        id="newName"
                                        placeholder="Enter your name"
                                        value={formData.newName}
                                        onChange={(e) => setFormData({ ...formData, newName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newEmail">New Email Address</Label>
                                    <Input
                                        id="newEmail"
                                        type="email"
                                        placeholder="new-email@example.com"
                                        value={formData.newEmail}
                                        onChange={(e) => setFormData({ ...formData, newEmail: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="border-t pt-4 mt-4">
                                <h3 className="font-semibold mb-4">Change Password</h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">New Password</Label>
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            placeholder="Enter new password"
                                            value={formData.newPassword}
                                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="Confirm new password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4 mt-4 bg-amber-50/50 p-4 rounded-lg">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword" className="text-amber-900">Current Password (Required to save changes)</Label>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        required
                                        value={formData.currentPassword}
                                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                        className="border-amber-200 focus:ring-amber-500"
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {loading ? 'Saving Changes...' : 'Save Changes'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>

                <Card className="border-red-500/20 bg-red-500/5">
                    <CardHeader>
                        <CardTitle className="text-red-700 flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Security Tips
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-red-600 space-y-2">
                        <li>Use a password with at least 12 characters, including numbers and symbols.</li>
                        <li>Do not reuse this password for other accounts.</li>
                        <li>Anyone with these credentials can access and modify your entire platform.</li>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
