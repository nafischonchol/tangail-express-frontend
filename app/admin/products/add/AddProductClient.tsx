"use client";

import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { 
  Plus, 
  List, 
  Upload, 
  X, 
  Youtube, 
  Link2, 
  Eye, 
  HelpCircle, 
  Check, 
  Tag, 
  Sparkles, 
  Trash2, 
  Image as ImageIcon, 
  FileText, 
  Scale, 
  DollarSign, 
  AlertCircle, 
  Package, 
  Globe,
  Loader2,
  Bold,
  Underline,
  Italic,
  Eraser,
  ListOrdered,
  AlignLeft,
  Table,
  Maximize2,
  Undo,
  Redo,
  Type,
  Video,
  Sliders,
  Settings
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAttributes, Attribute } from "@/lib/api/attributes";
import { getCategories, Category } from "@/lib/api/categories";
import { getBrands, Brand } from "@/lib/api/brands";
import { getUnits, Unit } from "@/lib/api/units";
import { createProduct } from "@/lib/api/products";
import { productSchema, formatZodErrors } from "@/lib/validation";

interface SupportImageItem {
  id: string;
  file: File;
  preview: string;
}

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Custom modal states for inserting images
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload");
  const [imageInputUrl, setImageInputUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFilePreview, setImageFilePreview] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageWidth, setImageWidth] = useState("");
  const [imageHeight, setImageHeight] = useState("");
  const [savedRange, setSavedRange] = useState<Range | null>(null);

  // Custom modal states for inserting links
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [linkSavedRange, setLinkSavedRange] = useState<Range | null>(null);

  // Custom modal states for inserting videos
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoSavedRange, setVideoSavedRange] = useState<Range | null>(null);

  // Sync initial state value once
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, []);

  // Cleanup preview URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (imageFilePreview) URL.revokeObjectURL(imageFilePreview);
    };
  }, [imageFilePreview]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCmd = (command: string, valueParam: string = "") => {
    document.execCommand(command, false, valueParam);
    handleInput();
  };

  const openLinkModal = () => {
    // Capture selected text to use as link text
    const selection = window.getSelection();
    let selectedText = "";
    let range: Range | null = null;
    
    if (selection && selection.rangeCount > 0) {
      range = selection.getRangeAt(0);
      selectedText = selection.toString();
    }

    setLinkSavedRange(range);
    setLinkUrl("");
    setLinkText(selectedText || "");
    setIsLinkModalOpen(true);
  };

  const handleInsertLink = () => {
    const url = linkUrl.trim();
    const text = linkText.trim() || url;

    if (!url) {
      toast.error("Please enter a valid link URL.");
      return;
    }

    setIsLinkModalOpen(false);

    // Refocus the editor text zone
    if (editorRef.current) {
      editorRef.current.focus();
    }

    // Restore text selection cursor range
    const selection = window.getSelection();
    if (selection && linkSavedRange) {
      selection.removeAllRanges();
      selection.addRange(linkSavedRange);
    }

    // Insert link tag HTML
    const linkHtml = `<a href="${url}" class="text-indigo-600 hover:text-indigo-900 underline font-semibold" target="_blank" rel="noopener noreferrer">${text}</a>`;
    execCmd("insertHTML", linkHtml);
  };

  const openVideoModal = () => {
    // Capture selection focus range before moving cursor into modal input field
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      setVideoSavedRange(selection.getRangeAt(0));
    } else {
      setVideoSavedRange(null);
    }

    setIsVideoModalOpen(true);
    setVideoUrl("");
  };

  const handleInsertVideo = () => {
    const url = videoUrl.trim();
    if (!url) {
      toast.error("Please enter a valid video URL.");
      return;
    }

    setIsVideoModalOpen(false);

    // Refocus the editor text zone
    if (editorRef.current) {
      editorRef.current.focus();
    }

    // Restore text selection cursor range
    const selection = window.getSelection();
    if (selection && videoSavedRange) {
      selection.removeAllRanges();
      selection.addRange(videoSavedRange);
    }

    // Parse YouTube URL to embed format if applicable
    let embedUrl = url;
    const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(ytRegex);
    if (match && match[1]) {
      embedUrl = `https://www.youtube.com/embed/${match[1]}`;
    }

    // Insert iframe tag HTML at restored selection point
    const html = `<iframe class="w-full aspect-video my-2 rounded-lg border border-slate-100 shadow-sm" src="${embedUrl}" frameborder="0" allowfullscreen></iframe>`;
    execCmd("insertHTML", html);
  };

  const openImageModal = () => {
    // Capture selection focus range before moving cursor into modal input field
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      setSavedRange(selection.getRangeAt(0));
    } else {
      setSavedRange(null);
    }

    setIsImageModalOpen(true);
    setImageInputUrl("");
    setImageFile(null);
    setImageFilePreview("");
    setImageAlt("");
    setImageWidth("");
    setImageHeight("");
    setActiveTab("upload");
  };

  const handleModalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImageFilePreview(URL.createObjectURL(file));
    }
  };

  const handleInsertImage = () => {
    let imageUrl = "";

    if (activeTab === "upload") {
      if (!imageFilePreview) {
        toast.error("Please select or upload an image file first.");
        return;
      }
      imageUrl = imageFilePreview;
    } else {
      if (!imageInputUrl.trim()) {
        toast.error("Please enter a valid image URL.");
        return;
      }
      imageUrl = imageInputUrl.trim();
    }

    setIsImageModalOpen(false);

    // Refocus the editor text zone
    if (editorRef.current) {
      editorRef.current.focus();
    }

    // Restore text selection cursor range
    const selection = window.getSelection();
    if (selection && savedRange) {
      selection.removeAllRanges();
      selection.addRange(savedRange);
    }

    // Build dimensions and alternative text attributes
    const altText = imageAlt.trim() || "Inserted image";
    const widthVal = imageWidth.trim();
    const heightVal = imageHeight.trim();

    let inlineStyles = "";
    if (widthVal) {
      inlineStyles += `width: ${/^[0-9]+$/.test(widthVal) ? widthVal + "px" : widthVal}; `;
    } else {
      inlineStyles += `max-w-full; `;
    }
    if (heightVal) {
      inlineStyles += `height: ${/^[0-9]+$/.test(heightVal) ? heightVal + "px" : heightVal}; `;
    } else {
      inlineStyles += `height: auto; `;
    }

    // Insert image HTML at restored selection point
    const imgHtml = `<img src="${imageUrl}" style="${inlineStyles}" class="my-2 rounded-lg border border-slate-100 shadow-sm" alt="${altText}" />`;
    execCmd("insertHTML", imgHtml);
  };

  const insertTable = () => {
    const rows = prompt("Enter number of rows:", "3");
    const cols = prompt("Enter number of columns:", "3");
    if (!rows || !cols) return;
    
    let tableHtml = `<table class="border-collapse border border-slate-300 w-full my-2 text-slate-800 text-sm">`;
    for (let r = 0; r < parseInt(rows); r++) {
      tableHtml += `<tr>`;
      for (let c = 0; c < parseInt(cols); c++) {
        tableHtml += `<td class="border border-slate-300 p-2 min-w-[50px]">&nbsp;</td>`;
      }
      tableHtml += `</tr>`;
    }
    tableHtml += `</table>`;
    
    execCmd("insertHTML", tableHtml);
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all text?")) {
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
        onChange("");
      }
    }
  };

  return (
    <div className={`border border-slate-200 rounded-[12px] overflow-hidden bg-white shadow-sm flex flex-col transition-all duration-200 ${
      isFullscreen ? "fixed inset-4 z-50 max-h-[90vh] ring-4 ring-indigo-100" : ""
    }`}>
      <style dangerouslySetInnerHTML={{__html: `
        .editor-content:empty::before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
        }
      `}} />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50/70 border-b border-slate-100 select-none">
        
        {/* Text Styles */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd("bold")}
          className="p-1.5 hover:bg-slate-200/70 active:bg-slate-300 text-slate-600 rounded-[6px] transition-colors"
          title="Bold"
        >
          <Bold className="w-4 h-4 stroke-[2.5]" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd("underline")}
          className="p-1.5 hover:bg-slate-200/70 active:bg-slate-300 text-slate-600 rounded-[6px] transition-colors"
          title="Underline"
        >
          <Underline className="w-4 h-4 stroke-[2.5]" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd("italic")}
          className="p-1.5 hover:bg-slate-200/70 active:bg-slate-300 text-slate-600 rounded-[6px] transition-colors"
          title="Italic"
        >
          <Italic className="w-4 h-4 stroke-[2.5]" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd("strikeThrough")}
          className="p-1.5 hover:bg-slate-200/70 active:bg-slate-300 text-slate-600 rounded-[6px] transition-colors"
          title="Strikethrough"
        >
          <Eraser className="w-4 h-4" />
        </button>

        <span className="w-px h-5 bg-slate-200 mx-1"></span>

        {/* Lists */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd("insertUnorderedList")}
          className="p-1.5 hover:bg-slate-200/70 active:bg-slate-300 text-slate-600 rounded-[6px] transition-colors"
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd("insertOrderedList")}
          className="p-1.5 hover:bg-slate-200/70 active:bg-slate-300 text-slate-600 rounded-[6px] transition-colors"
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        {/* Alignment */}
        <div className="relative group">
          <button
            type="button"
            className="p-1.5 hover:bg-slate-200/70 text-slate-600 rounded-[6px] transition-colors flex items-center gap-1"
            title="Align"
          >
            <AlignLeft className="w-4 h-4" />
            <span className="text-[9px] text-slate-400">▼</span>
          </button>
          <div className="absolute left-0 mt-1 hidden group-focus-within:flex group-hover:flex flex-col bg-white border border-slate-100 rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => execCmd("justifyLeft")} className="px-3 py-1.5 hover:bg-slate-50 text-left text-xs text-slate-600">Left</button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => execCmd("justifyCenter")} className="px-3 py-1.5 hover:bg-slate-50 text-left text-xs text-slate-600">Center</button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => execCmd("justifyRight")} className="px-3 py-1.5 hover:bg-slate-50 text-left text-xs text-slate-600">Right</button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => execCmd("justifyFull")} className="px-3 py-1.5 hover:bg-slate-50 text-left text-xs text-slate-600">Justify</button>
          </div>
        </div>

        <span className="w-px h-5 bg-slate-200 mx-1"></span>

        {/* Formatting Magic */}
        <div className="relative group">
          <button
            type="button"
            className="p-1.5 hover:bg-slate-200/70 text-slate-600 rounded-[6px] transition-colors flex items-center gap-1"
            title="Text Style"
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span className="text-[9px] text-slate-400">▼</span>
          </button>
          <div className="absolute left-0 mt-1 hidden group-focus-within:flex group-hover:flex flex-col bg-white border border-slate-100 rounded-lg shadow-lg z-10 py-1 min-w-[140px]">
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => execCmd("formatBlock", "<h1>")} className="px-3 py-1.5 hover:bg-slate-50 text-left font-bold text-sm text-slate-800">Heading 1</button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => execCmd("formatBlock", "<h2>")} className="px-3 py-1.5 hover:bg-slate-50 text-left font-bold text-xs text-slate-700">Heading 2</button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => execCmd("formatBlock", "<p>")} className="px-3 py-1.5 hover:bg-slate-50 text-left text-xs text-slate-600">Normal Paragraph</button>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => execCmd("formatBlock", "<blockquote>")} className="px-3 py-1.5 hover:bg-slate-50 text-left border-l-2 border-slate-300 pl-2 text-xs italic text-slate-500">Quote Block</button>
          </div>
        </div>

        {/* Text color */}
        <div className="relative group">
          <button
            type="button"
            className="p-1.5 hover:bg-slate-200/70 text-slate-600 rounded-[6px] transition-colors flex items-center gap-1"
            title="Text Color"
          >
            <Type className="w-4 h-4" />
            <span className="text-[9px] text-slate-400">▼</span>
          </button>
          <div className="absolute left-0 mt-1 hidden group-focus-within:flex group-hover:flex bg-white border border-slate-100 rounded-lg shadow-lg z-10 p-2 grid grid-cols-4 gap-1 min-w-[100px]">
            {["#000000", "#4b5563", "#dc2626", "#d97706", "#16a34a", "#2563eb", "#7c3aed", "#db2777"].map((color) => (
              <button 
                key={color} 
                type="button" 
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => execCmd("foreColor", color)}
                className="w-5 h-5 rounded border border-slate-200 hover:scale-110 active:scale-95 transition-transform"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Table */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={insertTable}
          className="p-1.5 hover:bg-slate-200/70 active:bg-slate-300 text-slate-600 rounded-[6px] transition-colors"
          title="Insert Table"
        >
          <Table className="w-4 h-4" />
        </button>

        <span className="w-px h-5 bg-slate-200 mx-1"></span>

        {/* Inserts */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={openLinkModal}
          className="p-1.5 hover:bg-slate-200/70 active:bg-slate-300 text-slate-600 rounded-[6px] transition-colors"
          title="Insert Link"
        >
          <Link2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={openImageModal}
          className="p-1.5 hover:bg-slate-200/70 active:bg-slate-300 text-slate-600 rounded-[6px] transition-colors"
          title="Insert Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={openVideoModal}
          className="p-1.5 hover:bg-slate-200/70 active:bg-slate-300 text-slate-600 rounded-[6px] transition-colors"
          title="Insert Video Embed"
        >
          <Video className="w-4 h-4" />
        </button>

        <span className="w-px h-5 bg-slate-200 mx-1"></span>

        {/* Actions */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-1.5 hover:bg-slate-200/70 active:bg-slate-300 text-slate-600 rounded-[6px] transition-colors"
          title="Toggle Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd("undo")}
          className="p-1.5 hover:bg-slate-200/70 active:bg-slate-300 text-slate-600 rounded-[6px] transition-colors"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCmd("redo")}
          className="p-1.5 hover:bg-slate-200/70 active:bg-slate-300 text-slate-600 rounded-[6px] transition-colors"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>
        
        <button
          type="button"
          onClick={handleClear}
          className="ml-auto px-2 py-1 text-[11px] font-bold bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-md border border-slate-200 transition-colors"
          title="Clear all text"
        >
          Clear
        </button>
      </div>

      {/* Editor Content Area */}
      <div 
        ref={editorRef}
        contentEditable={true}
        onInput={handleInput}
        className="editor-content flex-1 p-4 outline-none min-h-[160px] max-h-[350px] resize-y overflow-auto text-sm text-slate-800 focus:ring-2 focus:ring-indigo-100 rounded-b-[12px] bg-white transition-all [&_table]:border [&_table]:border-slate-300 [&_td]:border [&_td]:border-slate-300 [&_td]:p-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-bold"
        data-placeholder={placeholder}
        style={{
          lineHeight: "1.6",
        }}
      />

      {/* Center Image Upload/URL Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in select-none">
          <div className="bg-white rounded-[16px] max-w-md w-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ImageIcon className="w-4.5 h-4.5 text-indigo-500" />
                Insert Description Image
              </h3>
              <button 
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Tabs Selector */}
            <div className="flex border-b border-slate-100 bg-slate-50/50 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className={`flex-1 py-2 text-xs font-semibold rounded-[8px] transition-all cursor-pointer ${
                  activeTab === "upload" 
                    ? "bg-white text-indigo-600 shadow-sm border border-slate-100" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Upload Image
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("url")}
                className={`flex-1 py-2 text-xs font-semibold rounded-[8px] transition-all cursor-pointer ${
                  activeTab === "url" 
                    ? "bg-white text-indigo-600 shadow-sm border border-slate-100" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Image URL
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {activeTab === "upload" ? (
                <div className="space-y-3">
                  {!imageFilePreview ? (
                    <div 
                      onClick={() => modalFileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 rounded-[12px] p-6 text-center cursor-pointer hover:bg-indigo-50/10 hover:border-indigo-400 transition-all group"
                    >
                      <input 
                        type="file" 
                        ref={modalFileInputRef} 
                        onChange={handleModalFileChange} 
                        className="hidden" 
                        accept="image/*"
                      />
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Upload className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                        <div>
                          <span className="text-xs font-semibold text-indigo-600 hover:underline">Choose local image</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">PNG, JPG, or WEBP (Max 3MB)</p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative border border-slate-100 rounded-[12px] overflow-hidden bg-slate-50 aspect-video flex items-center justify-center">
                      <img 
                        src={imageFilePreview} 
                        alt="Upload preview" 
                        className="max-h-[140px] max-w-full object-contain" 
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImageFilePreview("");
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="modal-image-url" className="text-slate-700 font-semibold text-xs">Image Address / URL</Label>
                  <Input
                    id="modal-image-url"
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    value={imageInputUrl}
                    onChange={(e) => setImageInputUrl(e.target.value)}
                    className="w-full text-xs"
                  />
                  <p className="text-[10px] text-slate-400 font-medium">Paste the URL of any web image.</p>
                </div>
              )}

              {/* Alt Description and Width & Height Fields */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="modal-image-alt" className="text-slate-700 font-semibold text-xs">Alternative description</Label>
                  <Input
                    id="modal-image-alt"
                    type="text"
                    placeholder="Describe the image"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    className="w-full text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="modal-image-width" className="text-slate-700 font-semibold text-xs">Width</Label>
                    <Input
                      id="modal-image-width"
                      type="text"
                      placeholder="e.g. 720"
                      value={imageWidth}
                      onChange={(e) => setImageWidth(e.target.value)}
                      className="w-full text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="modal-image-height" className="text-slate-700 font-semibold text-xs">Height</Label>
                    <Input
                      id="modal-image-height"
                      type="text"
                      placeholder="e.g. 420"
                      value={imageHeight}
                      onChange={(e) => setImageHeight(e.target.value)}
                      className="w-full text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsImageModalOpen(false)}
                className="border border-slate-200 bg-white hover:bg-slate-50 text-xs py-1.5 h-9 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleInsertImage}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-1.5 h-9 font-semibold cursor-pointer"
              >
                Insert Image
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* Center Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in select-none">
          <div className="bg-white rounded-[16px] max-w-md w-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">
                Add Link
              </h3>
              <button 
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Link URL */}
              <div className="space-y-1.5">
                <Label htmlFor="modal-link-url" className="text-slate-700 font-semibold text-xs">URL</Label>
                <Input
                  id="modal-link-url"
                  type="text"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full text-xs"
                />
              </div>

              {/* Title / Display Text */}
              <div className="space-y-1.5">
                <Label htmlFor="modal-link-text" className="text-slate-700 font-semibold text-xs">Title / Display Text</Label>
                <Input
                  id="modal-link-text"
                  type="text"
                  placeholder="Enter link text or title"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full text-xs"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsLinkModalOpen(false)}
                className="border border-slate-200 bg-white hover:bg-slate-50 text-xs py-1.5 h-9 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleInsertLink}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-1.5 h-9 font-semibold cursor-pointer"
              >
                Save
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* Center Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in select-none">
          <div className="bg-white rounded-[16px] max-w-md w-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Video className="w-4.5 h-4.5 text-indigo-500" />
                Insert Video URL
              </h3>
              <button 
                type="button"
                onClick={() => setIsVideoModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="modal-video-url" className="text-slate-700 font-semibold text-xs">YouTube Video URL</Label>
                <Input
                  id="modal-video-url"
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full text-xs"
                />
                <p className="text-[10px] text-slate-400 font-medium">Paste the link of any YouTube or Vimeo video.</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsVideoModalOpen(false)}
                className="border border-slate-200 bg-white hover:bg-slate-50 text-xs py-1.5 h-9 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleInsertVideo}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-1.5 h-9 font-semibold cursor-pointer"
              >
                Insert Video
              </Button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

interface AddProductClientProps {
  initialAttributes: Attribute[];
  initialCategories: Category[];
  initialBrands: Brand[];
  initialUnits: Unit[];
}

export default function AddProductClient({
  initialAttributes,
  initialCategories,
  initialBrands,
  initialUnits,
}: AddProductClientProps) {
  // --- Form States ---
  const router = useRouter();
  const [name, setName] = useState("");
  const [banglaName, setBanglaName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState("");
  const [customBrand, setCustomBrand] = useState("");
  const [showCustomBrand, setShowCustomBrand] = useState(false);
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [minStock, setMinStock] = useState("");
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState("");
  const [status, setStatus] = useState<"active" | "draft" | "inactive">("draft");
  
  // --- Lists States ---
  const [categoriesList, setCategoriesList] = useState<Category[]>(initialCategories);
  const [brandsList, setBrandsList] = useState<Brand[]>(initialBrands);
  const [unitsList, setUnitsList] = useState<Unit[]>(initialUnits);

  // --- Media & Dynamic Lists ---
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState("");
  const [supportImages, setSupportImages] = useState<SupportImageItem[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [youtubeUrls, setYoutubeUrls] = useState<string[]>([]);
  const [youtubeInput, setYoutubeInput] = useState("");
  const [youtubeError, setYoutubeError] = useState("");

  // --- SEO States ---
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
  const [seoKeywordsInput, setSeoKeywordsInput] = useState("");
  const [seoImage, setSeoImage] = useState<File | null>(null);
  const [seoImagePreview, setSeoImagePreview] = useState("");

  // --- Color Images for Variant Attribute ---
  const [colorImagesEnabled, setColorImagesEnabled] = useState(false);
  const [colorImages, setColorImages] = useState<Record<string, File | null>>({});
  const [colorImagesPreviews, setColorImagesPreviews] = useState<Record<string, string>>({});

  // --- Interaction / Mock States ---
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "saving" | "success">("idle");
  const [showJsonModal, setShowJsonModal] = useState(false);

  // --- Attributes States & Handlers ---
  const [availableAttributes, setAvailableAttributes] = useState<Attribute[]>(initialAttributes);
  const [selectedAttributes, setSelectedAttributes] = useState<Array<{
    id: number;
    name: string;
    type: "text" | "rich_text" | "select" | "multi_select";
    values?: string[] | null;
    value: string | string[];
  }>>([]);

  useEffect(() => {
    setCategoriesList(initialCategories);
  }, [initialCategories]);

  useEffect(() => {
    setBrandsList(initialBrands);
  }, [initialBrands]);

  useEffect(() => {
    setUnitsList(initialUnits);
  }, [initialUnits]);

  useEffect(() => {
    setAvailableAttributes(initialAttributes);
    if (initialAttributes && initialAttributes.length > 0) {
      const defaultAttrs = initialAttributes
        .filter(attr => attr.is_active && attr.is_default_specification)
        .map(attr => ({
          id: attr.id,
          name: attr.name,
          type: attr.type,
          values: (attr.values || []).map((v: any) => typeof v === "string" ? v : v.value),
          value: attr.type === "multi_select"
            ? []
            : attr.type === "select" && attr.values && attr.values.length > 0
            ? (typeof attr.values[0] === "string" ? attr.values[0] : attr.values[0].value)
            : ""
        }));
      
      setSelectedAttributes(prev => {
        if (prev.length === 0) {
          return defaultAttrs;
        }
        return prev;
      });
    }
  }, [initialAttributes]);

  const handleAddAttribute = (attributeId: string) => {
    if (!attributeId) return;
    const attr = availableAttributes.find(a => String(a.id) === attributeId);
    if (!attr) return;

    if (selectedAttributes.some(sa => sa.id === attr.id)) return;

    setSelectedAttributes(prev => [
      ...prev,
      {
        id: attr.id,
        name: attr.name,
        type: attr.type,
        values: (attr.values || []).map((v: any) => typeof v === "string" ? v : v.value),
        value: attr.type === "multi_select"
          ? []
          : attr.type === "select" && attr.values && attr.values.length > 0
          ? (typeof attr.values[0] === "string" ? attr.values[0] : attr.values[0].value)
          : ""
      }
    ]);
  };

  const handleRemoveAttribute = (attributeId: number) => {
    setSelectedAttributes(prev => prev.filter(a => a.id !== attributeId));
  };

  const handleAttributeValueChange = (attributeId: number, value: string | string[]) => {
    setSelectedAttributes(prev =>
      prev.map(a => (a.id === attributeId ? { ...a, value } : a))
    );
  };

  // --- Variants States & Handlers ---
  const [hasVariants, setHasVariants] = useState(false);
  const [variantAttributes, setVariantAttributes] = useState<Array<{
    id: number;
    name: string;
    type: "select" | "multi_select";
    values: string[];
    selectedValues: string[];
  }>>([]);

  const [generatedVariants, setGeneratedVariants] = useState<Array<{
    id: number;
    title: string;
    sku: string;
    price: string;
    discountPrice: string;
    purchasePrice: string;
    barcode: string;
    image: string | null;
    is_active: boolean;
  }>>([]);

  const handleToggleVariantStatus = (variantTitle: string) => {
    setGeneratedVariants(prev =>
      prev.map(v => {
        if (v.title.toLowerCase() === variantTitle.toLowerCase()) {
          return {
            ...v,
            is_active: !v.is_active
          };
        }
        return v;
      })
    );
  };

  // Cartesian combination generator
  const getCartesianCombinations = (options: Array<{ name: string; selectedValues: string[] }>) => {
    const activeOptions = options.filter(opt => opt.selectedValues.length > 0);
    if (activeOptions.length === 0) return [];

    let results: string[][] = [[]];
    for (const option of activeOptions) {
      const temp: string[][] = [];
      for (const res of results) {
        for (const val of option.selectedValues) {
          temp.push([...res, val]);
        }
      }
      results = temp;
    }
    return results.map(combo => combo.join(" / "));
  };

  // Keep generated variants in sync with selected attributes and options
  useEffect(() => {
    if (!hasVariants) {
      setGeneratedVariants(prev => {
        if (prev.length === 1 && prev[0]?.title === "Default") return prev;
        return [{
          id: 1,
          title: "Default",
          sku: "",
          price: price || "",
          discountPrice: discountPrice || "",
          purchasePrice: purchasePrice || "",
          barcode: "",
          image: null,
          is_active: true
        }];
      });
      return;
    }

    const combos = getCartesianCombinations(variantAttributes);
    
    setGeneratedVariants(prev => {
      return combos.map((combo, idx) => {
        const existing = prev.find(v => v.title.toLowerCase() === combo.toLowerCase());
        const nameSlug = (name || "product").toUpperCase().replace(/[^A-Z0-9]+/g, "-");
        const comboSlug = combo.toUpperCase().replace(/\s*\/\s*/g, "-").replace(/[^A-Z0-9-]+/g, "-");
        return {
          id: idx + 1,
          title: combo,
          sku: existing?.sku || `${nameSlug}-${comboSlug}`,
          price: existing?.price || price || "",
          discountPrice: existing?.discountPrice || "",
          purchasePrice: existing?.purchasePrice || "",
          barcode: existing?.barcode || "",
          image: existing?.image || null,
          is_active: existing?.is_active ?? true
        };
      });
    });
  }, [variantAttributes, hasVariants, name, price, discountPrice, purchasePrice]);

  const handleAddVariantAttribute = (attributeId: string) => {
    if (!attributeId) return;
    const attr = availableAttributes.find(a => String(a.id) === attributeId);
    if (!attr) return;

    if (attr.type === "text" || attr.type === "rich_text" || !attr.values || attr.values.length === 0) return;
    if (variantAttributes.some(va => va.id === attr.id)) return;

    setVariantAttributes(prev => [
      ...prev,
      {
        id: attr.id,
        name: attr.name,
        type: attr.type as "select" | "multi_select",
        values: (attr.values || []).map((v: any) => typeof v === "string" ? v : v.value),
        selectedValues: []
      }
    ]);
  };

  const handleRemoveVariantAttribute = (attributeId: number) => {
    setVariantAttributes(prev => prev.filter(va => va.id !== attributeId));
  };

  const handleToggleVariantAttributeValue = (attributeId: number, optionValue: string) => {
    setVariantAttributes(prev =>
      prev.map(va => {
        if (va.id !== attributeId) return va;
        const exists = va.selectedValues.some(v => v.toLowerCase() === optionValue.toLowerCase());
        return {
          ...va,
          selectedValues: exists
            ? va.selectedValues.filter(v => v.toLowerCase() !== optionValue.toLowerCase())
            : [...va.selectedValues, optionValue]
        };
      })
    );
  };

  const handleColorImageUpload = (color: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setColorImages(prev => ({
      ...prev,
      [color]: file
    }));
    const previewUrl = URL.createObjectURL(file);
    setColorImagesPreviews(prev => ({
      ...prev,
      [color]: previewUrl
    }));
    if (errors[`color_image_${color}`]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[`color_image_${color}`];
        return copy;
      });
    }
  };

  const handleRemoveColorImage = (color: string) => {
    setColorImages(prev => ({
      ...prev,
      [color]: null
    }));
    if (colorImagesPreviews[color]) {
      URL.revokeObjectURL(colorImagesPreviews[color]);
      setColorImagesPreviews(prev => {
        const copy = { ...prev };
        delete copy[color];
        return copy;
      });
    }
  };

  const handleVariantFieldChange = (variantTitle: string, field: "sku" | "price" | "discountPrice" | "purchasePrice" | "barcode", value: string) => {
    setGeneratedVariants(prev =>
      prev.map(v => (v.title.toLowerCase() === variantTitle.toLowerCase() ? { ...v, [field]: value } : v))
    );
    if (!hasVariants) {
      if (field === "price") setPrice(value);
      else if (field === "discountPrice") setDiscountPrice(value);
      else if (field === "purchasePrice") setPurchasePrice(value);
    }
  };

  // File Input Refs
  const mainImageRef = useRef<HTMLInputElement>(null);
  const supportImagesRef = useRef<HTMLInputElement>(null);
  const seoImageRef = useRef<HTMLInputElement>(null);

  // Clean up object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (mainImagePreview) URL.revokeObjectURL(mainImagePreview);
      if (seoImagePreview) URL.revokeObjectURL(seoImagePreview);
      supportImages.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  }, []);

  // --- Handlers ---
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (mainImagePreview) URL.revokeObjectURL(mainImagePreview);
      setMainImage(file);
      setMainImagePreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, mainImage: "" }));
    }
  };

  const handleSupportImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const remainingSlots = 8 - supportImages.length;
      
      if (remainingSlots <= 0) {
        toast.error("Maximum of 8 supporting images allowed.");
        return;
      }

      const filesToAdd = filesArray.slice(0, remainingSlots);
      if (filesArray.length > remainingSlots) {
        toast.error(`Only ${remainingSlots} images were added. Maximum limit is 8.`);
      }

      const newImages = filesToAdd.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: URL.createObjectURL(file)
      }));

      setSupportImages((prev) => [...prev, ...newImages]);
      setErrors((prev) => ({ ...prev, supportImages: "" }));
    }
  };

  const removeSupportImage = (id: string, previewUrl: string) => {
    URL.revokeObjectURL(previewUrl);
    setSupportImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleSeoImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (seoImagePreview) URL.revokeObjectURL(seoImagePreview);
      setSeoImage(file);
      setSeoImagePreview(URL.createObjectURL(file));
    }
  };

  const removeMainImage = () => {
    if (mainImagePreview) URL.revokeObjectURL(mainImagePreview);
    setMainImage(null);
    setMainImagePreview("");
  };

  const removeSeoImage = () => {
    if (seoImagePreview) URL.revokeObjectURL(seoImagePreview);
    setSeoImage(null);
    setSeoImagePreview("");
  };

  // --- Tags Management ---
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const cleanTag = tagInput.trim().toLowerCase();
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags((prev) => [...prev, cleanTag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  // --- SEO Keywords Management ---
  const handleKeywordInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addKeyword();
    }
  };

  const addKeyword = () => {
    const cleanKeyword = seoKeywordsInput.trim().toLowerCase();
    if (cleanKeyword && !seoKeywords.includes(cleanKeyword)) {
      setSeoKeywords((prev) => [...prev, cleanKeyword]);
      setSeoKeywordsInput("");
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setSeoKeywords((prev) => seoKeywords.filter((kw) => kw !== keywordToRemove));
  };

  // --- YouTube URLs ---
  const validateAndAddYoutubeUrl = () => {
    const url = youtubeInput.trim();
    if (!url) return;

    // Standard YouTube URL regex validation
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    if (!youtubeRegex.test(url)) {
      setYoutubeError("Please enter a valid YouTube URL (e.g., https://youtube.com/watch?v=...)");
      return;
    }

    setYoutubeError("");
    setYoutubeUrls((prev) => [...prev, url]);
    setYoutubeInput("");
  };

  const removeYoutubeUrl = (index: number) => {
    setYoutubeUrls((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBrand(e.target.value);
  };

  // --- Actual Submit to Backend API ---
  const handleSaveProduct = async () => {
    const colorAttr = variantAttributes.find(va => va.name.toLowerCase() === "color");
    const selectedColors = colorAttr ? colorAttr.selectedValues : [];

    const validationResult = productSchema.safeParse({
      name,
      shortDescription,
      category,
      unit,
      mainImage,
      hasVariants,
      colorImagesEnabled,
      colorImages,
      selectedColors,
      generatedVariants,
    });

    if (!validationResult.success) {
      const validationErrors = formatZodErrors(validationResult.error);
      setErrors(validationErrors);
      // Scroll to the first error
      const firstErrorKey = Object.keys(validationErrors)[0];
      const anchorId = firstErrorKey.startsWith("color_image_") ? "error-anchor-color-images" : `error-anchor-${firstErrorKey}`;
      const element = document.getElementById(anchorId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    setSubmitStatus("saving");

    // Construct FormData for multipart submission
    const formData = new FormData();
    formData.append("name", name);
    if (banglaName.trim()) formData.append("bangla_name", banglaName);
    if (shortDescription.trim()) formData.append("short_description", shortDescription);
    if (description.trim()) formData.append("description", description);
    formData.append("category_id", category);
    if (brand) formData.append("brand_id", brand);
    if (unit) formData.append("unit_id", unit);
    formData.append("status", status);

    if (weight) formData.append("weight", weight);

    if (mainImage) {
      formData.append("thumbnail", mainImage);
    }

    supportImages.forEach((img) => {
      formData.append("gallery_images[]", img.file);
    });

    if (youtubeUrls.length > 0) {
      youtubeUrls.forEach((url) => {
        formData.append("youtube_urls[]", url);
      });
    }

    if (seoTitle.trim()) formData.append("meta_title", seoTitle);
    if (seoDescription.trim()) formData.append("meta_description", seoDescription);
    if (seoKeywords.length > 0) {
      formData.append("meta_keywords", JSON.stringify(seoKeywords));
    }
    if (seoImage) {
      formData.append("meta_image", seoImage);
    }

    if (selectedAttributes.length > 0) {
      formData.append("specifications", JSON.stringify(selectedAttributes.map(attr => ({
        id: attr.id,
        name: attr.name,
        value: attr.value
      }))));
    }

    formData.append("variants", JSON.stringify(generatedVariants.map(v => {
      const comboParts = hasVariants ? v.title.split(" / ") : [];
      const options = comboParts.map(part => {
        const matchingAttr = variantAttributes.find(va => va.selectedValues.some(val => val.toLowerCase() === part.toLowerCase()));
        return {
          attribute_id: matchingAttr?.id,
          value: part
        };
      });
      return {
        sku: v.sku,
        price: v.price ? Number(v.price) : 0,
        purchase_price: v.purchasePrice ? Number(v.purchasePrice) : 0,
        discount_price: v.discountPrice ? Number(v.discountPrice) : null,
        barcode: v.barcode || null,
        is_active: v.is_active ?? true,
        options
      };
    })));

    if (hasVariants && colorImagesEnabled) {
      const colorAttr = variantAttributes.find(va => va.name.toLowerCase() === "color");
      if (colorAttr) {
        colorAttr.selectedValues.forEach(color => {
          if (colorImages[color]) {
            formData.append(`color_images[${color}]`, colorImages[color]!);
          }
        });
      }
    }

    try {
      const res = await createProduct(formData);
      if (res.success) {
        setSubmitStatus("success");
        setTimeout(() => {
          router.push("/admin/products/list");
        }, 1500);
      } else {
        setSubmitStatus("idle");
        setIsSubmitting(false);
        if (res.errors) {
          const mappedErrors: Record<string, string> = {};
          Object.entries(res.errors).forEach(([key, val]) => {
            const displayKey = key.replace("_id", "");
            mappedErrors[displayKey] = (val as string[])[0];
          });
          setErrors(mappedErrors);
        } else {
          toast.error(res.message || "Failed to save product");
        }
      }
    } catch (err: any) {
      if (err?.message === "NEXT_REDIRECT") return;
      console.error("Error submitting product:", err);
      setSubmitStatus("idle");
      setIsSubmitting(false);
      toast.error(err.message || "Unknown error occurred");
    }
  };

  // SEO Google preview values
  const displaySeoTitle = seoTitle.trim() || name.trim() || "Product Name Displayed Here";
  const displaySeoDesc = seoDescription.trim() || description.trim() || "This is a search result snippet description. Write a detailed description for this product to entice searchers to click through.";
  const displaySeoSlug = (name.trim() || "product-name").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  const debugPayload = {
    name,
    bangla_name: banglaName || null,
    description,
    brand,
    category,
    price: Number(price) || null,
    discount_price: discountPrice ? Number(discountPrice) : null,
    weight: weight ? Number(weight) : null,
    unit,
    status,
    hasVariants,
    variants: generatedVariants.map(v => {
      const comboParts = v.title.split(" / ");
      const options = comboParts.map(part => {
        const matchingAttr = variantAttributes.find(va => va.selectedValues.includes(part));
        return {
          attribute_id: matchingAttr?.id,
          value: part
        };
      });
      return {
        sku: v.sku,
        price: v.price ? Number(v.price) : null,
        discount_price: v.discountPrice ? Number(v.discountPrice) : null,
        options
      };
    })
  };

  return (
    <div className="pt-2 pl-2 pr-4 pb-4 md:pt-3 md:pl-3 md:pr-6 md:pb-6 lg:pt-4 lg:pl-4 lg:pr-8 lg:pb-8 w-full space-y-6 bg-slate-50 min-h-screen text-slate-700">
      {/* Page Header */}
      <PageHeader
        title="Add New Product"
        breadcrumbs={[
          { label: "Home", href: "/admin" },
          { label: "Products", href: "/admin/products/list" },
          { label: "Add Product" }
        ]}
        action={
          <div className="flex gap-3">
            <Link href="/admin/products/list">
              <Button variant="ghost" className="border border-slate-200 bg-white shadow-sm">
                <List size={18} className="text-slate-500 mr-2" />
                Discard
              </Button>
            </Link>
            <Button onClick={handleSaveProduct} disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.01] active:scale-[0.99] transition-all">
              {isSubmitting ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Plus size={18} className="mr-2" />}
              {isSubmitting ? 'Saving...' : 'Save Product'}
            </Button>
          </div>
        }
      />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column (spans 2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card: Basic Information */}
          <Card>
            <CardHeader className="bg-white">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-500" />
                <CardTitle>Basic Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              
              {/* Product Name */}
              <div className="space-y-2" id="error-anchor-name">
                <div className="flex justify-between items-center">
                  <Label htmlFor="product-name" className="text-slate-800 font-semibold flex items-center gap-1">
                    Product Name <span className="text-rose-500">*</span>
                  </Label>
                  {errors.name && (
                    <span className="text-xs text-rose-500 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3" /> {errors.name}
                    </span>
                  )}
                </div>
                <Input 
                  id="product-name"
                  type="text" 
                  placeholder="e.g. Premium Ergonomic Office Chair" 
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  className={errors.name ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100" : ""}
                />
              </div>

              {/* Product Name (Bangla) - Optional */}
              <div className="space-y-2">
                <Label htmlFor="product-name-bn" className="text-slate-800 font-semibold flex items-center gap-1">
                  Product Name (Bangla) <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                </Label>
                <Input 
                  id="product-name-bn"
                  type="text" 
                  placeholder="যেমনঃ প্রিমিয়াম এরগনোমিক অফিস চেয়ার" 
                  value={banglaName}
                  onChange={(e) => setBanglaName(e.target.value)}
                />
              </div>

              {/* Short Description (Optional) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="product-short-desc" className="text-slate-800 font-semibold flex items-center gap-1">
                    Short Description <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                  </Label>
                  <span className="text-xs text-slate-400 font-normal">{shortDescription.length}/1000</span>
                </div>
                <Textarea 
                  id="product-short-desc"
                  placeholder="Enter a brief product overview or key summary..." 
                  value={shortDescription}
                  maxLength={1000}
                  rows={2}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="resize-y text-sm"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="product-desc" className="text-slate-800 font-semibold">Description</Label>
                <RichTextEditor 
                  value={description}
                  onChange={setDescription}
                  placeholder="Describe your product highlights, materials, sizing, and key benefits..." 
                />
              </div>

              {/* Brand and Category Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category Selection */}
                <div className="space-y-2" id="error-anchor-category">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="product-category" className="text-slate-800 font-semibold">
                      Category <span className="text-rose-500">*</span>
                    </Label>
                    {errors.category && (
                      <span className="text-xs text-rose-500 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3" /> {errors.category}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Select 
                      id="product-category"
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        if (errors.category) setErrors((prev) => ({ ...prev, category: "" }));
                      }}
                      className={errors.category ? "border-rose-300 text-slate-700" : "text-slate-700"}
                    >
                      <option value="">Select Category</option>
                      {categoriesList.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </Select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Brand Selection */}
                <div className="space-y-2">
                  <Label htmlFor="product-brand" className="text-slate-800 font-semibold">Brand</Label>
                  <div className="relative">
                    <Select 
                      id="product-brand"
                      value={brand}
                      onChange={handleBrandChange}
                      className="text-slate-700"
                    >
                      <option value="">No Brand / Generic</option>
                      {brandsList.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </Select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>


            </CardContent>
          </Card>

          {/* Card: Product Specifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-indigo-500" />
                <CardTitle>Product Specifications</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    Descriptive Specifications
                  </h3>
                  <p className="text-[10px] text-slate-400">Non-variable details like Material, Weight, or Model</p>
                </div>

                <div className="flex items-end gap-3">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="add-attribute-select" className="text-xs font-bold text-slate-500 uppercase">Add Specification Attribute</Label>
                    <div className="relative">
                      <Select
                        id="add-attribute-select"
                        defaultValue=""
                        onChange={(e) => {
                          handleAddAttribute(e.target.value);
                          e.target.value = ""; // Reset selector
                        }}
                        className="text-slate-700 h-8 border-slate-200"
                      >
                        <option value="">Choose attribute to add...</option>
                        {availableAttributes
                          .filter(attr => !selectedAttributes.some(sa => sa.id === attr.id))
                          .map(attr => (
                            <option key={attr.id} value={attr.id}>
                              {attr.name} ({attr.type === 'select' ? 'Single Select' : attr.type === 'multi_select' ? 'Multi Select' : attr.type === 'rich_text' ? 'Rich Text' : 'Custom Text'})
                            </option>
                          ))
                        }
                      </Select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* List of active product attributes */}
                {selectedAttributes.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-slate-200 rounded-[12px] bg-slate-50/30">
                    <p className="text-xs text-slate-400">No descriptive specifications added yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedAttributes.map((attr) => (
                      <div key={attr.id} className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl space-y-3 relative hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between gap-3 border-b border-slate-100/80 pb-2.5">
                          <div className="space-y-0.5">
                            <p className="text-sm font-bold text-slate-800">{attr.name}</p>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase">
                              {attr.type === 'multi_select' 
                                ? 'Multi-select options' 
                                : attr.type === 'select' 
                                ? 'Single-select option' 
                                : attr.type === 'rich_text'
                                ? 'Rich text content' 
                                : 'Custom text input'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttribute(attr.id)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border-none transition-colors cursor-pointer"
                            title="Remove attribute"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="w-full">
                          {attr.type === "multi_select" ? (
                            <div className="space-y-2.5">
                              {/* Select Dropdown to Add Options */}
                              {attr.values && attr.values.length > 0 && (
                                <div className="relative w-full">
                                  <Select
                                    value=""
                                    closeOnSelect={false}
                                    onChange={(e) => {
                                      const selectedVal = e.target.value;
                                      if (selectedVal) {
                                        const current = Array.isArray(attr.value) ? attr.value : [];
                                        if (!current.includes(selectedVal)) {
                                          handleAttributeValueChange(attr.id, [...current, selectedVal]);
                                        }
                                        e.target.value = "";
                                      }
                                    }}
                                    className="text-slate-700 h-9 border-slate-200 bg-white"
                                  >
                                    <option value="">Choose option to add...</option>
                                    {attr.values
                                      .filter((opt) => !(Array.isArray(attr.value) && attr.value.includes(opt)))
                                      .map((opt, oIdx) => (
                                        <option key={oIdx} value={opt}>
                                          + {opt}
                                        </option>
                                      ))}
                                  </Select>
                                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                                    </svg>
                                  </div>
                                </div>
                              )}

                              {/* Selected Tag Badges Below Dropdown */}
                              {Array.isArray(attr.value) && attr.value.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5 pt-0.5">
                                  {attr.value.map((val, vIdx) => (
                                    <span
                                      key={vIdx}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white shadow-xs border border-indigo-600"
                                    >
                                      <span>{val}</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const current = Array.isArray(attr.value) ? attr.value : [];
                                          const next = current.filter((v) => v !== val);
                                          handleAttributeValueChange(attr.id, next);
                                        }}
                                        className="hover:bg-indigo-700 p-0.5 rounded transition-colors cursor-pointer text-indigo-100 hover:text-white"
                                        title={`Remove ${val}`}
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400 italic">No options selected yet. Choose from dropdown above.</p>
                              )}
                            </div>
                          ) : attr.type === "select" ? (
                            <div className="relative w-full">
                              <Select
                                value={attr.value as string}
                                onChange={(e) => handleAttributeValueChange(attr.id, e.target.value)}
                                className="text-slate-700 h-9 border-slate-200 bg-white"
                              >
                                {attr.values?.map((opt, oIdx) => (
                                  <option key={oIdx} value={opt}>{opt}</option>
                                ))}
                              </Select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                                </svg>
                              </div>
                            </div>
                          ) : attr.type === "rich_text" ? (
                            <RichTextEditor
                              value={(attr.value as string) || ""}
                              onChange={(val) => handleAttributeValueChange(attr.id, val)}
                              placeholder={`Enter ${attr.name.toLowerCase()} content...`}
                            />
                          ) : (
                            <Input
                              type="text"
                              placeholder={`Enter ${attr.name.toLowerCase()} value`}
                              value={attr.value as string}
                              onChange={(e) => handleAttributeValueChange(attr.id, e.target.value)}
                              className="bg-white border-slate-200 h-9"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </CardContent>
          </Card>

          {/* Card: Product Variants */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-500" />
                <CardTitle>Product Variants</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">

              {/* Toggle switch for Variable Product */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <div className="space-y-0.5">
                  <Label htmlFor="has-variants-toggle" className="text-sm font-bold text-slate-800">Variable Product Options</Label>
                  <p className="text-xs text-slate-400">This product has variants like different sizes, colors, or materials</p>
                </div>
                <button
                  id="has-variants-toggle"
                  type="button"
                  onClick={() => setHasVariants(!hasVariants)}
                  className={`relative inline-flex h-6.5 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                    ${hasVariants ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                      ${hasVariants ? 'translate-x-4.5' : 'translate-x-0'}`}
                  />
                </button>
              </div>

              {/* SECTION B: Product Variants Configurations */}
              {hasVariants && (
                <div className="space-y-5 pt-4 border-t border-slate-100 animate-in slide-in-from-top-3 duration-300">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-indigo-500" />
                      Variant Options Config
                    </h3>
                    <p className="text-[10px] text-slate-400">Select attributes to generate variant matrix</p>
                  </div>
                  
                  {/* Select Option Attribute */}
                  <div className="flex items-end gap-3">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="add-variant-attribute-select" className="text-xs font-bold text-slate-500 uppercase">Add Option Attribute</Label>
                      <div className="relative">
                        <Select
                          id="add-variant-attribute-select"
                          defaultValue=""
                          onChange={(e) => {
                            handleAddVariantAttribute(e.target.value);
                            e.target.value = "";
                          }}
                          className="text-slate-700 h-8 border-slate-200"
                        >
                          <option value="">Choose option (e.g. Size, Color)...</option>
                          {availableAttributes
                            .filter(attr => attr.type !== "text" && attr.type !== "rich_text" && attr.values && attr.values.length > 0 && !variantAttributes.some(va => va.id === attr.id))
                            .map(attr => (
                              <option key={attr.id} value={attr.id}>
                                {attr.name} ({attr.type === 'select' ? 'Single Select' : 'Multi Select'})
                              </option>
                            ))
                          }
                        </Select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* List of active variant attributes option values */}
                  {variantAttributes.length > 0 && (
                    <div className="space-y-4">
                      {variantAttributes.map((va) => (
                        <div key={va.id} className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl space-y-3 relative">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-bold text-slate-800">{va.name}</p>
                              <p className="text-[10px] text-slate-400 font-semibold uppercase">Select values to generate combinations</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {va.name.toLowerCase() === "color" && (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    id="enable-color-images"
                                    checked={colorImagesEnabled}
                                    onChange={(e) => setColorImagesEnabled(e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                                  />
                                  <Label htmlFor="enable-color-images" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                                    Add images for color values?
                                  </Label>
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveVariantAttribute(va.id)}
                                className="p-1.5 rounded-lg border-none transition-colors bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                                title="Remove option"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {va.values.map((opt, oIdx) => {
                              const isSelected = va.selectedValues.some(v => v.toLowerCase() === opt.toLowerCase());
                              return (
                                <button
                                  key={oIdx}
                                  type="button"
                                  onClick={() => handleToggleVariantAttributeValue(va.id, opt)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer
                                    ${isSelected
                                      ? 'bg-indigo-600 text-white shadow-sm border border-indigo-600'
                                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>

                          {/* If it's a color attribute and color images are enabled, allow uploading images for values */}
                          {va.name.toLowerCase() === "color" && colorImagesEnabled && va.selectedValues.length > 0 && (
                            <div className="pt-3.5 border-t border-slate-200/60 space-y-3" id="error-anchor-color-images">
                              <div className="space-y-2">
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Upload Image for Selected Colors <span className="text-rose-500">*</span></p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {va.selectedValues.map((color) => {
                                    const preview = colorImagesPreviews[color];
                                    const errorMsg = errors[`color_image_${color}`];
                                    return (
                                      <div key={color} className="space-y-1">
                                        <div className={`p-2 border rounded-lg flex items-center justify-between gap-3 bg-white transition-all ${
                                          errorMsg ? "border-rose-400 bg-rose-50/10 ring-2 ring-rose-100" : "border-slate-200/60"
                                        }`}>
                                          <div className="flex items-center gap-2 min-w-0">
                                            {preview ? (
                                              <img
                                                src={preview}
                                                alt={`${color} preview`}
                                                className="w-8 h-8 rounded object-cover border border-slate-100"
                                              />
                                            ) : (
                                              <div className="w-8 h-8 rounded bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                                                <ImageIcon className="w-4 h-4" />
                                              </div>
                                            )}
                                            <span className="text-xs font-semibold text-slate-700 truncate">{color}</span>
                                          </div>
                                          <div className="flex items-center gap-2.5">
                                            {preview ? (
                                              <button
                                                type="button"
                                                onClick={() => handleRemoveColorImage(color)}
                                                className="text-rose-500 hover:text-rose-700 text-xs font-bold transition-colors cursor-pointer"
                                              >
                                                Remove
                                              </button>
                                            ) : (
                                              <label className="text-indigo-600 hover:text-indigo-855 text-xs font-bold cursor-pointer select-none transition-colors">
                                                Upload
                                                <input
                                                  type="file"
                                                  accept="image/*"
                                                  className="hidden"
                                                  onChange={(e) => handleColorImageUpload(color, e.target.files)}
                                                />
                                              </label>
                                            )}
                                          </div>
                                        </div>
                                        {errorMsg && (
                                          <p className="text-[10px] text-rose-500 font-medium flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {errorMsg}
                                          </p>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Variant Pricing Table */}
              {generatedVariants.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-500 uppercase">
                      {hasVariants ? `Generated Combinations (${generatedVariants.length})` : "Default Variant Pricing"}
                    </h4>
                    {hasVariants && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded font-semibold border border-emerald-100">Combinations Ready</span>
                    )}
                  </div>

                  <div className="overflow-x-auto border border-slate-100 rounded-xl bg-white shadow-sm">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-slate-50/70 text-slate-500 border-b border-slate-100 text-xs font-bold uppercase">
                        <tr>
                          <th className="px-3 py-3 w-24">Variant</th>
                          <th className="px-3 py-3 w-44 min-w-[150px]">SKU</th>
                          <th className="px-3 py-3 min-w-[130px]">Purchase Price (৳)</th>
                          <th className="px-3 py-3 min-w-[130px]">Price (৳)</th>
                          <th className="px-3 py-3 min-w-[140px]">Discount Price (৳)</th>
                          {hasVariants && <th className="px-3 py-3 w-12 text-center">Action</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {generatedVariants.map((v, index) => (
                          <tr key={v.id ? `variant-${v.id}-${index}` : `variant-${v.title}-${index}`} className="hover:bg-slate-50/30 transition-colors">
                            <td className="px-3 py-2.5 font-bold text-slate-800 text-xs">{v.title}</td>
                                <td className="px-3 py-2.5">
                                  <div className="relative">
                                    <Input
                                      type="text"
                                      value={v.sku}
                                      onChange={(e) => {
                                        handleVariantFieldChange(v.title, "sku", e.target.value);
                                        if (errors[`variants.${index}.sku`]) setErrors((prev) => ({ ...prev, [`variants.${index}.sku`]: "" }));
                                      }}
                                      placeholder="SKU"
                                      className={`h-8.5 text-xs bg-white ${errors[`variants.${index}.sku`] ? "border-rose-300 focus:border-rose-500" : ""}`}
                                    />
                                    {errors[`variants.${index}.sku`] && (
                                      <div className="text-[10px] text-rose-500 mt-1 whitespace-nowrap flex items-center gap-1">
                                        <AlertCircle className="w-2.5 h-2.5 inline" /> {errors[`variants.${index}.sku`]}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-3 py-2.5">
                                  <div className="relative">
                                    <Input
                                      type="number"
                                      step="any"
                                      min="0"
                                      value={v.purchasePrice}
                                      onChange={(e) => {
                                        handleVariantFieldChange(v.title, "purchasePrice", e.target.value);
                                        if (errors[`variants.${index}.purchase_price`]) setErrors((prev) => ({ ...prev, [`variants.${index}.purchase_price`]: "" }));
                                      }}
                                      placeholder="Purchase Price"
                                      className={`h-8.5 text-xs bg-white ${errors[`variants.${index}.purchase_price`] ? "border-rose-300 focus:border-rose-500" : ""}`}
                                    />
                                    {errors[`variants.${index}.purchase_price`] && (
                                      <div className="text-[10px] text-rose-500 mt-1 whitespace-nowrap flex items-center gap-1">
                                        <AlertCircle className="w-2.5 h-2.5 inline" /> {errors[`variants.${index}.purchase_price`]}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-3 py-2.5">
                                  <div className="relative">
                                    <Input
                                      type="number"
                                      step="any"
                                      min="0"
                                      value={v.price}
                                      onChange={(e) => {
                                        handleVariantFieldChange(v.title, "price", e.target.value);
                                        if (errors[`variants.${index}.price`]) setErrors((prev) => ({ ...prev, [`variants.${index}.price`]: "" }));
                                      }}
                                      placeholder="Price"
                                      className={`h-8.5 text-xs bg-white ${errors[`variants.${index}.price`] ? "border-rose-300 focus:border-rose-500" : ""}`}
                                    />
                                    {errors[`variants.${index}.price`] && (
                                      <div className="text-[10px] text-rose-500 mt-1 whitespace-nowrap flex items-center gap-1">
                                        <AlertCircle className="w-2.5 h-2.5 inline" /> {errors[`variants.${index}.price`]}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-3 py-2.5">
                                  <div className="relative">
                                    <Input
                                      type="number"
                                      step="any"
                                      min="0"
                                      value={v.discountPrice}
                                      onChange={(e) => {
                                        handleVariantFieldChange(v.title, "discountPrice", e.target.value);
                                        if (errors[`variants.${index}.discount_price`]) setErrors((prev) => ({ ...prev, [`variants.${index}.discount_price`]: "" }));
                                      }}
                                      placeholder="Discount Price"
                                      className={`h-8.5 text-xs bg-white ${errors[`variants.${index}.discount_price`] ? "border-rose-300 focus:border-rose-500" : ""}`}
                                    />
                                    {errors[`variants.${index}.discount_price`] && (
                                      <div className="text-[10px] text-rose-500 mt-1 whitespace-nowrap flex items-center gap-1">
                                        <AlertCircle className="w-2.5 h-2.5 inline" /> {errors[`variants.${index}.discount_price`]}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                {hasVariants && (
                                  <td className="px-3 py-2.5 text-center">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleVariantStatus(v.title)}
                                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                                        v.is_active === false
                                          ? "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                                          : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                      }`}
                                      title="Click to toggle variant status"
                                    >
                                      {v.is_active === false ? "Inactive" : "Active"}
                                    </button>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

            </CardContent>
          </Card>

          {/* Card: Media & Images */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-indigo-500" />
                <CardTitle>Product Media</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Main Image Uploader */}
              <div className="space-y-2.5" id="error-anchor-mainImage">
                <div className="flex justify-between items-center">
                  <Label className="text-slate-800 font-semibold flex items-center gap-1">
                    Add Thumbnail Image <span className="text-rose-500">*</span>
                  </Label>
                  {errors.mainImage && (
                    <span className="text-xs text-rose-500 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3" /> {errors.mainImage}
                    </span>
                  )}
                </div>

                {!mainImagePreview ? (
                  <div 
                    onClick={() => mainImageRef.current?.click()}
                    className={`border-2 border-dashed rounded-[12px] p-6 text-center cursor-pointer transition-all hover:bg-indigo-50/20 hover:border-indigo-400 group ${
                      errors.mainImage ? "border-rose-300 bg-rose-50/10" : "border-slate-200"
                    }`}
                  >
                    <input 
                      type="file" 
                      ref={mainImageRef} 
                      onChange={handleMainImageChange} 
                      className="hidden" 
                      accept="image/*"
                    />
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="p-3 rounded-full bg-slate-100 group-hover:bg-indigo-50 transition-colors">
                        <Upload className="w-6 h-6 text-slate-500 group-hover:text-indigo-600" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-indigo-600 hover:underline">Click to upload</span>
                        <span className="text-sm text-slate-500"> or drag and drop</span>
                      </div>
                      <p className="text-xs text-slate-400 font-bold">300px X 300px (PNG, JPG, JPEG, WEBP, Max 5MB)</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative border border-slate-100 rounded-[12px] overflow-hidden group bg-slate-50 flex items-center justify-center min-h-[220px]">
                    <img 
                      src={mainImagePreview} 
                      alt="Main product preview" 
                      className="max-h-[260px] max-w-full object-contain rounded-[8px]" 
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5">
                      <Button 
                        type="button" 
                        variant="danger" 
                        size="icon" 
                        className="rounded-full shadow-md bg-white text-rose-600 hover:bg-rose-50"
                        onClick={removeMainImage}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="bg-white/95 text-slate-700 hover:bg-white border border-transparent shadow-md"
                        onClick={() => mainImageRef.current?.click()}
                      >
                        Change Image
                      </Button>
                      <input 
                        type="file" 
                        ref={mainImageRef} 
                        onChange={handleMainImageChange} 
                        className="hidden" 
                        accept="image/*"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Column (spans 1/3) */}
        <div className="space-y-6">
          
          {/* Card: Product Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-500" />
                <CardTitle>Product Configuration</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">

              {/* Status & Min Stock Alert Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Status Select Field */}
                <div className="space-y-2">
                  <Label htmlFor="product-status" className="text-slate-800 font-semibold">
                    Status
                  </Label>
                  <Select 
                    id="product-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "active" | "draft" | "inactive")}
                    className="text-slate-700 font-medium"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="inactive">Inactive</option>
                  </Select>
                </div>

                {/* Min Stock Alert */}
                <div className="space-y-2">
                  <Label htmlFor="product-min-stock" className="text-slate-800 font-semibold">
                    Min Stock Alert
                  </Label>
                  <Input
                    id="product-min-stock"
                    type="number"
                    placeholder="0"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              {/* Unit Field */}
              <div className="space-y-2" id="error-anchor-unit">
                <div className="flex justify-between items-center">
                  <Label htmlFor="product-unit" className="text-slate-800 font-semibold flex items-center gap-1">
                    Unit <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                  </Label>
                  {errors.unit && (
                    <span className="text-xs text-rose-500 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3" /> {errors.unit}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Select 
                    id="product-unit"
                    value={unit}
                    onChange={(e) => {
                      setUnit(e.target.value);
                      if (errors.unit) setErrors((prev) => ({ ...prev, unit: "" }));
                    }}
                    className={errors.unit ? "border-rose-300 text-slate-700" : "text-slate-700"}
                  >
                    <option value="">Select Unit</option>
                    {unitsList.map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.short_name})</option>
                    ))}
                  </Select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Weight Field */}
              <div className="space-y-2">
                <Label htmlFor="product-weight" className="text-slate-800 font-semibold">Weight (In Kg)</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Scale className="w-4 h-4" />
                  </div>
                  <Input 
                    id="product-weight"
                    type="number" 
                    placeholder="0.00" 
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="pl-9"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              {/* YouTube Video URLs */}
              <div className="space-y-2.5">
                <Label htmlFor="youtube-input" className="text-slate-800 font-semibold">YouTube Video URLs</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Link2 className="w-4 h-4" />
                    </div>
                    <Input
                      id="youtube-input"
                      type="text"
                      placeholder="e.g. https://www.youtube.com/... "
                      value={youtubeInput}
                      onChange={(e) => {
                        setYoutubeInput(e.target.value);
                        if (youtubeError) setYoutubeError("");
                      }}
                      className={`pl-9 ${youtubeError ? "border-rose-300" : ""}`}
                    />
                  </div>
                  <Button 
                    type="button"
                    onClick={validateAndAddYoutubeUrl}
                    className="bg-indigo-50 border border-transparent text-indigo-600 hover:bg-indigo-100 hover:text-indigo-800 font-bold px-3 text-xs"
                  >
                    Add URL
                  </Button>
                </div>
                {youtubeError && (
                  <p className="text-xs text-rose-500 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {youtubeError}
                  </p>
                )}

                {youtubeUrls.length > 0 && (
                  <div className="space-y-2 mt-3 p-3 bg-slate-50/50 rounded-[10px] border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500">Linked Videos ({youtubeUrls.length})</p>
                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                      {youtubeUrls.map((url, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center justify-between p-2 rounded-[8px] bg-white border border-slate-100 shadow-sm"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="flex-shrink-0 p-1.5 rounded-full bg-rose-50 text-rose-600">
                              <Youtube className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-medium text-slate-600 truncate max-w-[170px]">
                              {url}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeYoutubeUrl(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </CardContent>
          </Card>

          {/* Card: SEO Meta Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-500" />
                <CardTitle>SEO Meta Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              
              {/* Google Search Engine Preview Snippet */}
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-[12px] space-y-1">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider flex items-center gap-1.5 uppercase">
                  <Eye className="w-3 h-3" /> Google Snippet Preview
                </span>
                <div className="pt-1.5 space-y-1">
                  {/* Google breadcrumb link */}
                  <div className="text-[11px] text-[#202124] truncate leading-tight font-medium">
                    https://yourstore.com <span className="text-[#5f6368]">› products › {displaySeoSlug}</span>
                  </div>
                  {/* Google blue title */}
                  <div className="text-[17px] text-[#1a0dab] hover:underline cursor-pointer font-medium leading-snug break-words">
                    {displaySeoTitle}
                  </div>
                  {/* Google grey snippet description */}
                  <div className="text-[13px] text-[#4d5156] leading-normal break-words line-clamp-2">
                    {displaySeoDesc}
                  </div>
                </div>
              </div>

              {/* Meta Title */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <Label htmlFor="seo-title" className="text-slate-800 font-semibold">Meta Title</Label>
                  <span className={`font-semibold ${seoTitle.length > 60 ? "text-rose-500" : "text-slate-400"}`}>
                    {seoTitle.length} / 60
                  </span>
                </div>
                <Input
                  id="seo-title"
                  type="text"
                  placeholder={name || "SEO Title (defaults to Name)"}
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value.slice(0, 80))}
                />
                <p className="text-[10px] text-slate-400 font-medium">Optimal: 50–60 characters. Maximum search length.</p>
              </div>

              {/* Meta Description */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <Label htmlFor="seo-description" className="text-slate-800 font-semibold">Meta Description</Label>
                  <span className={`font-semibold ${seoDescription.length > 160 ? "text-rose-500" : "text-slate-400"}`}>
                    {seoDescription.length} / 160
                  </span>
                </div>
                <Textarea
                  id="seo-description"
                  placeholder={description || "Enter detailed search snippet snippet..."}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value.slice(0, 220))}
                  className="min-h-[80px]"
                />
                <p className="text-[10px] text-slate-400 font-medium">Optimal: 120–160 characters. Snippet preview.</p>
              </div>

              {/* Meta Keywords */}
              <div className="space-y-1.5">
                <Label htmlFor="seo-keywords" className="text-slate-800 font-semibold flex items-center gap-1.5">
                  Meta Keywords 
                  <span className="text-[10px] text-slate-400 font-normal">(Press Enter or Comma)</span>
                </Label>
                <div className="border border-slate-200 rounded-[10px] bg-white p-2 min-h-[42px] flex flex-wrap gap-1.5 items-center transition-all focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100">
                  {seoKeywords.map((keyword) => (
                    <span 
                      key={keyword} 
                      className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-[6px] text-xs font-semibold"
                    >
                      {keyword}
                      <button 
                        type="button" 
                        onClick={() => removeKeyword(keyword)}
                        className="text-indigo-400 hover:text-indigo-900 rounded-full focus:outline-none cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    id="seo-keywords"
                    type="text"
                    placeholder={seoKeywords.length === 0 ? "e.g. office, desk, posture, luxury" : ""}
                    value={seoKeywordsInput}
                    onChange={(e) => setSeoKeywordsInput(e.target.value)}
                    onKeyDown={handleKeywordInputKeyDown}
                    className="flex-1 min-w-[120px] bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none border-none py-0.5 px-1 focus:ring-0 text-xs"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Interactive tag list of keywords.</p>
              </div>

              {/* Meta Share Image */}
              <div className="space-y-2">
                <Label className="text-slate-800 font-semibold">Meta Sharing Image</Label>
                
                {!seoImagePreview ? (
                  <div 
                    onClick={() => seoImageRef.current?.click()}
                    className="border border-dashed border-slate-200 rounded-[10px] p-4 text-center cursor-pointer hover:bg-indigo-50/10 hover:border-indigo-400 transition-all group"
                  >
                    <input 
                      type="file" 
                      ref={seoImageRef} 
                      onChange={handleSeoImageChange} 
                      className="hidden" 
                      accept="image/*"
                    />
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <Upload className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 mb-1" />
                      <span className="text-xs font-semibold text-indigo-600 hover:underline">Upload SEO Image</span>
                      <p className="text-[10px] text-slate-400">1200 x 630px recommended</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative border border-slate-100 rounded-[10px] overflow-hidden group bg-slate-50 aspect-[1.91/1] flex items-center justify-center">
                    <img 
                      src={seoImagePreview} 
                      alt="SEO meta preview" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button 
                        type="button" 
                        variant="danger" 
                        size="icon" 
                        className="rounded-full shadow-md bg-white text-rose-600 hover:bg-rose-50"
                        onClick={removeSeoImage}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

            </CardContent>
          </Card>

          {/* Card: Product Gallery */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-indigo-500" />
                <CardTitle>Product Gallery</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-slate-800 font-semibold text-xs">
                  Gallery Images <span className="text-slate-400 font-normal">(Optional)</span> <span className="text-slate-400 font-normal">({supportImages.length} / 8)</span>
                </Label>
                <span className="text-[10px] text-slate-400 font-bold">Max 8 (800x800)</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Uploaded Previews */}
                {supportImages.map((img) => (
                  <div 
                    key={img.id}
                    className="relative aspect-square border border-slate-200 rounded-[10px] overflow-hidden bg-slate-100 group flex items-center justify-center"
                  >
                    <img 
                      src={img.preview} 
                      alt="Support product preview" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-slate-900/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button 
                        type="button" 
                        variant="danger" 
                        size="icon" 
                        className="rounded-full shadow bg-white hover:bg-rose-50 text-rose-600 w-7 h-7"
                        onClick={() => removeSupportImage(img.id, img.preview)}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Empty upload card placeholder */}
                {supportImages.length < 8 && (
                  <div 
                    onClick={() => supportImagesRef.current?.click()}
                    className="relative aspect-square border-2 border-dashed border-slate-200 rounded-[10px] flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50/20 hover:border-indigo-400 transition-all group p-2"
                  >
                    <div className="p-1.5 rounded-full bg-slate-100 group-hover:bg-indigo-50 transition-colors">
                      <Plus className="w-4 h-4 text-slate-500 group-hover:text-indigo-600" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 group-hover:text-indigo-600 mt-1">
                      Add Image
                    </span>
                    <input 
                      type="file" 
                      ref={supportImagesRef} 
                      onChange={handleSupportImagesChange} 
                      className="hidden" 
                      accept="image/*"
                      multiple
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>

      </div>

      {/* Sticky Bottom Actions Bar on Mobile */}
      <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 mt-8">
        <Link href="/admin/products/list">
          <Button variant="ghost" className="border border-slate-200 bg-white">
            Cancel
          </Button>
        </Link>
        <Button onClick={handleSaveProduct} disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.01] active:scale-[0.99] transition-all px-8">
          {isSubmitting ? <Loader2 size={18} className="mr-2 animate-spin" /> : null}
          {isSubmitting ? 'Saving...' : 'Save Product'}
        </Button>
      </div>

      {/* Mock Submit JSON Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[16px] max-w-2xl w-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-indigo-50/40">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Save Product (Frontend Design Simulation)</h3>
                  <p className="text-[11px] text-slate-500 font-medium">All inputs compiled and serialized</p>
                </div>
              </div>
              {!isSubmitting && (
                <button 
                  onClick={() => {
                    setShowJsonModal(false);
                    setSubmitStatus("idle");
                  }}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {submitStatus === "saving" ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                  <div className="text-center">
                    <p className="font-bold text-slate-800">Simulating product save...</p>
                    <p className="text-xs text-slate-400 mt-1">Packaging form data, media assets, and SEO metadata</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-[12px] flex items-start gap-3">
                    <div className="p-1 bg-emerald-500 text-white rounded-full mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Product Form Saved Successfully!</p>
                      <p className="text-xs text-emerald-700 mt-0.5">
                        Frontend states gathered perfectly. View the JSON structure prepared for backend integration below:
                      </p>
                    </div>
                  </div>

                  {/* JSON Payload Display */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-500 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-indigo-500" /> Compiled API Payload
                      </span>
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-semibold text-[10px]">
                        application/json
                      </span>
                    </div>
                    <pre className="p-4 rounded-[12px] bg-slate-900 text-indigo-300 text-xs font-mono overflow-x-auto max-h-[300px] leading-relaxed shadow-inner">
                      {JSON.stringify(debugPayload, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {submitStatus === "success" && (
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                <Button 
                  onClick={() => {
                    setShowJsonModal(false);
                    setSubmitStatus("idle");
                  }} 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Close & Continue Editing
                </Button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
