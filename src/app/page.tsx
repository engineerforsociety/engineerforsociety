import {
  ArrowRight,
  BookCopy,
  Briefcase,
  HeartHandshake,
  Lightbulb,
  Map,
  MessageSquare,
  Mic,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const features = [
  {
    icon: MessageSquare,
    title: 'Community Forums',
    description: 'Engage in discussions, ask questions, and share your knowledge with the community.',
    href: '/forums',
    color: 'text-sky-500',
    bgColor: 'bg-sky-50',
  },
  {
    icon: HeartHandshake,
    title: 'Social Impact',
    description: 'Coordinate and participate in events that make a positive difference in society.',
    href: '/social-impact',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
  },
  {
    icon: Mic,
    title: 'Podcast Hub',
    description: 'Listen to insightful podcasts from industry leaders and innovators.',
    href: '/podcasts',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
  },
  {
    icon: BookCopy,
    title: 'Resource Library',
    description: 'Access a curated collection of documents, guides, and learning materials.',
    href: '/resources',
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
  },
  {
    icon: Map,
    title: 'Local Chapters',
    description: 'Connect with engineers in your area for local events and networking.',
    href: '/chapters',
    color: 'text-rose-500',
    bgColor: 'bg-rose-50',
  },
  {
    icon: Briefcase,
    title: 'Job Board',
    description: 'Find your next career opportunity with our AI-powered job matching.',
    href: '/jobs',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-lg border bg-card text-card-foreground shadow-sm p-8 text-center bg-gradient-to-br from-primary to-blue-900/90 text-primary-foreground">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Engineer For Society
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-primary-foreground/80">
          A vibrant community for engineers to collaborate, innovate, and drive social change.
        </p>
        <div className="mt-6 flex gap-4 justify-center">
          <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
            <Link href="/jobs">Find a Job</Link>
          </Button>
          <Button size="lg" variant="secondary" className="bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20" asChild>
            <Link href="/social-impact">Join an Event</Link>
          </Button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-4">
          Explore Our Platform
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="hover:shadow-lg transition-shadow duration-300 group">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className={`p-3 rounded-full ${feature.bgColor} dark:bg-transparent`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
                <Button variant="link" className="p-0 mt-2 text-primary group-hover:text-accent" asChild>
                  <Link href={feature.href}>
                    Learn More <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
