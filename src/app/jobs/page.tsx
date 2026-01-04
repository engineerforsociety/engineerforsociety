import { Briefcase } from 'lucide-react';
import { JobMatcher } from '../components/job-matcher';

export default function JobsPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <Briefcase className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Job Board
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Let our AI find the perfect engineering role for you.
            </p>
          </div>
        </div>
      </div>

      <JobMatcher />
    </div>
  );
}
