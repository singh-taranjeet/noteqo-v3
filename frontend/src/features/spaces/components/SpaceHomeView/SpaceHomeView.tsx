import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Book,
  Settings,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { useSpaces } from "@/features/spaces/hooks/useSpaces";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NoteTable } from "@/features/workspace";
import { SpaceSettingsDialog } from "../SpaceSettingsDialog/SpaceSettingsDialog";
import { AssetsView } from "@/features/media/components/AssetsView";

export function SpaceHomeView() {
  const { space_id } = useParams<{ space_id: string }>();
  const navigate = useNavigate();
  const { data, spaceNoteTreesMap, isLoading } = useSpaces();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const space = useMemo(() => {
    return data?.spaces?.find((s) => s.id === space_id);
  }, [data?.spaces, space_id]);

  const notesTree = useMemo(() => {
    return space_id ? spaceNoteTreesMap[space_id] || [] : [];
  }, [spaceNoteTreesMap, space_id]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!space) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8 text-center">
        <Book className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Space Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The space you are looking for does not exist or you don't have access.
        </p>
        <Button onClick={() => navigate("/library")} variant="outline">
          Back to Library
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex items-center justify-between border-b px-6 py-4 bg-background">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {space.name || "Untitled Space"}
            </h1>
            {space.description && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {space.description}
              </p>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSettingsOpen(true)}
          className="gap-2"
        >
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Settings</span>
        </Button>
      </header>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="notes" className="flex flex-col h-full">
          <div className="px-6 pt-4">
            <TabsList>
              <TabsTrigger value="notes" className="gap-2">
                <Book className="h-4 w-4" />
                Notes
              </TabsTrigger>
              <TabsTrigger value="assets" className="gap-2">
                <ImageIcon className="h-4 w-4" />
                Assets
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <TabsContent value="notes" className="m-0 h-full">
              <NoteTable notes={notesTree} spaces={data?.spaces || []} emptyMessage="This space has no pages yet." />
            </TabsContent>

            <TabsContent value="assets" className="m-0 h-full">
              {/* AssetsView will be modified to support an optional spaceId prop */}
              <AssetsView spaceId={space.id} />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <SpaceSettingsDialog
        space={space}
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </div>
  );
}
