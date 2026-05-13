import { mergeAttributes } from "@tiptap/core";
import BaseHeading from "@tiptap/extension-heading";

export const HeadingNode = BaseHeading.extend({
  renderHTML({ node, HTMLAttributes }) {
    const hasLevel = this.options.levels.includes(node.attrs.level);
    const level = hasLevel ? node.attrs.level : this.options.levels[0];

    let classes = "";
    if (level === 1)
      classes =
        "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mt-8 mb-4 outline-none";
    if (level === 2)
      classes =
        "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 mt-8 mb-4 outline-none";
    if (level === 3)
      classes =
        "scroll-m-20 text-2xl font-semibold tracking-tight mt-8 mb-4 outline-none";
    if (level === 4)
      classes =
        "scroll-m-20 text-xl font-semibold tracking-tight mt-8 mb-4 outline-none";

    return [
      `h${level}`,
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: classes,
      }),
      0,
    ];
  },
});
