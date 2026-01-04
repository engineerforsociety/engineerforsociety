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
import { Eye, GitBranch, Github, Users, Star } from 'lucide-react';
import { sampleProjects } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Project Showcase
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Explore innovative projects from our community members.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sampleProjects.map((project) => {
          const projectImage = PlaceHolderImages.find(
            (p) => p.id === project.imageId
          );
          const ownerImage = PlaceHolderImages.find(
            (p) => p.id === project.owner.avatarId
          );
          return (
            <Card
              key={project.id}
              className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {projectImage && (
                <div className="relative h-48 w-full">
                  <Image
                    src={projectImage.imageUrl}
                    alt={project.title}
                    fill
                    className="object-cover"
                    data-ai-hint={projectImage.imageHint}
                  />
                  {project.isSeekingCollaborators && (
                     <Badge className="absolute top-2 right-2" variant="secondary">
                        <Users className="mr-1 h-3 w-3" /> Seeking Collaborators
                    </Badge>
                  )}
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{project.title}</CardTitle>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                 <div className="flex flex-wrap gap-2">
                    {project.technologies.map(tech => (
                        <Badge key={tech} variant="outline">{tech}</Badge>
                    ))}
                 </div>
                 <div className="flex items-center text-sm text-muted-foreground pt-2 border-t">
                    <div className="flex items-center gap-2">
                         <Avatar className="h-6 w-6">
                            {ownerImage && <AvatarImage src={ownerImage.imageUrl} alt={project.owner.name} />}
                            <AvatarFallback>{project.owner.name.substring(0,2)}</AvatarFallback>
                        </Avatar>
                        <span>{project.owner.name}</span>
                    </div>
                    <div className="ml-auto flex items-center gap-4">
                         <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger className='flex items-center gap-1'>
                                    <Star className="h-4 w-4" /> {project.likeCount}
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Likes</p>
                                </TooltipContent>
                            </Tooltip>
                         </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger className='flex items-center gap-1'>
                                    <Eye className="h-4 w-4" /> {project.viewCount}
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Views</p>
                                </TooltipContent>
                            </Tooltip>
                         </TooltipProvider>
                    </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline">
                    <Github className="mr-2 h-4 w-4"/>
                    Source
                </Button>
                <Button>View Project</Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
