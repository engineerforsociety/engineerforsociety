'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { getSummary } from '@/app/resources/actions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileText, Wand2, Loader2, ServerCrash, Lightbulb } from 'lucide-react';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

type SummarizeState = {
  summary?: string;
  error?: string;
};

const initialState: SummarizeState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Summarizing...
        </>
      ) : (
        <>
          <Wand2 className="mr-2 h-4 w-4" />
          Generate Summary
        </>
      )}
    </Button>
  );
}

export function ResourceSummarizer() {
  const [state, formAction] = useFormState(getSummary, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.error) {
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: state.error,
      });
    }
  }, [state.error, toast]);

  return (
    <Card className="rounded-2xl border-muted/60 overflow-hidden bg-background/50 backdrop-blur-sm">
      <form action={formAction}>
        <div className="bg-primary/5 p-6 border-b border-border/50">
          <CardTitle className="flex items-center gap-3 text-2xl font-black italic">
            <div className="bg-primary/10 p-2 rounded-xl">
              <Wand2 className="text-primary h-6 w-6" />
            </div>
            AI SUMMARIZER
          </CardTitle>
          <CardDescription className="mt-2 font-medium">
            Instantly distill complex technical manuals or research papers into actionable insights.
          </CardDescription>
        </div>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-3">
            <Label htmlFor="documentContent" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 px-1">Document Content</Label>
            <Textarea
              id="documentContent"
              name="documentContent"
              placeholder="Paste your document here... (minimum 100 characters)"
              rows={8}
              className="rounded-xl border-muted focus-visible:ring-primary/20 resize-none bg-background/50"
              required
            />
          </div>
        </CardContent>
        <CardFooter className="px-6 pb-6 pt-0 flex justify-end">
          <SubmitButton />
        </CardFooter>
      </form>

      {state.summary && (
        <CardContent className="px-6 pb-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-primary h-6 w-6 rounded-lg flex items-center justify-center">
                <Lightbulb className="h-4 w-4 text-primary-foreground font-black" />
              </div>
              <h4 className="text-sm font-black uppercase tracking-widest text-primary">Insight Summary</h4>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 leading-relaxed font-medium">
              <p>{state.summary}</p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
