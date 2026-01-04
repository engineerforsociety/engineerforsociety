import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PlayCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const podcasts = [
  {
    id: 'podcast-1',
    title: 'The Future of AI in Structural Engineering',
    description: 'An interview with Dr. Aris Thorne on how machine learning is revolutionizing bridge and building design.',
    duration: '45 min',
    image: PlaceHolderImages.find((p) => p.id === 'podcast-1'),
    tags: ['AI', 'Civil Engineering'],
  },
  {
    id: 'podcast-2',
    title: 'From Garage to Global: A Startup Story',
    description: 'The founders of Innovate Robotics share their journey from a small workshop to a leading automation company.',
    duration: '62 min',
    image: PlaceHolderImages.find((p) => p.id === 'podcast-2'),
    tags: ['Startups', 'Robotics'],
  },
  {
    id: 'podcast-3',
    title: 'Sustainable Energy Solutions',
    description: 'A deep dive into the latest advancements in renewable energy, from solar panel efficiency to grid-scale storage.',
    duration: '53 min',
    image: PlaceHolderImages.find((p) => p.id === 'podcast-3'),
    tags: ['Energy', 'Sustainability'],
  },
];

export default function PodcastsPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Engineering Podcast Hub
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Tune in to the voices shaping the future of engineering.
        </p>
      </div>

      <div className="space-y-6">
        {podcasts.map((podcast) => (
          <Card key={podcast.id} className="flex flex-col md:flex-row overflow-hidden hover:shadow-lg transition-shadow duration-300">
            {podcast.image && (
              <div className="relative h-48 md:h-auto md:w-64 flex-shrink-0">
                <Image
                  src={podcast.image.imageUrl}
                  alt={podcast.title}
                  fill
                  className="object-cover"
                  data-ai-hint={podcast.image.imageHint}
                />
              </div>
            )}
            <div className="flex flex-col flex-1">
              <CardHeader>
                <CardTitle className="text-xl">{podcast.title}</CardTitle>
                <CardDescription>{podcast.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex space-x-2">
                  {podcast.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <div className="flex items-center text-muted-foreground text-sm">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{podcast.duration}</span>
                </div>
                <button className="flex items-center gap-2 text-primary hover:text-accent transition-colors">
                  <PlayCircle className="h-10 w-10" />
                </button>
              </CardFooter>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
