
import { Suspense } from 'react';
import { getProjects } from '@/lib/project-service';
import { ProjectsClient } from './projects-client';
import {
  Zap, Speaker, Wifi, Settings, Home as HomeIcon, Plane,
  FlaskConical, Leaf, Bot, Gamepad2, Lightbulb, Monitor, Watch,
  Plus, Filter, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProjectForm } from '@/components/projects/project-form';

// ISR Configuration
export const revalidate = 60; // Refresh every 60 seconds

const categories = [
  { name: 'All', icon: Zap },
  { name: 'Audio & Sound', icon: Speaker },
  { name: 'IoT', icon: Wifi },
  { name: 'Installations', icon: Settings },
  { name: 'Home Automation', icon: HomeIcon },
  { name: 'Flying Things', icon: Plane },
  { name: 'Lab Tools', icon: FlaskConical },
  { name: 'Environment', icon: Leaf },
  { name: 'Robotics', icon: Bot },
  { name: 'Games', icon: Gamepad2 },
  { name: 'Smart Lighting', icon: Lightbulb },
  { name: 'Displays', icon: Monitor },
  { name: 'Wearables', icon: Watch },
];

const allTags = [
  'Animals', 'Arduino User Group', 'Audio', 'Cars', 'Clocks', 'Communication',
  'Data Collection', 'Debugging Tools', 'Disability Reduction', 'Drones',
  'Embedded', 'Energy Efficiency', 'Entertainment System', 'Environmental Sensing',
  'Food And Drinks', 'Games', 'Garden', 'Greener Planet', 'Health',
  'Helicopters', 'Home Automation', 'Human Welfare', 'Internet Of Things',
  'Kids', 'Lights', 'Monitoring', 'Music', 'Passenger Vehicles', 'Pets',
  'Planes', 'Remote Control', 'Robots', 'Security', 'Smart appliances',
  'Smartwatches', 'Tools', 'Toys', 'Tracking', 'Transportation',
  'Wardriving', 'Wearables', 'Weather'
];

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/5 pb-16 pt-24 md:pt-32">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-8">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Build. Share. Innovate.
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground md:text-xl">
              The premium hub for engineers to showcase their inventions, layouts, and code.
              Join the community of creators.
            </p>

            <div className="w-full max-w-2xl flex items-center gap-2 relative">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="What do you want to build today?"
                  className="pl-10 h-12 text-lg shadow-sm border-muted-foreground/20 focus-visible:ring-primary/20"
                />
              </div>
              <Button size="lg" className="h-12 px-8 shadow-md">Search</Button>
            </div>

            <div className="flex gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" className="gap-2 shadow-lg">
                    <Plus className="h-5 w-5" /> Add Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl h-[90vh] p-0 flex flex-col gap-0 overflow-hidden">
                  <div className="p-6 pb-2 shrink-0">
                    <DialogHeader>
                      <DialogTitle>Create New Project</DialogTitle>
                      <DialogDescription>
                        Share your engineering journey with the world.
                      </DialogDescription>
                    </DialogHeader>
                  </div>
                  <ScrollArea className="flex-1 p-6 pt-2">
                    <ProjectForm />
                  </ScrollArea>
                  <DialogFooter className="p-6 pt-2 shrink-0 border-t bg-background z-10">
                    <Button variant="outline">Save as Draft</Button>
                    <Button type="submit">Publish Project</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button variant="outline" size="lg" className="gap-2">
                <Filter className="h-5 w-5" /> Filters
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={<div className="container py-20 text-center text-muted-foreground animate-pulse">Loading Projects...</div>}>
        <ProjectsClient initialProjects={projects} allTags={allTags} />
      </Suspense>
    </div>
  );
}
