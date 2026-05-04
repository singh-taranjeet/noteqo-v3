"use client";
import { Clock, Home } from "lucide-react";

import { useRecentNotes } from "@/features/workspace/hooks/useRecentNotes";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Empty,
  EmptyTitle,
  EmptyDescription,
  EmptyHeader,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export function DashboardView() {
  const { notes: recentNotes, isLoading } = useRecentNotes();

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full px-4 py-8 md:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Home size={32} className="text-primary" />
            Home
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here are your recent notes.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="w-full px-4 sm:px-12 mt-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            Recently Opened
          </h2>
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 shrink-0"
              >
                <Card className="h-40 flex flex-col">
                  <CardContent className="flex-1 p-5 flex flex-col justify-between">
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-8 w-8 rounded-md mb-1" />
                      <Skeleton className="h-5 w-3/4 rounded-md" />
                    </div>
                    <Skeleton className="h-4 w-1/2 rounded-md mt-3" />
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      ) : recentNotes.length === 0 ? (
        <Empty className="flex-1 mt-8">
          <EmptyHeader>
            <EmptyTitle>No recent notes found.</EmptyTitle>
            <EmptyDescription>
              You haven&apos;t opened any notes recently.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="w-full px-4 sm:px-12">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            Recently Opened
          </h2>
          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full"
          >
            <CarouselContent>
              {recentNotes.map((note) => (
                <CarouselItem
                  key={note.id}
                  className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <Link
                    href={ROUTES.NOTE(note.id)}
                    className="block h-full !no-underline group"
                  >
                    <Card className="h-full flex flex-col hover:border-primary/50 transition-all duration-200 group-hover:shadow-md cursor-pointer">
                      <CardContent className="flex-1 p-5 flex flex-col justify-between h-40">
                        <div className="flex flex-col gap-2">
                          <span
                            className="text-3xl mb-1"
                            role="img"
                            aria-hidden="true"
                          >
                            {note.emoji || "📄"}
                          </span>
                          <h3 className="font-medium text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                            {note.title || "Untitled"}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-3">
                          <Clock size={12} />
                          <span className="truncate">
                            {formatDistanceToNow(new Date(note.updatedAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        </div>
      )}
    </div>
  );
}
