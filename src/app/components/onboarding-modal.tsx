'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

type OnboardingData = {
    full_name: string
    username: string
    bio: string
    location: string
    user_type: string
    engineering_field: string
    years_of_experience: number
    job_title: string
    company: string
}

export function OnboardingModal() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [step, setStep] = useState(1)
    const router = useRouter()
    const { toast } = useToast()
    const supabase = createClient()

    const [formData, setFormData] = useState<OnboardingData>({
        full_name: '',
        username: '',
        bio: '',
        location: '',
        user_type: '',
        engineering_field: '',
        years_of_experience: 0,
        job_title: '',
        company: '',
    })

    useEffect(() => {
        const checkOnboardingStatus = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) return

            const { data: profile } = await supabase
                .from('profiles')
                .select('is_onboarding_complete, full_name, username')
                .eq('id', user.id)
                .single()

            if (profile && !profile.is_onboarding_complete) {
                setFormData(prev => ({
                    ...prev,
                    full_name: profile.full_name || user.user_metadata?.full_name || '',
                    username: profile.username || '',
                }))
                setOpen(true)
            }
            setLoading(false)
        }

        checkOnboardingStatus()
    }, [supabase])

    const handleSubmit = async () => {
        if (!formData.full_name || !formData.username || !formData.user_type) {
            toast({
                title: 'Missing Information',
                description: 'Please fill in all required fields (marked with *)',
                variant: 'destructive',
            })
            return
        }

        setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No user found')

            const { error } = await supabase
                .from('profiles')
                .update({
                    ...formData,
                    is_onboarding_complete: true,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id)

            if (error) throw error

            toast({
                title: 'Profile Completed!',
                description: 'Welcome to Engineer For Society',
            })

            setOpen(false)
            router.refresh()
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            })
        } finally {
            setSaving(false)
        }
    }

    if (loading) return null

    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="text-2xl">Welcome to Engineer For Society! 🎉</DialogTitle>
                    <DialogDescription>
                        Let's set up your profile to help you connect with the community
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Step 1: Basic Info */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="full_name">Full Name *</Label>
                                <Input
                                    id="full_name"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="username">Username *</Label>
                                <Input
                                    id="username"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                                    placeholder="john_doe"
                                />
                                <p className="text-xs text-muted-foreground">This will be your unique identifier</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="user_type">I am a *</Label>
                                <Select value={formData.user_type} onValueChange={(value) => setFormData({ ...formData, user_type: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="student">Student</SelectItem>
                                        <SelectItem value="new_engineer">New Engineer (0-2 years)</SelectItem>
                                        <SelectItem value="experienced">Experienced Engineer (3+ years)</SelectItem>
                                        <SelectItem value="aspiring">Aspiring Engineer</SelectItem>
                                        <SelectItem value="non_traditional">Non-Traditional Background</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <Input
                                    id="location"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="San Francisco, CA"
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button onClick={() => setStep(2)}>Next</Button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Professional Info */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="engineering_field">Engineering Field</Label>
                                <Input
                                    id="engineering_field"
                                    value={formData.engineering_field}
                                    onChange={(e) => setFormData({ ...formData, engineering_field: e.target.value })}
                                    placeholder="Software Engineering, Mechanical, etc."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="job_title">Current Job Title</Label>
                                <Input
                                    id="job_title"
                                    value={formData.job_title}
                                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                                    placeholder="Full-Stack Developer"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="company">Company/Organization</Label>
                                <Input
                                    id="company"
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    placeholder="Engineer For Society"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="years_of_experience">Years of Experience</Label>
                                <Input
                                    id="years_of_experience"
                                    type="number"
                                    min="0"
                                    value={formData.years_of_experience}
                                    onChange={(e) => setFormData({ ...formData, years_of_experience: parseInt(e.target.value) || 0 })}
                                    placeholder="3"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="Tell us about yourself, your interests, and what you're passionate about..."
                                    rows={4}
                                />
                                <p className="text-xs text-muted-foreground">This will appear on your profile</p>
                            </div>

                            <div className="flex justify-between gap-2">
                                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                                <Button onClick={handleSubmit} disabled={saving}>
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Complete Profile
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
