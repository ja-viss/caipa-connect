'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import type { Resource } from '@/lib/types';
import { Badge } from '../ui/badge';
import Image from 'next/image';

interface ResourceDialogProps {
  resource: Resource;
  children: React.ReactNode;
}

export function ResourceDialog({ resource, children }: ResourceDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <div className="relative h-60 w-full mb-4">
             <Image
                src={resource.thumbnail.imageUrl}
                alt={resource.title}
                fill
                data-ai-hint={resource.thumbnail.imageHint}
                className="object-cover rounded-t-lg"
             />
          </div>
          <Badge variant="secondary" className="w-fit">{resource.category}</Badge>
          <DialogTitle className="text-2xl">{resource.title}</DialogTitle>
          <DialogDescription>{resource.description}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[50vh] mt-4">
          <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap p-1">
            {resource.content}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
