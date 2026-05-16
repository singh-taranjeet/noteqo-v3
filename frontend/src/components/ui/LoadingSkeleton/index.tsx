import { ContentSkeletonHeader, ContentSkeletonBlock, ContentSkeletonLine } from "@/components/ui/content-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function LoadingSkeleton() {
    return <div
        className={cn(
            "flex h-full w-full flex-col overflow-hidden bg-background",
        )}
    >
        {/* Cover image placeholder */}
        <Skeleton className="h-[25vh] w-full shrink-0 rounded-none sm:h-[30vh]" />

        {/* Content area — mirrors NoteEditorSurface's max-w-4xl centered layout */}
        <div className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 sm:px-24">
            <div className="mt-8 mb-6">
                {/* Emoji + title area */}
                <ContentSkeletonHeader showEmoji showTitle className="-mt-14" />
            </div>

            {/* Body content — simulates 2-3 paragraphs of text */}
            <div className="flex flex-col gap-8">
                <ContentSkeletonBlock lines={4} lastLineWidth="75%" />
                <ContentSkeletonBlock lines={3} lastLineWidth="50%" />

                {/* Inline "image" placeholder */}
                <Skeleton className="h-48 w-full rounded-xl" />

                <ContentSkeletonBlock lines={2} lastLineWidth="40%" />

                {/* Heading-like line */}
                <ContentSkeletonLine width="35%" height="1.5rem" />
                <ContentSkeletonBlock lines={3} lastLineWidth="65%" />
            </div>
        </div>
    </div>
}