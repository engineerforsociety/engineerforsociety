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
import { Heart, Users, BrainCircuit } from 'lucide-react';

const initiatives = [
  {
    id: 'blood-drive',
    title: 'Annual Blood Donation Drive',
    description: 'Help save lives by donating blood at our coordinated events across the country. Every pint counts.',
    icon: Heart,
    image: PlaceHolderImages.find((p) => p.id === 'blood-drive'),
    badge: 'Health',
    badgeVariant: 'destructive'
  },
  {
    id: 'mentorship-matching',
    title: 'Mentorship Matching',
    description: 'Guide the next generation of engineers or find a mentor to help you navigate your career path.',
    icon: Users,
    image: PlaceHolderImages.find((p) => p.id === 'mentorship'),
    badge: 'Professional Development',
    badgeVariant: 'secondary'
  },
  {
    id: 'skills-exchange',
    title: 'Skills Exchange Workshops',
    description: 'Share your expertise or learn a new skill in our peer-led workshops. From coding to CAD, there is something for everyone.',
    icon: BrainCircuit,
    image: PlaceHolderImages.find((p) => p.id === 'skills-exchange'),
    badge: 'Education',
    badgeVariant: 'default'
  },
];

export default function SocialImpactPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Social Impact
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Use your engineering skills to make a tangible difference in the community.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {initiatives.map((item) => (
          <Card key={item.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300">
            {item.image && (
              <div className="relative h-48 w-full">
                <Image
                  src={item.image.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover"
                  data-ai-hint={item.image.imageHint}
                />
              </div>
            )}
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{item.title}</CardTitle>
                {item.icon && <item.icon className="h-6 w-6 text-muted-foreground" />}
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <CardDescription>{item.description}</CardDescription>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <Badge variant={item.badgeVariant as any}>{item.badge}</Badge>
              <Button>Learn More</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
