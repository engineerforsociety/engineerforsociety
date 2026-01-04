import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Building, GitFork, Lightbulb, Sigma, UserPlus } from 'lucide-react';

const forums = [
  {
    icon: UserPlus,
    title: 'New Engineers',
    description: 'A space for students and recent graduates to ask questions and find support.',
    color: 'text-sky-500',
    bgColor: 'bg-sky-50',
  },
  {
    icon: GitFork,
    title: 'Alternative Pathways',
    description: 'Discussing non-traditional routes into engineering and tech careers.',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
  },
  {
    icon: Sigma,
    title: 'Math & Science Support',
    description: 'Get help with fundamental concepts, homework, and theoretical questions.',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
  },
  {
    icon: Building,
    title: 'Industry Discussions',
    description: 'Talk about trends, challenges, and innovations in various engineering fields.',
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
  },
  {
    icon: Lightbulb,
    title: 'Project Showcases',
    description: 'Share your personal projects, get feedback, and find collaborators.',
    color: 'text-rose-500',
    bgColor: 'bg-rose-50',
  },
];

export default function ForumsPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Community Forums
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Connect, learn, and grow with fellow engineers.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {forums.map((forum) => (
          <Card key={forum.title} className="flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className={`rounded-lg p-3 ${forum.bgColor} dark:bg-card`}>
                  <forum.icon className={`h-8 w-8 ${forum.color}`} />
                </div>
                <CardTitle>{forum.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{forum.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
