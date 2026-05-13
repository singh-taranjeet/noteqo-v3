import { Book, Plus } from "lucide-react";

import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useSpaces, SPACE_TYPE } from "@/features/spaces";
import { useRecentNotes } from "@/features/workspace/hooks/useRecentNotes";
import { SpaceAccordion } from "./SpaceAccordion";
import { NoteList } from "./NoteList";
import { CreateNoteDialog } from "./CreateNoteDialog";
import { Spinner } from "@/components/ui/spinner";

type TabType = "private" | "shared" | "recent" | "favorite";

export function LibraryView() {
  const [activeTab, setActiveTab] = useState<TabType>("private");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    data: spacesData,
    spaceNotesMap,
    isLoading: spacesLoading,
  } = useSpaces();
  const { notes: recentNotes, isLoading: recentLoading } = useRecentNotes();

  const privateSpaces = useMemo(
    () =>
      (spacesData?.spaces || []).filter((s) => s.type === SPACE_TYPE.PERSONAL),
    [spacesData?.spaces],
  );

  const sharedSpaces = useMemo(
    () =>
      (spacesData?.spaces || []).filter((s) => s.type === SPACE_TYPE.SHARED),
    [spacesData?.spaces],
  );

  const favoriteNotes = useMemo(
    () => recentNotes.filter((n) => n.isFavorite),
    [recentNotes],
  );

  // Determine spaces to show in Create Dialog based on active tab
  const dialogSpaces = useMemo(() => {
    if (activeTab === "shared") return sharedSpaces;
    return privateSpaces;
  }, [activeTab, sharedSpaces, privateSpaces]);

  const dialogSpaceLabel =
    activeTab === "shared" ? "shared space" : "private space";

  const isLoading = spacesLoading || recentLoading;

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full px-4 py-8 md:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Book size={32} className="text-primary" />
            Library
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your spaces and notes
          </p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus size={18} className="mr-2" />
          New Page
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as TabType)}
        className="flex-1 flex flex-col"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="private">Private</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="favorite">Favorite</TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center flex-1">
            <Spinner className="size-6 text-muted-foreground" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pb-12">
            <TabsContent
              value="private"
              className="m-0 focus-visible:outline-none"
            >
              <SpaceAccordion
                spaces={privateSpaces}
                spaceNotesMap={spaceNotesMap}
                emptyMessage="You don't have any private spaces yet."
              />
            </TabsContent>

            <TabsContent
              value="shared"
              className="m-0 focus-visible:outline-none"
            >
              <SpaceAccordion
                spaces={sharedSpaces}
                spaceNotesMap={spaceNotesMap}
                emptyMessage="You don't have any shared spaces yet."
              />
            </TabsContent>

            <TabsContent
              value="recent"
              className="m-0 focus-visible:outline-none"
            >
              <NoteList
                notes={recentNotes}
                emptyMessage="You haven't viewed or edited any notes recently."
              />
            </TabsContent>

            <TabsContent
              value="favorite"
              className="m-0 focus-visible:outline-none"
            >
              <NoteList
                notes={favoriteNotes}
                emptyMessage="You don't have any favorite notes yet."
              />
            </TabsContent>
          </div>
        )}
      </Tabs>

      <CreateNoteDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        spaces={dialogSpaces}
        spaceTypeLabel={dialogSpaceLabel}
        defaultSpaceId={
          dialogSpaces.length > 0 ? dialogSpaces[0].id : undefined
        }
      />
    </div>
  );
}
