import { Suspense } from 'react';
import { fetchResources } from './actions';
import ResourcesClient from './resources-client';
import { Loader2 } from 'lucide-react';

// Types
type ResourceDiscipline = 'General' | 'CSE' | 'Civil' | 'EEE' | 'Textile' | 'Mechanical' | 'Architecture';
type ResourceCategory = 'Knowledge & Research' | 'Code & Tools' | 'Career & Learning';

interface EngineeringResource {
    id: string;
    title: string;
    description: string;
    resource_type: string;
    category: ResourceCategory;
    discipline: ResourceDiscipline;
    author_id: string;
    author_name: string;
    author_avatar?: string;
    author_org?: string;
    external_url: string;
    embed_url?: string;
    upvote_count: number;
    bookmark_count: number;
    view_count: number;
    created_at: string;
    year?: string;
    license?: string;
    skill_level: 'Beginner' | 'Intermediate' | 'Advanced';
    is_premium?: boolean;
    tags: string[];
    slug: string;
}

// Enable ISR with revalidation every 60 seconds
export const revalidate = 60;

// Enable dynamic rendering for search params
// export const dynamic = 'force-dynamic';

interface PageProps {
    searchParams: Promise<{
        category?: string;
        discipline?: string;
        query?: string;
    }>;
}

async function ResourcesLoader({ searchParams }: PageProps) {
    const params = await searchParams;

    // Fetch resources on server side with caching
    const data = await fetchResources({
        category: params.category || 'All',
        discipline: params.discipline || 'All',
        query: params.query || ''
    });

    // Map data to expected format
    const resources: EngineeringResource[] = data?.map((r: any) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        resource_type: r.resource_type,
        category: r.category,
        discipline: r.discipline,
        author_id: r.author_id,
        author_name: r.profiles?.full_name || 'Anonymous',
        author_avatar: r.profiles?.avatar_url,
        author_org: r.author_org,
        external_url: r.external_url,
        embed_url: r.embed_url,
        upvote_count: r.upvote_count || 0,
        bookmark_count: r.bookmark_count || 0,
        view_count: r.view_count || 0,
        created_at: r.created_at,
        year: r.year,
        license: r.license,
        skill_level: r.skill_level || 'Beginner',
        is_premium: r.is_premium,
        tags: r.tags || [],
        slug: r.slug || r.id
    })) || [];

    return <ResourcesClient initialResources={resources} />;
}

export default function ResourcesPage(props: PageProps) {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                        Loading Resources...
                    </p>
                </div>
            </div>
        }>
            <ResourcesLoader searchParams={props.searchParams} />
        </Suspense>
    );
}

// Generate metadata for SEO
export async function generateMetadata() {
    return {
        title: 'Open Engineering Resources | Engineer for Society',
        description: 'Discover and contribute specialized engineering knowledge, research papers, tools, and learning resources for the global engineering community.',
        openGraph: {
            title: 'Open Engineering Resources',
            description: 'Discover and contribute specialized engineering knowledge',
            type: 'website',
        },
    };
}
