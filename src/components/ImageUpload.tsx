import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, FileText } from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'react-hot-toast';

interface ImageUploadProps {
  onImageSelect: (base64: string) => void;
  onRemove: () => void;
  value?: string;
}

export default function ImageUpload({ onImageSelect, onRemove, value }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPEG or PNG)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size too large. Max 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      // Image converted to base64 for n8n webhook transport
      onImageSelect(base64);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">Product Image</label>
      
      {!value ? (
        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all",
            isDragging ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary hover:bg-gray-50"
          )}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
            <Upload className="w-6 h-6" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-900">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
          </div>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-gray-100 group">
          <img src={value} alt="Preview" className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button 
              onClick={onRemove}
              className="p-2 bg-white rounded-full text-red-500 hover:scale-110 transition-transform"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded text-[10px] text-white backdrop-blur-sm">
            Preview
          </div>
        </div>
      )}
    </div>
  );
}
