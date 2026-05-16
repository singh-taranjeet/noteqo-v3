import { useState, useMemo } from "react";
import {
  Book,
  Clock,
  ChevronRight,
  ChevronDown,
  Search,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow, format } from "date-fns";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { Note } from "@/features/workspace/types/workspace.types";
import type { Space } from "@/features/spaces/types/spaces.types";
import type { UserProfile } from "@/features/auth";
import { useUserProfile } from "@/features/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Empty,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@/components/ui/empty";

export type TableNote = Note & { children?: TableNote[] };

export interface NoteTableProps {
  notes: TableNote[];
  spaces?: Space[];
  emptyMessage?: string;
  hideCreatedBy?: boolean;
  hideSource?: boolean;
  dateColumnLabel?: string;
  getDateValue?: (note: TableNote) => string | Date | null | undefined;
  onRowClick?: (note: TableNote) => void;
  renderActions?: (note: TableNote, isRoot: boolean) => React.ReactNode;
}

function NoteTableRow({
  note,
  spaces,
  userProfile,
  depth = 0,
  isRoot = false,
  hideCreatedBy,
  hideSource,
  getDateValue,
  onRowClick,
  renderActions,
}: {
  note: TableNote;
  spaces: Space[];
  userProfile: UserProfile | null | undefined;
  depth?: number;
  isRoot?: boolean;
  hideCreatedBy?: boolean;
  hideSource?: boolean;
  getDateValue?: (note: TableNote) => string | Date | null | undefined;
  onRowClick?: (note: TableNote) => void;
  renderActions?: (note: TableNote, isRoot: boolean) => React.ReactNode;
}) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = note.children && note.children.length > 0;

  const getSpaceName = (spaceId: string) => {
    const space = spaces.find((s) => s.id === spaceId);
    return space ? space.name : "Unknown Space";
  };

  return (
    <>
      <TableRow
        className={cn(
          "transition-colors group",
          onRowClick || !renderActions ? "cursor-pointer hover:bg-muted/50" : ""
        )}
        onClick={() => {
          if (onRowClick) {
            onRowClick(note);
          } else {
            navigate(ROUTES.NOTE(note.id));
          }
        }}
      >
        <TableCell className="font-medium py-3">
          <div
            className="flex items-center gap-2"
            style={{ paddingLeft: `${depth * 1.5}rem` }}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (hasChildren) setIsExpanded(!isExpanded);
              }}
              className={cn(
                "p-0.5 rounded-sm hover:bg-muted text-muted-foreground shrink-0",
                !hasChildren && "invisible",
              )}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            <span className="text-xl shrink-0" role="img" aria-hidden="true">
              {note.emoji || "📄"}
            </span>
            <span 
              className={cn(
                "truncate transition-colors", 
                onRowClick ? "group-hover:underline decoration-muted-foreground underline-offset-2" : "group-hover:text-primary"
              )}
            >
              {note.title || "Untitled"}
            </span>
          </div>
        </TableCell>

        {/* Created By (Hidden on Mobile) */}
        {!hideCreatedBy && (
          <TableCell className="hidden md:table-cell text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-semibold shrink-0 uppercase">
                {userProfile?.name?.[0] || "U"}
              </div>
              <span className="truncate text-sm">
                {userProfile?.name || "Unknown"}
              </span>
            </div>
          </TableCell>
        )}

        {/* Source (Hidden on Mobile) */}
        {!hideSource && (
          <TableCell className="hidden md:table-cell text-muted-foreground">
            <div className="flex items-center gap-1.5 text-sm">
              {note.parentId ? (
                <span className="truncate flex items-center gap-1.5">
                  📄 Parent Note
                </span>
              ) : (
                <span className="truncate flex items-center gap-1.5">
                  <Book size={14} className="shrink-0" />
                  {getSpaceName(note.spaceId)}
                </span>
              )}
            </div>
          </TableCell>
        )}

        {/* Dynamic Date Column */}
        <TableCell className={cn(
          "text-muted-foreground text-sm",
          renderActions ? "hidden sm:table-cell text-left" : "text-right md:text-left"
        )}>
          {(() => {
            const dateVal = getDateValue ? getDateValue(note) : note.updatedAt;
            if (!dateVal) return "Unknown";
            
            // If it's the default behavior, show relative time with clock icon
            if (!getDateValue) {
              return (
                <div className="flex items-center justify-end md:justify-start gap-1.5">
                  <Clock size={12} className="shrink-0 hidden sm:block" />
                  <span className="truncate">
                    {formatDistanceToNow(new Date(dateVal), { addSuffix: true })}
                  </span>
                </div>
              );
            }

            // Otherwise show formatted date
            return format(new Date(dateVal), "MMM d, yyyy");
          })()}
        </TableCell>

        {/* Dynamic Actions */}
        {renderActions && (
          <TableCell className="text-right">
            {renderActions(note, isRoot)}
          </TableCell>
        )}
      </TableRow>

      {hasChildren &&
        isExpanded &&
        note.children!.map((child) => (
          <NoteTableRow
            key={child.id}
            note={child}
            spaces={spaces}
            userProfile={userProfile}
            depth={depth + 1}
            isRoot={false}
            hideCreatedBy={hideCreatedBy}
            hideSource={hideSource}
            getDateValue={getDateValue}
            onRowClick={onRowClick}
            renderActions={renderActions}
          />
        ))}
    </>
  );
}

