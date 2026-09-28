"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { 
  ArrowLeft,
  Plus, 
  X, 
  Check, 
  AlertCircle, 
  Loader2, 
  Sliders, 
  Tag,
  Image as ImageIcon,
  Trash2,
  Info,
  Globe
} from "lucide-react";
import { 
  updateAttribute, 
  Attribute,
  AttributeValueOption
} from "@/lib/api/attributes";

interface EditAttributeClientProps {
  initialAttribute: Attribute;
}

interface OptionItemState {
  id?: number;
  value: string;
  image?: string | null;
  image_relative?: string | null;
  file?: File | null;
  previewUrl?: string | null;
  removeImage?: boolean;
  meta_title?: string;
  meta_description?: string;
  is_active?: boolean;
  showSeo?: boolean;
}

export default function EditAttributeClient({ initialAttribute }: EditAttributeClientProps) {
  const router = useRouter();

  // Helper to convert AttributeValueOption to internal OptionItemState
  const parseAttributeOptions = (rawValues?: (AttributeValueOption | string)[] | null): OptionItemState[] => {
    if (!rawValues || !Array.isArray(rawValues)) return [];
    return rawValues.map((item) => {
      if (typeof item === "string") {
        return { value: item, is_active: true };
      }
      return {
        id: item.id,
        value: item.value,
        image: item.image,
        image_relative: item.image_relative,
        meta_title: item.meta_title || "",
        meta_description: item.meta_description || "",
        is_active: item.is_active ?? true,
      };
    });
  };

  // Form Fields State
  const [name, setName] = useState(initialAttribute.name);
  const [type, setType] = useState<"text" | "rich_text" | "select" | "multi_select">(initialAttribute.type);
  const [options, setOptions] = useState<OptionItemState[]>(parseAttributeOptions(initialAttribute.values));
  const [valueInput, setValueInput] = useState("");
  const [status, setStatus] = useState(initialAttribute.is_active ? "active" : "inactive");
  const [isDefaultSpecification, setIsDefaultSpecification] = useState(!!initialAttribute.is_default_specification);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Option Handlers
  const handleAddOption = () => {
    const trimmed = valueInput.trim();
    if (!trimmed) return;
    setOptions(prev => [...prev, { value: trimmed, is_active: true }]);
    setValueInput("");
  };

  const handleUpdateOptionText = (index: number, val: string) => {
    setOptions(prev => prev.map((opt, i) => i === index ? { ...opt, value: val } : opt));
  };

  const handleRemoveOption = (index: number) => {
    setOptions(prev => prev.filter((_, i) => i !== index));
  };

  const toggleSeoPanel = (index: number) => {
    setOptions(prev => prev.map((opt, i) => i === index ? { ...opt, showSeo: !opt.showSeo } : opt));
  };

  const handleUpdateMetaTitle = (index: number, title: string) => {
    setOptions(prev => prev.map((opt, i) => i === index ? { ...opt, meta_title: title } : opt));
  };

  const handleUpdateMetaDescription = (index: number, desc: string) => {
    setOptions(prev => prev.map((opt, i) => i === index ? { ...opt, meta_description: desc } : opt));
  };

  const handleUpdateOptionStatus = (index: number, isActive: boolean) => {
    setOptions(prev => prev.map((opt, i) => i === index ? { ...opt, is_active: isActive } : opt));
  };

  const handleOptionImageChange = (index: number, file: File | null) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setOptions(prev => prev.map((opt, i) => {
      if (i === index) {
        return {
          ...opt,
          file,
          previewUrl,
          removeImage: false,
        };
      }
      return opt;
    }));
  };

  const handleRemoveOptionImage = (index: number) => {
    setOptions(prev => prev.map((opt, i) => {
      if (i === index) {
        return {
          ...opt,
          file: null,
          previewUrl: null,
          image: null,
          image_relative: null,
          removeImage: true,
        };
      }
      return opt;
    }));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showNotification("error", "Attribute name is required.");
      return;
    }

    const validOptions = options.filter(o => o.value.trim() !== "");

    if (type !== "text" && type !== "rich_text" && validOptions.length === 0) {
      showNotification("error", "Predefined options attributes must have at least one option value.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("type", type);
    formData.append("is_active", status === "active" ? "1" : "0");
    formData.append("is_default_specification", isDefaultSpecification ? "1" : "0");

    if (type !== "text" && type !== "rich_text") {
      const valuesMeta = validOptions.map((opt) => ({
        id: opt.id,
        value: opt.value.trim(),
        image_relative: opt.image_relative || null,
        remove_image: opt.removeImage ? 1 : 0,
        meta_title: opt.meta_title ? opt.meta_title.trim() : null,
        meta_description: opt.meta_description ? opt.meta_description.trim() : null,
        is_active: opt.is_active ?? true,
      }));

      formData.append("values", JSON.stringify(valuesMeta));

      validOptions.forEach((opt, idx) => {
        if (opt.file) {
          formData.append(`value_image_${idx}`, opt.file);
        }
      });
    }

    const response = await updateAttribute(initialAttribute.id, formData);

    setIsSubmitting(false);

    if (response.success) {
      showNotification("success", "Attribute updated successfully!");
      setTimeout(() => {
        router.push("/admin/cat/attributes");
        router.refresh();
      }, 500);
    } else {
      showNotification("error", response.message);
    }
  };

  return (
    <div className="p-4 md:p-6 w-full space-y-6 relative">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300 
          ${notification.type === 'success' 
            ? 'bg-emerald-50/90 border-emerald-100 text-emerald-800' 
            : 'bg-rose-50/90 border-rose-100 text-rose-800'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${notification.type === 'success' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
            {notification.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          </div>
          <div>
            <p className="text-sm font-semibold">{notification.type === 'success' ? 'Success' : 'Error'}</p>
            <p className="text-xs text-slate-500 mt-0.5">{notification.message}</p>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 transition-colors ml-4 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header with Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/cat/attributes">
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center gap-1.5 h-9 cursor-pointer"
            >
              <ArrowLeft size={16} />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Edit Attribute: {initialAttribute.name}</h1>
            <p className="text-xs text-slate-500">Update attribute details and preset values</p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <Link href="/admin/cat/attributes">
            <Button 
              type="button" 
              variant="ghost" 
              disabled={isSubmitting}
              className="h-10 px-5 rounded-xl border border-slate-200 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
          </Link>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-10 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/10 cursor-pointer flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Updating...
              </>
            ) : 'Update Attribute'}
          </Button>
        </div>
      </div>

      {/* Main Two-Card Layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Card: Attribute Details */}
        <div className="lg:col-span-6 xl:col-span-5">
          <Card className="overflow-hidden shadow-sm border border-slate-200/80 bg-white">
            <CardHeader className="flex flex-row items-center gap-3 py-4 px-6 bg-slate-50/50 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                <Sliders size={18} />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-800">Attribute Information</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Basic details and display configurations.</p>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-5">
              {/* Attribute Name */}
              <div className="space-y-2">
                <Label htmlFor="attribute-name" className="text-xs font-bold text-slate-500 uppercase">
                  Attribute Name <span className="text-rose-500">*</span>
                </Label>
                <Input 
                  id="attribute-name"
                  type="text" 
                  placeholder="e.g. Color, Size, Material" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="rounded-xl h-10 border-slate-200 text-sm"
                />
              </div>

              {/* Attribute Type */}
              <div className="space-y-2">
                <Label htmlFor="attribute-type" className="text-xs font-bold text-slate-500 uppercase">Input Type</Label>
                <Select 
                  id="attribute-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as "text" | "rich_text" | "select" | "multi_select")}
                  className="rounded-xl h-10 border-slate-200 text-slate-700 bg-white text-xs"
                >
                  <option value="select">Predefined list (Single option)</option>
                  <option value="multi_select">Multi-select list (Multiple options)</option>
                  <option value="text">Custom text (User types text)</option>
                  <option value="rich_text">Rich Text (User inputs formatted rich content)</option>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="attribute-status" className="text-xs font-bold text-slate-500 uppercase">Status</Label>
                <Select 
                  id="attribute-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="rounded-xl h-10 border-slate-200 text-slate-700 bg-white text-xs"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </div>

              {/* Default Specification */}
              <div className="pt-2">
                <div className="flex items-start space-x-3 p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/30 hover:bg-indigo-50/60 transition-colors">
                  <input
                    id="is-default-specification"
                    type="checkbox"
                    checked={isDefaultSpecification}
                    onChange={(e) => setIsDefaultSpecification(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer mt-0.5"
                  />
                  <Label htmlFor="is-default-specification" className="text-xs font-bold text-slate-800 cursor-pointer select-none">
                    Default Specification
                    <span className="block text-[10px] font-normal text-slate-500 mt-0.5">
                      Auto-open field in Add Product form
                    </span>
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Card: Attribute Values & Swatches */}
        <div className="lg:col-span-6 xl:col-span-7">
          <Card className="overflow-hidden shadow-sm border border-slate-200/80 bg-white flex flex-col justify-between">
            <div>
              <CardHeader className="flex flex-row items-center justify-between py-4 px-6 bg-slate-50/50 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold">
                    <Tag size={18} />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-800">Attribute Values & Swatches</CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5">Manage option values and optional image swatches.</p>
                  </div>
                </div>

                {type !== "text" && type !== "rich_text" && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {options.length} {options.length === 1 ? 'Option' : 'Options'}
                  </span>
                )}
              </CardHeader>

              <CardContent className="p-6">
                {type === "text" || type === "rich_text" ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                      <Info size={22} />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-700">No Predefined Options Required</h3>
                    <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
                      Attributes of type <span className="font-semibold text-slate-700">{type === "text" ? "Custom Text" : "Rich Text"}</span> accept direct text input per product.
                    </p>
                    <p className="text-[11px] text-slate-400 mt-3">
                      Switch input type to <span className="font-semibold text-indigo-600">Predefined list</span> or <span className="font-semibold text-indigo-600">Multi-select list</span> to add option values & swatches.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Add Option Input Row */}
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        placeholder="Type option name (e.g. Red, XL, 128GB) & press Enter"
                        value={valueInput}
                        onChange={(e) => setValueInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault();
                            handleAddOption();
                          }
                        }}
                        className="h-10 text-xs rounded-xl border-slate-200 flex-1 bg-white"
                      />
                      <Button
                        type="button"
                        onClick={handleAddOption}
                        className="h-10 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Plus size={16} />
                        Add Value
                      </Button>
                    </div>

                    {/* Options List */}
                    {options.length === 0 ? (
                      <div className="text-center py-10 rounded-xl border border-dashed border-slate-200 bg-slate-50/30">
                        <p className="text-xs font-medium text-slate-500">No option values added yet.</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Add values above to define available choices for this attribute.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {options.map((opt, index) => {
                          const displayImage = opt.previewUrl || opt.image;
                          const hasSeoData = !!(opt.meta_title?.trim() || opt.meta_description?.trim());
                          return (
                            <div 
                              key={index} 
                              className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-2.5 group"
                            >
                              <div className="flex items-center gap-3">
                                {/* Swatch Image Picker */}
                                <div className="relative flex-shrink-0">
                                  <input 
                                    type="file" 
                                    id={`opt-img-edit-${index}`}
                                    accept="image/*"
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        handleOptionImageChange(index, e.target.files[0]);
                                      }
                                    }}
                                    className="hidden"
                                  />
                                  {displayImage ? (
                                    <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-slate-200 group/img bg-white shadow-xs">
                                      <img 
                                        src={displayImage} 
                                        alt={opt.value} 
                                        className="w-full h-full object-cover" 
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveOptionImage(index)}
                                        title="Remove image"
                                        className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                                      >
                                        <X size={13} />
                                      </button>
                                    </div>
                                  ) : (
                                    <label 
                                      htmlFor={`opt-img-edit-${index}`}
                                      title="Upload optional swatch image"
                                      className="w-9 h-9 rounded-lg border border-dashed border-slate-300 bg-white hover:bg-indigo-50/50 hover:border-indigo-300 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                                    >
                                      <ImageIcon size={16} />
                                    </label>
                                  )}
                                </div>

                                {/* Option Text Input */}
                                <Input
                                  type="text"
                                  value={opt.value}
                                  placeholder="Option value"
                                  onChange={(e) => handleUpdateOptionText(index, e.target.value)}
                                  className="h-9 text-xs bg-white rounded-xl border-slate-200 flex-1"
                                />

                                {/* SEO Toggle Button */}
                                <button
                                  type="button"
                                  onClick={() => toggleSeoPanel(index)}
                                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                                    opt.showSeo 
                                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                                      : hasSeoData 
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                                  }`}
                                  title="Add optional SEO Meta Title & Meta Description"
                                >
                                  <Globe size={13} />
                                  <span>SEO</span>
                                  {hasSeoData && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5"></span>
                                  )}
                                </button>

                                {/* Delete Button */}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOption(index)}
                                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                                  title="Delete option"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>

                              {/* Expandable SEO Collapsible Panel */}
                              {opt.showSeo && (
                                <div className="mt-2 p-3 bg-white rounded-xl border border-slate-200/90 shadow-xs space-y-2.5 animate-in slide-in-from-top-2 duration-200">
                                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                                    <p className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
                                      <Globe size={13} className="text-indigo-500" /> SEO Metadata (Optional)
                                    </p>
                                    <span className="text-[10px] text-slate-400">Search Engine Meta Tags</span>
                                  </div>

                                  <div className="space-y-3">
                                    {/* Row 1: Meta Title + Status */}
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                                      <div className="md:col-span-8 space-y-1">
                                        <Label className="text-[11px] font-bold text-slate-500">Meta Title</Label>
                                        <Input 
                                          type="text" 
                                          placeholder="Meta title (e.g. Red Shade Lipstick)"
                                          value={opt.meta_title || ""}
                                          onChange={(e) => handleUpdateMetaTitle(index, e.target.value)}
                                          className="h-9 text-xs bg-slate-50/50 rounded-lg border-slate-200"
                                        />
                                      </div>
                                      <div className="md:col-span-4 space-y-1">
                                        <Label className="text-[11px] font-bold text-slate-500">Status</Label>
                                        <Select 
                                          value={opt.is_active ?? true ? "active" : "inactive"}
                                          onChange={(e) => handleUpdateOptionStatus(index, e.target.value === "active")}
                                          className="h-9 text-xs bg-slate-50/50 rounded-lg border-slate-200 text-slate-700"
                                        >
                                          <option value="active">Active</option>
                                          <option value="inactive">Inactive</option>
                                        </Select>
                                      </div>
                                    </div>

                                    {/* Row 2: Meta Description Full Width */}
                                    <div className="space-y-1 w-full">
                                      <Label className="text-[11px] font-bold text-slate-500">Meta Description</Label>
                                      <Textarea 
                                        rows={2}
                                        placeholder="Brief description for search engines..."
                                        value={opt.meta_description || ""}
                                        onChange={(e) => handleUpdateMetaDescription(index, e.target.value)}
                                        className="min-h-[65px] w-full text-xs bg-slate-50/50 rounded-lg border-slate-200 resize-y"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </div>

            {type !== "text" && type !== "rich_text" && (
              <div className="px-6 py-3.5 bg-slate-50/50 border-t border-slate-100">
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Globe size={14} className="text-slate-400 flex-shrink-0" />
                  Click SEO button next to any value to add optional Meta Title & Description for search engines.
                </p>
              </div>
            )}
          </Card>
        </div>

      </form>
    </div>
  );
}


