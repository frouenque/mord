import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";

export interface DocumentPayload {
  path: string;
  content: string;
  assetsDir: string;
}

export async function readMarkdownFile(path: string): Promise<DocumentPayload> {
  return invoke<DocumentPayload>("read_markdown_file", { path });
}

export async function writeMarkdownFile(
  path: string,
  content: string,
): Promise<DocumentPayload> {
  return invoke<DocumentPayload>("write_markdown_file", { path, content });
}

export async function ensureAssetsDir(mdPath: string): Promise<string> {
  return invoke<string>("ensure_assets_dir", { mdPath });
}

export async function importImage(
  mdPath: string,
  imagePath: string,
): Promise<string> {
  return invoke<string>("import_image", { mdPath, imagePath });
}

export async function pickOpenMarkdown(): Promise<string | null> {
  const selected = await open({
    multiple: false,
    filters: [{ name: "Markdown", extensions: ["md", "markdown"] }],
  });
  if (typeof selected === "string") {
    return selected;
  }
  return null;
}

export async function pickSaveMarkdown(
  defaultPath?: string,
): Promise<string | null> {
  return save({
    defaultPath: defaultPath ?? "document.md",
    filters: [{ name: "Markdown", extensions: ["md"] }],
  });
}

export async function pickImageFile(): Promise<string | null> {
  const selected = await open({
    multiple: false,
    filters: [
      {
        name: "Images",
        extensions: ["png", "jpg", "jpeg", "gif", "webp", "svg"],
      },
    ],
  });
  if (typeof selected === "string") {
    return selected;
  }
  return null;
}
