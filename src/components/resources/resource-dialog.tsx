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
      <DialogContent className="sm:max-w-3xl p-0">
        <ScrollArea className="max-h-[80vh]">
            <div className="relative h-48 sm:h-64 w-full">
             <Image
                src={resource.thumbnail.imageUrl}
                alt={resource.title}
                fill
                data-ai-hint={resource.thumbnail.imageHint}
                className="object-cover"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <div className="p-6">
                <DialogHeader className="text-left">
                    <Badge variant="secondary" className="w-fit mb-2">{resource.category}</Badge>
                    <DialogTitle className="text-2xl sm:text-3xl">{resource.title}</DialogTitle>
                    <DialogDescription className="text-base">{resource.description}</DialogDescription>
                </DialogHeader>
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap mt-4 text-foreground/80">
                    {resource.content}
                </div>
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
