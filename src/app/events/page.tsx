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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar } from 'lucide-react';

const mapImage = PlaceHolderImages.find((p) => p.id === 'chapters-map');

const events = [
  {
    id: 'event-1',
    title: 'Bay Area: AI in Robotics Workshop',
    date: 'October 26, 2024',
    location: 'San Francisco, CA',
    image: PlaceHolderImages.find((p) => p.id === 'event-1'),
  },
  {
    id: 'event-2',
    title: 'NYC: Clean Tech Hackathon',
    date: 'November 9, 2024',
    location: 'New York, NY',
    image: PlaceHolderImages.find((p) => p.id === 'event-2'),
  },
];

const chapters = [
  { name: 'San Francisco Bay Area', members: 1200 },
  { name: 'New York City', members: 950 },
  { name: 'Boston', members: 780 },
  { name: 'Austin', members: 610 },
  { name: 'Seattle', members: 550 },
];

export default function ChaptersPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Events & Workshops
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Join our global community for learning and networking.
        </p>
      </div>

      <Card className="overflow-hidden">
        {mapImage && (
          <div className="relative h-64 md:h-96 w-full">
            <Image
              src={mapImage.imageUrl}
              alt="Map of local chapters"
              fill
              className="object-cover"
              data-ai-hint={mapImage.imageHint}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 text-white">
              <h2 className="text-2xl md:text-4xl font-bold">Find a Chapter Near You</h2>
            </div>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-2xl font-bold tracking-tight">Upcoming Events</h3>
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              {event.image && (
                <div className="relative h-48 w-full">
                  <Image
                    src={event.image.imageUrl}
                    alt={event.title}
                    fill
                    className="object-cover"
                    data-ai-hint={event.image.imageHint}
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-between items-center text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {event.location}</div>
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {event.date}</div>
              </CardContent>
              <CardFooter>
                <Button>RSVP Now</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="space-y-6">
          <h3 className="text-2xl font-bold tracking-tight">Top Chapters</h3>
          <Card>
            <CardContent className="p-4">
              <ul className="space-y-2">
                {chapters.map((chapter) => (
                  <li key={chapter.name} className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50">
                    <span className="font-medium">{chapter.name}</span>
                    <Badge variant="outline">{chapter.members} members</Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
