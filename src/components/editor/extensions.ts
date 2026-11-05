import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Markdown } from "tiptap-markdown";

export const editorExtensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3, 4, 5, 6] },
    codeBlock: {
      HTMLAttributes: { class: "mord-code-block" },
    },
  }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: { class: "mord-link" },
  }),
  Image.configure({
    allowBase64: false,
    HTMLAttributes: { class: "mord-image" },
  }),
  Placeholder.configure({
    placeholder: "Commencez à écrire…",
  }),
  Table.configure({
    resizable: true,
    HTMLAttributes: { class: "mord-table" },
  }),
  TableRow,
  TableHeader,
  TableCell,
  TaskList,
  TaskItem.configure({ nested: true }),
  Markdown.configure({
    html: false,
    tightLists: true,
    bulletListMarker: "-",
    linkify: true,
    breaks: false,
    transformPastedText: true,
    transformCopiedText: true,
  }),
];
