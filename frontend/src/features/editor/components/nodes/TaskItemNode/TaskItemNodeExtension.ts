import { TaskItem as BaseTaskItem } from "@tiptap/extension-list";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { TaskItemNodeView } from "./TaskItemNodeView";

export const TaskItemNode = BaseTaskItem.extend({
  addNodeView() {
    return ReactNodeViewRenderer(TaskItemNodeView);
  },
});
