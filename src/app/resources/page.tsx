import { FileText, Github, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResourceSummarizer } from '../components/resource-summarizer';

const resources = [
    {
        title: "Advanced React Patterns",
        description: "A guide to advanced component design and state management.",
        icon: FileText,
        link: "#",
    },
    {
        title: "Introduction to Machine Learning",
        description: "Comprehensive documentation on foundational ML concepts.",
        icon: FileText,
        link: "#",
    },
    {
        title: "The Rust Programming Language",
        description: "The official book on systems programming with Rust.",
        icon: BookOpen,
        link: "#",
    },
    {
        title: "Awesome for Engineers Repo",
        description: "A curated list of awesome lists for engineers.",
        icon: Github,
        link: "#",
    }
]

export default function ResourcesPage() {
  return (
    <div className="grid gap-12 lg:grid-cols-5">
      <aside className="lg:col-span-2 space-y-8">
        <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Resource Library</h1>
            <p className="text-lg text-muted-foreground">
                Your knowledge hub for engineering excellence.
            </p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Featured Documents</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {resources.map(resource => (
                        <li key={resource.title}>
                            <a href={resource.link} className="flex items-start gap-4 p-2 -m-2 rounded-lg hover:bg-muted/50 transition-colors">
                                <resource.icon className="h-5 w-5 mt-1 text-primary"/>
                                <div>
                                    <p className="font-medium">{resource.title}</p>
                                    <p className="text-sm text-muted-foreground">{resource.description}</p>
                                </div>
                            </a>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
      </aside>

      <main className="lg:col-span-3">
        <ResourceSummarizer />
      </main>
    </div>
  );
}
