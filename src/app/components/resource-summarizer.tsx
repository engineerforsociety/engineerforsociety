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

const initialState = {};

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
    <Card className="sticky top-20">
      <form action={formAction}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="text-primary" /> AI Document Summarizer
          </CardTitle>
          <CardDescription>
            Paste the content of a long document below to get a quick, AI-generated summary.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="documentContent">Document Content</Label>
            <Textarea
              id="documentContent"
              name="documentContent"
              placeholder="Paste your document here... (minimum 100 characters)"
              rows={10}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <SubmitButton />
        </CardFooter>
      </form>
      
      {state.summary && (
        <CardContent>
            <Alert>
                <Lightbulb className="h-4 w-4"/>
                <AlertTitle>Summary Result</AlertTitle>
                <AlertDescription className="prose prose-sm dark:prose-invert max-w-none">
                    <p>{state.summary}</p>
                </AlertDescription>
            </Alert>
        </CardContent>
      )}
    </Card>
  );
}
