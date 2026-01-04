
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { sampleUserProfile } from '@/lib/data';
import { Switch } from '@/components/ui/switch';

type EditProfileModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function EditProfileModal({ isOpen, onOpenChange }: EditProfileModalProps) {
  const handleSaveChanges = () => {
    // In a real app, you would handle form submission here.
    console.log('Saving changes...');
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Edit intro</DialogTitle>
          <DialogDescription>* Indicates required</DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto p-1">
            <div className="space-y-6 pr-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First name *</Label>
                        <Input id="firstName" defaultValue={sampleUserProfile.name.split(' ')[0]} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">Last name *</Label>
                        <Input id="lastName" defaultValue={sampleUserProfile.name.split(' ')[1]} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="additionalName">Additional name</Label>
                    <Input id="additionalName" />
                </div>
                 <div className="space-y-2">
                    <Label>Name pronunciation</Label>
                    <p className="text-sm text-muted-foreground">This can only be added using our mobile app</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="headline">Headline *</Label>
                    <Input id="headline" defaultValue="Full-Stack Developer @EFS | Using tech for social good" />
                </div>
                
                <Separator />

                <div className="space-y-4">
                    <h3 className="font-semibold">Current position</h3>
                     <div className="space-y-2">
                        <Label htmlFor="position">Position *</Label>
                        <Input id="position" defaultValue="Full-Stack Developer" />
                    </div>
                    <Button variant="link" className="p-0 h-auto">Add new position</Button>
                    <div className="flex items-center space-x-2 pt-2">
                        <Switch id="show-current-company" defaultChecked />
                        <Label htmlFor="show-current-company">Show current company in my intro</Label>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="industry">Industry *</Label>
                    <Input id="industry" defaultValue="Technology, Information and Media" />
                    <p className="text-xs text-muted-foreground">Learn more about <a href="#" className="text-primary hover:underline">industry options</a></p>
                </div>

                 <Separator />

                <div className="space-y-4">
                     <h3 className="font-semibold">Education</h3>
                     <div className="space-y-2">
                        <Label htmlFor="school">School *</Label>
                        <Input id="school" defaultValue="Stanford University" />
                    </div>
                    <Button variant="link" className="p-0 h-auto">Add new education</Button>
                     <div className="flex items-center space-x-2 pt-2">
                        <Switch id="show-school" defaultChecked />
                        <Label htmlFor="show-school">Show school in my intro</Label>
                    </div>
                </div>
                
                 <Separator />

                 <div className="space-y-4">
                    <h3 className="font-semibold">Location</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="countryRegion">Country/Region *</Label>
                            <Input id="countryRegion" defaultValue="United States" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" defaultValue="San Francisco, CA" />
                        </div>
                    </div>
                </div>

                 <Separator />

                <div className="space-y-2">
                    <h3 className="font-semibold">Contact info</h3>
                    <p className="text-sm text-muted-foreground">Add or edit your profile URL, email, and more</p>
                    <Button variant="link" className="p-0 h-auto">Edit contact info</Button>
                </div>
            </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveChanges}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
