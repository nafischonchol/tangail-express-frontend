"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { 
  Plus, 
  Edit, 
  X, 
  Image as ImageIcon, 
  Search, 
  Check, 
  AlertCircle, 
  Loader2, 
  Globe, 
  Sliders, 
  UploadCloud,
  FileText,
  Key
} from "lucide-react";
import { 
  createBrand, 
  updateBrand, 
  Brand 
} from "@/lib/api/brands";

interface BrandsClientProps {
  initialBrands: Brand[];
}

export default function BrandsClient({ initialBrands }: BrandsClientProps) {
  const router = useRouter();

  // Data State
  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  
  // Fields State
  const [name, setName] = useState("");
  const [status, setStatus] = useState("active");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaKeywords, setMetaKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  
  // Icon State
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  // Meta Image State
  const [metaImageFile, setMetaImageFile] = useState<File | null>(null);
  const [metaImagePreview, setMetaImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Sync props to state when server updates
  useEffect(() => {
    setBrands(initialBrands);
  }, [initialBrands]);

  // Utility to show notification auto-fading after 4s
  const showNotification = useCallback((type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  }, []);

  // Open Modal for Create
  const handleOpenCreate = () => {
    setEditingBrand(null);
    setName("");
    setStatus("active");
    setMetaTitle("");
    setMetaKeywords([]);
    setKeywordInput("");
    setMetaDescription("");
    setIconFile(null);
    setIconPreview(null);
    setMetaImageFile(null);
    setMetaImagePreview(null);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setName(brand.name);
    setStatus(brand.is_active ? "active" : "inactive");
    setMetaTitle(brand.meta_title || "");
    setMetaKeywords(brand.meta_keyword || []);
    setKeywordInput("");
    setMetaDescription(brand.meta_description || "");
    setIconFile(null);
    setIconPreview(brand.icon || null);
    setMetaImageFile(null);
    setMetaImagePreview(brand.meta_image || null);
    setIsModalOpen(true);
  };

  // Handle Drag & Drop Events for Meta Image
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setMetaImageFile(file);
      setMetaImagePreview(URL.createObjectURL(file));
    } else {
      showNotification("error", "Please upload a valid image file.");
    }
  };

  // Handle File Input Changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMetaImageFile(file);
      setMetaImagePreview(URL.createObjectURL(file));
    }
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
    }
  };

  // Clear choices
  const handleClearImage = () => {
    setMetaImageFile(null);
    setMetaImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClearIcon = () => {
    setIconFile(null);
    setIconPreview(null);
    if (iconInputRef.current) {
      iconInputRef.current.value = "";
    }
  };

  // Form Submit Action
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showNotification("error", "Brand name is required.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("is_active", status === "active" ? "1" : "0");
    formData.append("meta_title", metaTitle);
    formData.append("meta_description", metaDescription);
    
    // Append array of keywords to FormData
    metaKeywords.forEach(kw => {
      formData.append("meta_keyword[]", kw);
    });

    if (iconFile) {
      formData.append("icon", iconFile);
    }
    if (metaImageFile) {
      formData.append("meta_image", metaImageFile);
    }

    let response;
    if (editingBrand) {
      response = await updateBrand(editingBrand.id, formData);
    } else {
      response = await createBrand(formData);
    }

    setIsSubmitting(false);

    if (response.success) {
      showNotification("success", response.message);
      setIsModalOpen(false);
      router.refresh();
    } else {
      showNotification("error", response.message);
    }
  };

  // Filter brands by search query
  const filteredBrands = brands.filter(brand => 
    brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    brand.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pt-2 pl-2 pr-4 pb-4 md:pt-3 md:pl-3 md:pr-6 md:pb-6 lg:pt-4 lg:pl-4 lg:pr-8 lg:pb-8 w-full space-y-6 relative">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300 
          ${notification.type === 'success' 
            ? 'bg-emerald-50/90 border-emerald-100 text-emerald-800' 
            : 'bg-rose-50/90 border-rose-100 text-rose-800'}`}>
          {notification.type === 'success' ? (
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Check size={18} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600">
              <AlertCircle size={18} />
            </div>
          )}
          <div>
            <p className="text-sm font-semibold">{notification.type === 'success' ? 'Success' : 'Error'}</p>
            <p className="text-xs text-slate-500 mt-0.5">{notification.message}</p>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 transition-colors ml-4"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-6 bg-slate-50/30">
          <CardTitle className="text-xl font-bold text-slate-800">Brands</CardTitle>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input 
                type="text" 
                placeholder="Search by name or slug..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-8 w-full rounded-xl bg-white border-slate-200"
              />
            </div>
            <Button onClick={handleOpenCreate} className="h-8 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 bg-indigo-600 text-white hover:bg-indigo-700">
              <Plus size={18} className="mr-1.5" />
              Add Brand
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider w-16">ID</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Brand Details</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">SEO Fields</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right w-32">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBrands.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <Search size={24} />
                        </div>
                        <div>
                          <p className="text-base font-bold text-slate-700">No brands found</p>
                          <p className="text-sm text-slate-400 mt-1">Try refining your search or add a new brand to get started.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredBrands.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/40 transition-colors group">
                      <td className="px-6 py-4.5 text-slate-500 font-medium">#{row.id}</td>
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3">
                          {row.icon ? (
                            <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 bg-white flex-shrink-0 flex items-center justify-center">
                              <img src={row.icon} alt={row.name} className="object-cover w-full h-full" />
                            </div>
                          ) : row.meta_image ? (
                            <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 bg-white flex-shrink-0 flex items-center justify-center">
                              <img src={row.meta_image} alt={row.name} className="object-cover w-full h-full" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-500 font-bold text-xs uppercase">
                              {row.name.substring(0, 2)}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{row.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5 font-mono">/{row.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4.5">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border
                          ${row.is_active 
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                            : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${row.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {row.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="flex flex-wrap gap-1.5">
                          {row.meta_title ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 border border-indigo-100 text-indigo-700">
                              <Check size={10} /> Title
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-50 border border-slate-100 text-slate-400">
                              Title
                            </span>
                          )}
                          
                          {row.meta_keyword && row.meta_keyword.length > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 border border-indigo-100 text-indigo-700">
                              <Check size={10} /> Keywords
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-50 border border-slate-100 text-slate-400">
                              Keywords
                            </span>
                          )}
                          
                          {row.meta_description ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 border border-indigo-100 text-indigo-700">
                              <Check size={10} /> Desc
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-50 border border-slate-100 text-slate-400">
                              Desc
                            </span>
                          )}

                          {row.meta_image ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 border border-indigo-100 text-indigo-700">
                              <Check size={10} /> Image
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-50 border border-slate-100 text-slate-400">
                              Image
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4.5 text-right space-x-1.5">
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => handleOpenEdit(row)}
                          className="h-8.5 w-8.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-none transition-all p-0 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 shadow-xs"
                          title="Edit Brand"
                        >
                          <Edit size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Polish Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          
          <form 
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Sliders size={18} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  {editingBrand ? 'Edit Brand' : 'Create Brand'}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
              
              {/* SECTION 1: Core Details */}
              <div className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="brand-name" className="text-xs font-bold text-slate-500 uppercase">Brand Name <span className="text-rose-500">*</span></Label>
                    <Input 
                      id="brand-name"
                      type="text" 
                      placeholder="e.g. Nike or Apple" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="rounded-xl h-9 border-slate-200"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="brand-status" className="text-xs font-bold text-slate-500 uppercase">Status</Label>
                    <div className="relative">
                      <Select 
                        id="brand-status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="rounded-xl h-9 border-slate-200 text-slate-700 bg-white"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </Select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Brand Icon Uploader */}
                  <div className="md:col-span-3 space-y-2.5">
                    <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                      <ImageIcon size={12} className="text-slate-400" /> Brand Icon
                    </Label>

                    {iconPreview ? (
                      <div className="relative group/icon-preview rounded-2xl border border-slate-200/60 bg-slate-50/50 p-2.5 flex items-center gap-4 transition-all hover:bg-slate-50 max-w-sm">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white border border-slate-200 flex-shrink-0 flex items-center justify-center">
                          <img 
                            src={iconPreview} 
                            alt="Brand Icon" 
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-700 truncate">
                            {iconFile ? iconFile.name : 'Current Icon'}
                          </p>
                          <button
                            type="button"
                            onClick={() => iconInputRef.current?.click()}
                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors block mt-0.5"
                          >
                            Replace Icon
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={handleClearIcon}
                          className="w-6 h-6 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center text-slate-400 transition-all shadow-sm flex-shrink-0 mr-1"
                          title="Remove Icon"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => iconInputRef.current?.click()}
                        className="border border-dashed border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50 rounded-2xl p-4 text-center cursor-pointer transition-all flex items-center justify-center gap-3 max-w-sm"
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                          <UploadCloud size={16} />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-700">Upload icon</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, SVG up to 1MB</p>
                        </div>
                      </div>
                    )}

                    <input 
                      ref={iconInputRef}
                      type="file" 
                      accept="image/*" 
                      onChange={handleIconChange}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* SECTION 2: SEO Meta Information */}
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Globe size={13} />
                      SEO Meta Configurations
                    </h4>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Meta Title */}
                  <div className="space-y-2">
                    <Label htmlFor="meta-title" className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                      <FileText size={12} className="text-slate-400" /> Meta Title
                    </Label>
                    <Input 
                      id="meta-title"
                      type="text" 
                      placeholder="SEO Optimized Page Title" 
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      className="rounded-xl h-9 border-slate-200"
                    />
                  </div>

                  {/* Meta Keywords Tags Input */}
                  <div className="space-y-2">
                    <Label htmlFor="meta-keywords" className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                      <Key size={12} className="text-slate-400" /> Meta Keywords
                    </Label>
                    <div className="flex flex-wrap items-center gap-2 p-2 border border-slate-200 rounded-[10px] bg-white min-h-[44px] focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100 transition-all">
                      {metaKeywords.map((tag, index) => (
                        <span key={index} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 select-none animate-in scale-in duration-200">
                          {tag}
                          <button
                            type="button"
                            onClick={() => {
                              setMetaKeywords(metaKeywords.filter((_, i) => i !== index));
                            }}
                            className="w-4.5 h-4.5 rounded-full bg-indigo-100/50 hover:bg-indigo-100 flex items-center justify-center text-indigo-700 hover:text-indigo-900 transition-colors"
                          >
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                      <input
                        id="meta-keywords"
                        type="text"
                        placeholder={metaKeywords.length === 0 ? "Press Enter or Comma to add tags" : ""}
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault();
                            const val = keywordInput.trim().replace(/,/g, "");
                            if (val && !metaKeywords.includes(val)) {
                              setMetaKeywords([...metaKeywords, val]);
                            }
                            setKeywordInput("");
                          } else if (e.key === "Backspace" && !keywordInput && metaKeywords.length > 0) {
                            setMetaKeywords(metaKeywords.slice(0, -1));
                          }
                        }}
                        className="flex-1 min-w-[120px] bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none border-none p-1"
                      />
                    </div>
                  </div>

                  {/* Meta Description */}
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="meta-desc" className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                      <FileText size={12} className="text-slate-400" /> Meta Description
                    </Label>
                    <Textarea 
                      id="meta-desc"
                      placeholder="Write a concise meta summary here (recommends less than 160 characters)" 
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      className="rounded-xl min-h-[90px] border-slate-200"
                    />
                  </div>

                  {/* Meta Image Drag and Drop */}
                  <div className="md:col-span-2 space-y-2.5">
                    <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                      <ImageIcon size={12} className="text-slate-400" /> Brand Logo / Meta Image
                    </Label>

                    {metaImagePreview ? (
                      <div className="relative group/preview rounded-2xl border border-slate-200/60 bg-slate-50/50 p-3.5 flex items-center gap-4 transition-all hover:bg-slate-50">
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white border border-slate-200 flex-shrink-0 flex items-center justify-center">
                          <img 
                            src={metaImagePreview} 
                            alt="SEO Preview" 
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-700 truncate">
                            {metaImageFile ? metaImageFile.name : 'Current Brand Logo / Image'}
                          </p>
                          <p className="text-xs text-slate-400 mt-1 font-mono uppercase">
                            {metaImageFile ? `${(metaImageFile.size / 1024).toFixed(1)} KB` : 'Database Asset'}
                          </p>
                          
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors mt-2 block"
                          >
                            Replace Image
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={handleClearImage}
                          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center text-slate-400 transition-all shadow-sm flex-shrink-0 mr-1.5"
                          title="Remove Image"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ) : (
                      <div 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2
                          ${isDragOver 
                            ? 'border-indigo-500 bg-indigo-50/40 shadow-sm' 
                            : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50'}`}
                      >
                        <div className={`w-11 w-11 h-11 rounded-full flex items-center justify-center transition-colors 
                          ${isDragOver ? 'bg-indigo-500/10 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                          <UploadCloud size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">Upload brand image</p>
                          <p className="text-xs text-slate-400 mt-0.5">Drag and drop file here, or click to browse</p>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">PNG, JPG, JPEG, or WEBP up to 2MB</p>
                      </div>
                    )}

                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 px-6 py-5 border-t border-slate-100 bg-slate-50/40">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="h-9 rounded-xl"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={16} className="mr-1.5" />
                    Save Brand
                  </>
                )}
              </Button>
            </div>

          </form>

        </div>
      )}

    </div>
  );
}
