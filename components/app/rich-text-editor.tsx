"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Undo2,
  Redo2,
  ImagePlus,
  Video,
  Link2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function ToolbarButton({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
    >
      {children}
    </button>
  );
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const toEmbed = (raw: string) => {
  const value = raw.trim();
  const youtube = value.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  );
  if (youtube) {
    return `<div class="pact-video"><iframe src="https://www.youtube.com/embed/${youtube[1]}" title="Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe></div>`;
  }
  const vimeo = value.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) {
    return `<div class="pact-video"><iframe src="https://player.vimeo.com/video/${vimeo[1]}" title="Video" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
  }
  if (/\.(mp4|webm|mov|ogv)(\?.*)?$/i.test(value)) {
    return `<video class="pact-video" controls preload="metadata" src="${escapeHtml(value)}"></video>`;
  }
  return null;
};

export function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaTab, setMediaTab] = useState<"image" | "video">("image");
  const [imageMode, setImageMode] = useState<"upload" | "url">("url");
  const [url, setUrl] = useState("");
  const [pendingDataUrl, setPendingDataUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || el.innerHTML === value) return;
    el.innerHTML = value;
  }, [value]);

  const openMedia = (tab: "image" | "video") => {
    const selection = window.getSelection();
    if (
      selection &&
      selection.rangeCount > 0 &&
      selection.anchorNode &&
      ref.current?.contains(selection.anchorNode)
    ) {
      savedRange.current = selection.getRangeAt(0).cloneRange();
    } else {
      savedRange.current = null;
    }
    setMediaTab(tab);
    setUrl("");
    setPendingDataUrl(null);
    setFileName(null);
    setMediaOpen(true);
  };

  const insertHtml = (html: string) => {
    const editor = ref.current;
    if (!editor) return;
    editor.focus();
    const selection = window.getSelection();
    if (savedRange.current && selection) {
      selection.removeAllRanges();
      selection.addRange(savedRange.current);
      document.execCommand("insertHTML", false, html);
    } else {
      editor.insertAdjacentHTML("beforeend", html);
    }
    savedRange.current = null;
    setMediaOpen(false);
    onChange(editor.innerHTML ?? "");
  };

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("That file is not an image", {
        description: "Choose a PNG, JPG, GIF, or WebP file.",
      });
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setPendingDataUrl(reader.result as string);
      setFileName(file.name);
      setUploading(false);
    };
    reader.onerror = () => {
      setUploading(false);
      toast.error("Could not read that file");
    };
    reader.readAsDataURL(file);
  };

  const confirmInsert = () => {
    if (mediaTab === "image") {
      const src = imageMode === "upload" ? pendingDataUrl : url.trim();
      if (!src) return;
      insertHtml(
        `<img class="pact-img" src="${escapeHtml(src)}" alt="${escapeHtml(imageMode === "upload" ? fileName ?? "Image" : url.trim())}" />`
      );
    } else {
      const embed = toEmbed(url);
      if (!embed) {
        toast.error("Unsupported video link", {
          description: "Paste a YouTube, Vimeo, or direct .mp4/.webm URL.",
        });
        return;
      }
      insertHtml(embed);
    }
    setUrl("");
    setPendingDataUrl(null);
    setFileName(null);
  };

  const canInsert =
    mediaTab === "image"
      ? imageMode === "upload"
        ? !!pendingDataUrl
        : url.trim().length > 0
      : url.trim().length > 0;

  const exec = (command: string, value?: string) => {
    ref.current?.focus();
    document.execCommand(command, false, value);
    onChange(ref.current?.innerHTML ?? "");
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-surface-2 px-2 py-1.5">
        <ToolbarButton title="Bold" onClick={() => exec("bold")}>
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Italic" onClick={() => exec("italic")}>
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Strikethrough" onClick={() => exec("strikeThrough")}>
          <Strikethrough className="h-3.5 w-3.5" />
        </ToolbarButton>
        <div className="mx-1 h-4 w-px bg-border" />
        <ToolbarButton title="Heading" onClick={() => exec("formatBlock", "h1")}>
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Subheading" onClick={() => exec("formatBlock", "h2")}>
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <div className="mx-1 h-4 w-px bg-border" />
        <ToolbarButton title="Bullet list" onClick={() => exec("insertUnorderedList")}>
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Numbered list" onClick={() => exec("insertOrderedList")}>
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Quote" onClick={() => exec("formatBlock", "blockquote")}>
          <Quote className="h-3.5 w-3.5" />
        </ToolbarButton>
        <div className="mx-1 h-4 w-px bg-border" />
        <ToolbarButton title="Add image" onClick={() => openMedia("image")}>
          <ImagePlus className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Add video" onClick={() => openMedia("video")}>
          <Video className="h-3.5 w-3.5" />
        </ToolbarButton>
        <div className="mx-1 h-4 w-px bg-border" />
        <ToolbarButton title="Undo" onClick={() => exec("undo")}>
          <Undo2 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton title="Redo" onClick={() => exec("redo")}>
          <Redo2 className="h-3.5 w-3.5" />
        </ToolbarButton>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-label="Agreement terms"
        data-placeholder={placeholder}
        className="min-h-[320px] px-4 py-3 text-[14px] leading-relaxed text-foreground outline-none [&_h1]:mb-3 [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-medium [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:mb-3 [&_blockquote]:border-l-2 [&_blockquote]:border-border-strong [&_blockquote]:pl-3 [&_blockquote]:text-muted [&_a]:text-info [&_a]:underline [&_strong]:font-semibold [&_em]:italic [&_img]:my-4 [&_img]:max-w-full [&_img]:rounded-lg [&_img]:border [&_img]:border-border [&_.pact-video]:my-4 [&_.pact-video]:aspect-video [&_.pact-video]:w-full [&_.pact-video]:overflow-hidden [&_.pact-video]:rounded-lg [&_.pact-video]:border [&_.pact-video]:border-border [&_.pact-video]:bg-surface-2 [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0 [&_video]:my-4 [&_video]:w-full [&_video]:rounded-lg [&_video]:border [&_video]:border-border"
        onInput={() => onChange(ref.current?.innerHTML ?? "")}
      />

      <Dialog
        open={mediaOpen}
        onOpenChange={(open) => {
          setMediaOpen(open);
          if (!open) savedRange.current = null;
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {mediaTab === "image" ? "Add an image" : "Add a video"}
            </DialogTitle>
            <DialogDescription>
              {mediaTab === "image"
                ? "Upload a file from your device or link to an image URL."
                : "Paste a YouTube, Vimeo, or direct video link."}
            </DialogDescription>
          </DialogHeader>

          {mediaTab === "image" ? (
            <>
              <div className="flex w-full items-center gap-1 rounded-lg border border-border bg-surface-2 p-1">
                <button
                  type="button"
                  onClick={() => setImageMode("url")}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
                    imageMode === "url"
                      ? "bg-surface text-foreground shadow-sm"
                      : "text-muted-2 hover:text-foreground"
                  )}
                >
                  <Link2 className="h-3.5 w-3.5" /> Link
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode("upload")}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
                    imageMode === "upload"
                      ? "bg-surface text-foreground shadow-sm"
                      : "text-muted-2 hover:text-foreground"
                  )}
                >
                  <Upload className="h-3.5 w-3.5" /> Upload
                </button>
              </div>

              {imageMode === "url" ? (
                <div className="space-y-2">
                  <Label htmlFor="media-url">Image URL</Label>
                  <Input
                    id="media-url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://…/image.png"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Image file</Label>
                  <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-surface-2 px-4 py-6">
                    <input
                      ref={fileInput}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFile}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="shrink-0"
                      disabled={uploading}
                      onClick={() => fileInput.current?.click()}
                    >
                      <Upload className="h-3.5 w-3.5" />
                      {uploading ? "Reading…" : "Choose file"}
                    </Button>
                    <span className="min-w-0 flex-1 truncate text-[12px] text-muted-2">
                      {fileName ?? "Embedded directly in the document as a data URL"}
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="media-url">Video URL</Label>
              <Input
                id="media-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=…"
              />
              <p className="text-[12px] text-muted-2">
                YouTube, Vimeo, and direct .mp4/.webm links are supported.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setMediaOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmInsert} disabled={!canInsert}>
              Add {mediaTab === "image" ? "image" : "video"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