export function NoteTable({
  notes,
  spaces = [],
  emptyMessage = "No pages found.",
  hideCreatedBy,
  hideSource,
  dateColumnLabel = "Last edited time",
  getDateValue,
  onRowClick,
  renderActions,
}: NoteTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSpace, setFilterSpace] = useState<string>("all");
  const [filterUser, setFilterUser] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("updatedAt_desc");

  const { data: userProfile } = useUserProfile();

  const filteredNotes = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();

    function filterTree(treeNotes: TableNote[]): TableNote[] {
      return treeNotes.reduce((acc, note) => {
        const title = note.title || "Untitled";
        const matchesQuery =
          !searchQuery.trim() || title.toLowerCase().includes(lowerQuery);
        const matchesSpace =
          filterSpace === "all" || note.spaceId === filterSpace;
        const matchesUser = filterUser === "all" || true; // Currently all local notes belong to the user

        const matchesAll = matchesQuery && matchesSpace && matchesUser;

        let filteredChildren: TableNote[] = [];
        if (note.children) {
          filteredChildren = matchesAll
            ? filterTree(note.children)
            : filterTree(note.children);
        }

        if (matchesAll || filteredChildren.length > 0) {
          acc.push({
            ...note,
            children:
              filteredChildren.length > 0 ? filteredChildren : note.children,
          });
        }

        return acc;
      }, [] as TableNote[]);
    }

    function sortTree(treeNotes: TableNote[]): TableNote[] {
      const sorted = [...treeNotes].sort((a, b) => {
        const dateA = sortBy.startsWith("updatedAt")
          ? new Date(a.updatedAt).getTime()
          : new Date(a.createdAt).getTime();
        const dateB = sortBy.startsWith("updatedAt")
          ? new Date(b.updatedAt).getTime()
          : new Date(b.createdAt).getTime();

        if (sortBy.endsWith("_desc")) {
          return dateB - dateA;
        }
        return dateA - dateB;
      });

      return sorted.map((note) => ({
        ...note,
        children:
          note.children && note.children.length > 0
            ? sortTree(note.children)
            : note.children,
      }));
    }

    const filtered = filterTree(notes);
    return sortTree(filtered);
  }, [notes, searchQuery, filterSpace, filterUser, sortBy]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-sm shrink-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search pages..."
            className="pl-9 bg-background focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <div className="flex items-center gap-2 shrink-0">
            <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
            <Select value={filterSpace} onValueChange={setFilterSpace}>
              <SelectTrigger className="w-[130px] h-9 text-xs">
                <SelectValue placeholder="Space" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Spaces</SelectItem>
                {spaces.map((space) => (
                  <SelectItem key={space.id} value={space.id}>
                    {space.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger className="w-[110px] h-9 text-xs">
                <SelectValue placeholder="Edited by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any User</SelectItem>
                <SelectItem value="me">
                  Me ({userProfile?.name || "You"})
                </SelectItem>
              </SelectContent>
            </Select>

            <div className="w-px h-6 bg-border mx-1 shrink-0" />

            <ArrowUpDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px] h-9 text-xs">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updatedAt_desc">
                  Last edited (newest)
                </SelectItem>
                <SelectItem value="updatedAt_asc">
                  Last edited (oldest)
                </SelectItem>
                <SelectItem value="createdAt_desc">Created (newest)</SelectItem>
                <SelectItem value="createdAt_asc">Created (oldest)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {!filteredNotes.length ? (
        <Empty>
          <EmptyContent>
            <EmptyMedia>
              <Book size={24} />
            </EmptyMedia>
            <EmptyTitle>No pages found</EmptyTitle>
            <EmptyDescription>
              {searchQuery ? "No pages match your search." : emptyMessage}
            </EmptyDescription>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="rounded-md border bg-card">
          <Table className="border-none">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[40%] md:w-[35%] pl-[42px]">Page name</TableHead>
                {!hideCreatedBy && (
                  <TableHead className="hidden md:table-cell w-[20%]">
                    Created by
                  </TableHead>
                )}
                {!hideSource && (
                  <TableHead className="hidden md:table-cell w-[20%]">
                    Source
                  </TableHead>
                )}
                <TableHead className={cn(
                  renderActions ? "hidden sm:table-cell w-[20%]" : "w-[40%] md:w-[25%] text-right md:text-left"
                )}>
                  {dateColumnLabel}
                </TableHead>
                {renderActions && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotes.map((note) => (
                <NoteTableRow
                  key={note.id}
                  note={note}
                  spaces={spaces}
                  userProfile={userProfile}
                  isRoot={true}
                  hideCreatedBy={hideCreatedBy}
                  hideSource={hideSource}
                  getDateValue={getDateValue}
                  onRowClick={onRowClick}
                  renderActions={renderActions}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
