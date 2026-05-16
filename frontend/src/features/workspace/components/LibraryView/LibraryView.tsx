import { Book, Plus } from "lucide-react";
import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useSpaces, SPACE_TYPE } from "@/features/spaces";
import { useRecentNotes } from "@/features/workspace/hooks/useRecentNotes";
import { NoteTable } from "../NoteTable";
import { CreateNoteDialog } from "./CreateNoteDialog";
import { Spinner } from "@/components/ui/spinner";
import { ContainerLayout } from "@/layouts/ContainerLayout";

type TabType = "private" | "shared" | "recent" | "favorite";

export function LibraryView() {
  const [activeTab, setActiveTab] = useState<TabType>("private");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    data: spacesData,
    spaceNoteTreesMap,
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

  const privateNotes = useMemo(
    () => privateSpaces.flatMap((s) => spaceNoteTreesMap[s.id] || []),
    [privateSpaces, spaceNoteTreesMap],
  );

  const sharedNotes = useMemo(
    () => sharedSpaces.flatMap((s) => spaceNoteTreesMap[s.id] || []),
    [sharedSpaces, spaceNoteTreesMap],
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
    <ContainerLayout.Spacer>
      <ContainerLayout.Heading
        title="Library"
        subTitle="Manage your spaces, notes and assets"
        Icon={Book}
      />
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as TabType)}
        className="flex-1 flex flex-col"
      >
        <div className="flex w-full justify-between">
          <TabsList className="mb-6">
            <TabsTrigger value="private">Private</TabsTrigger>
            <TabsTrigger value="shared">Shared</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="favorite">Favorite</TabsTrigger>
          </TabsList>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus size={18} className="mr-2" />
            New Page
          </Button>
        </div>

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
              <NoteTable
                notes={privateNotes}
                spaces={privateSpaces}
                emptyMessage="You don't have any private pages yet."
              />
            </TabsContent>

            <TabsContent
              value="shared"
              className="m-0 focus-visible:outline-none"
            >
              <NoteTable
                notes={sharedNotes}
                spaces={sharedSpaces}
                emptyMessage="You don't have any shared pages yet."
              />
            </TabsContent>

            <TabsContent
              value="recent"
              className="m-0 focus-visible:outline-none"
            >
              <NoteTable
                notes={recentNotes}
                spaces={spacesData?.spaces || []}
                emptyMessage="You haven't viewed or edited any pages recently."
              />
            </TabsContent>

            <TabsContent
              value="favorite"
              className="m-0 focus-visible:outline-none"
            >
              <NoteTable
                notes={favoriteNotes}
                spaces={spacesData?.spaces || []}
                emptyMessage="You don't have any favorite pages yet."
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
    </ContainerLayout.Spacer>
  );
}
