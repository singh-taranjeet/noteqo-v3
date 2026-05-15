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
import { Link } from "react-router-dom";
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
                className="basis-full sm:basis-1/2 md:basis-1/2 lg:basis-1/3 shrink-0"
              >
                <Card className="h-64 flex flex-col overflow-hidden border shadow-sm p-0 gap-0">
                  <div className="h-36 w-full bg-muted/50 flex-shrink-0" />
                  <CardContent className="flex-1 p-4 pt-4 flex flex-col justify-start">
                    <Skeleton className="h-3 w-20 mb-2" />
                    <Skeleton className="h-5 w-3/4 mb-3" />
                    <Skeleton className="h-3 w-1/2 mt-auto" />
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
                  className="basis-full sm:basis-1/2 md:basis-1/2 lg:basis-1/3"
                >
                  <Link
                    to={ROUTES.NOTE(note.id)}
                    className="block h-full !no-underline group"
                  >
                    <Card className="h-64 flex flex-col overflow-hidden hover:border-primary/50 transition-all duration-300 group-hover:shadow-md cursor-pointer border bg-card p-0 gap-0">
                      {/* Image / Background Section */}
                      <div className="relative h-36 w-full overflow-hidden bg-muted/30 flex-shrink-0 border-b">
                        {note.coverImage ? (
                          <img
                            src={note.coverImage}
                            alt=""
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                            <span
                              className="text-5xl opacity-80"
                              role="img"
                              aria-hidden="true"
                            >
                              {note.emoji || "📄"}
                            </span>
                          </div>
                        )}
                        {/* Floating Emoji if cover image is present */}
                        {note.coverImage && (
                          <div className="absolute bottom-3 left-4 bg-background/80 backdrop-blur-md rounded-full w-10 h-10 shadow-sm border flex items-center justify-center">
                            <span
                              className="text-xl leading-none block"
                              role="img"
                              aria-hidden="true"
                            >
                              {note.emoji || "📄"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content Section */}
                      <CardContent className="flex-1 p-4 flex flex-col">
                        <div className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase mb-1.5">
                          Recent Note
                        </div>
                        <h3 className="text-base font-semibold leading-tight line-clamp-1 group-hover:text-primary transition-colors mb-1">
                          {note.title || "Untitled"}
                        </h3>

                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-auto pt-2">
                          <Clock size={12} />
                          <span className="truncate">
                            Updated{" "}
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
