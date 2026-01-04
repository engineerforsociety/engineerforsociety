import { requireAdmin, adminLogout } from '@/lib/admin-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Users,
    MessageSquare,
    Briefcase,
    Calendar,
    Settings,
    LogOut,
    Shield,
    BarChart3
} from 'lucide-react'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminDashboard() {
    const admin = await requireAdmin()

    async function handleLogout() {
        'use server'
        await adminLogout()
        redirect('/admin/login')
    }

    return (
        <div className="min-h-screen bg-muted/40">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background">
                <div className="container flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <Shield className="h-6 w-6 text-primary" />
                        <h1 className="text-xl font-bold">Admin Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-sm">
                            <p className="font-medium">{admin.full_name || 'Admin'}</p>
                            <p className="text-muted-foreground text-xs">{admin.email}</p>
                        </div>
                        <Link href="/admin/settings">
                            <Button variant="ghost" size="icon">
                                <Settings className="h-4 w-4" />
                            </Button>
                        </Link>
                        <form action={handleLogout}>
                            <Button variant="outline" size="sm">
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </Button>
                        </form>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto p-6">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold tracking-tight">Welcome back!</h2>
                    <p className="text-muted-foreground">
                        Here's what's happening with your platform today.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">-</div>
                            <p className="text-xs text-muted-foreground">Loading...</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Forum Posts</CardTitle>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">-</div>
                            <p className="text-xs text-muted-foreground">Loading...</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">-</div>
                            <p className="text-xs text-muted-foreground">Loading...</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">-</div>
                            <p className="text-xs text-muted-foreground">Loading...</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Management</CardTitle>
                            <CardDescription>
                                View and manage registered users.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full">
                                <Users className="mr-2 h-4 w-4" />
                                Manage Users
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Content Moderation</CardTitle>
                            <CardDescription>
                                Review and moderate forum posts and comments.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Moderate Content
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Analytics</CardTitle>
                            <CardDescription>
                                View platform statistics and insights.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full">
                                <BarChart3 className="mr-2 h-4 w-4" />
                                View Analytics
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Events Management</CardTitle>
                            <CardDescription>
                                Create and manage platform events.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full">
                                <Calendar className="mr-2 h-4 w-4" />
                                Manage Events
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Job Postings</CardTitle>
                            <CardDescription>
                                Review and approve job postings.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full">
                                <Briefcase className="mr-2 h-4 w-4" />
                                Manage Jobs
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>System Settings</CardTitle>
                            <CardDescription>
                                Configure platform settings and preferences.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/admin/settings">
                                <Button className="w-full">
                                    <Settings className="mr-2 h-4 w-4" />
                                    Settings
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                {/* Security Notice */}
                <Card className="mt-8 border-amber-500/50 bg-amber-500/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-700">
                            <Shield className="h-5 w-5" />
                            Security Notice
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-amber-700">
                            If you're using the default credentials (admin@engineerforsociety.com / admin123),
                            please change them immediately for security reasons. Go to Settings → Change Password.
                        </p>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
