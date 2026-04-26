import type { Editor } from "@tiptap/core";

/** Minimum info needed to locate a table in the document. */
interface TableInfo {
  node: ReturnType<Editor["state"]["doc"]["nodeAt"]>;
  pos: number;
}

/**
 * Finds the table node that contains the current selection.
 * Returns null if the selection is not inside a table.
 */
function findTableAround(editor: Editor): TableInfo | null {
  const { selection } = editor.state;
  const { $from } = selection;

  for (let depth = $from.depth; depth > 0; depth--) {
    const node = $from.node(depth);
    if (node.type.name === "table") {
      return { node, pos: $from.before(depth) };
    }
  }
  return null;
}

/**
 * Reorders a column in a Tiptap table by swapping cell contents.
 *
 * This operates on simple, non-merged tables. Tables with colspan > 1
 * are not supported and the operation will be a no-op.
 */
export function reorderColumn(
  editor: Editor,
  fromIndex: number,
  toIndex: number,
): boolean {
  if (fromIndex === toIndex) return false;

  const tableInfo = findTableAround(editor);
  if (!tableInfo || !tableInfo.node) return false;

  const tableNode = tableInfo.node;
  const colCount = tableNode.child(0).childCount;

  if (
    fromIndex < 0 ||
    fromIndex >= colCount ||
    toIndex < 0 ||
    toIndex >= colCount
  ) {
    return false;
  }

  // Check for merged cells — bail out if any cell has colspan > 1
  for (let rowIdx = 0; rowIdx < tableNode.childCount; rowIdx++) {
    const row = tableNode.child(rowIdx);
    for (let cellIdx = 0; cellIdx < row.childCount; cellIdx++) {
      const cell = row.child(cellIdx);
      const colspan = (cell.attrs.colspan as number) || 1;
      if (colspan > 1) {
        return false;
      }
    }
  }

  // Build the reordered table by reconstructing each row with new column order
  const { state } = editor;
  const { tr, schema } = state;

  const newRows: ReturnType<typeof tableNode.child>[] = [];

  for (let rowIdx = 0; rowIdx < tableNode.childCount; rowIdx++) {
    const row = tableNode.child(rowIdx);
    const cells: ReturnType<typeof row.child>[] = [];

    for (let cellIdx = 0; cellIdx < row.childCount; cellIdx++) {
      cells.push(row.child(cellIdx));
    }

    // Rearrange: remove fromIndex and insert at toIndex
    const reordered = [...cells];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    const newRow = row.type.create(row.attrs, reordered);
    newRows.push(newRow);
  }

  const newTable = tableNode.type.create(tableNode.attrs, newRows);
  tr.replaceWith(tableInfo.pos, tableInfo.pos + tableNode.nodeSize, newTable);

  editor.view.dispatch(tr);
  return true;
}
