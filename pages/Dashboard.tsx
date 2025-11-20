import React, { useState, useRef } from 'react';
import { useGlobalState } from '../context/GlobalStateContext';
import { generateImageWithGemini, editImageWithGemini } from '../services/geminiService';
import { Download, Trash2, Sparkles, Wand2, Upload, Image as ImageIcon, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const { deductCredit, addImageToGallery, userImages, currentUser } = useGlobalState();
  const [mode, setMode] = useState<'generate' | 'edit'>('generate');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt.");
      return;
    }
    
    if (mode === 'edit' && !selectedFile) {
        toast.error("Please upload an image to edit.");
        return;
    }

    if (!deductCredit()) return; // Stops if no credits

    setIsGenerating(true);
    const toastId = toast.loading(mode === 'generate' ? "Dreaming up your image..." : "Applying magic edits...");

    try {
      let imageUrl = '';
      
      if (mode === 'generate') {
        imageUrl = await generateImageWithGemini(prompt);
      } else {
        // Edit mode
        if (!selectedFile) throw new Error("No file selected");
        const base64 = await convertFileToBase64(selectedFile);
        imageUrl = await editImageWithGemini(base64, prompt);
      }

      addImageToGallery(imageUrl, prompt, mode);
      toast.success("Masterpiece created!", { id: toastId });
      setPrompt('');
      if (mode === 'edit') {
        setSelectedFile(null);
        setPreviewUrl(null);
        if(fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (error: any) {
      toast.error(error.message || "Generation failed. Try again.", { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Studio</h2>
          <p className="text-slate-400 mt-1">Create or edit images with Gemini 2.5 Flash</p>
        </div>
        
        {/* Mode Toggle */}
        <div className="flex bg-dark-card p-1 rounded-lg border border-dark-border">
          <button
            onClick={() => setMode('generate')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              mode === 'generate' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles size={16} /> Generate
          </button>
          <button
            onClick={() => setMode('edit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              mode === 'edit' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wand2 size={16} /> Edit Image
          </button>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
            {mode === 'edit' && (
                <div className="mb-6 p-6 border-2 border-dashed border-slate-700 rounded-xl bg-slate-900/50 flex flex-col items-center justify-center text-center transition-colors hover:border-brand-500/50 hover:bg-slate-900/80">
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                        id="image-upload"
                    />
                    
                    {previewUrl ? (
                        <div className="relative group">
                            <img src={previewUrl} alt="Preview" className="h-48 object-contain rounded-lg shadow-lg" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                                <label htmlFor="image-upload" className="cursor-pointer text-white font-medium bg-brand-600 px-4 py-2 rounded-lg hover:bg-brand-700 transition-colors">Change Image</label>
                            </div>
                        </div>
                    ) : (
                        <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-3 py-4">
                             <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-brand-400">
                                <Upload size={20} />
                             </div>
                             <div>
                                 <p className="text-white font-medium">Upload Source Image</p>
                                 <p className="text-slate-500 text-sm">PNG, JPG up to 5MB</p>
                             </div>
                        </label>
                    )}
                </div>
            )}

          <div className="flex flex-col gap-4">
            <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                    {mode === 'generate' ? 'Describe your imagination' : 'Instructions for editing (e.g., "Add a retro filter", "Make it snow")'}
                </label>
                <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={mode === 'generate' ? "A futuristic city on Mars with neon lights..." : "Change the background to a beach..."}
                className="w-full bg-slate-900/80 border border-dark-border rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none h-32"
                />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || (mode === 'edit' && !selectedFile)}
                className={`
                  flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg shadow-brand-600/20
                  transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                  ${isGenerating ? 'bg-slate-700 cursor-wait' : 'bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400'}
                `}
              >
                {isGenerating ? (
                    <>
                        <RefreshCw className="animate-spin" size={20} /> Generating...
                    </>
                ) : (
                    <>
                        <Sparkles size={20} /> {mode === 'generate' ? 'Generate Art' : 'Edit Image'} <span className="ml-2 opacity-70 text-xs bg-black/20 px-2 py-0.5 rounded-full">1 Credit</span>
                    </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Decorative background blobl */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl -z-0 pointer-events-none"></div>
      </div>

      {/* Gallery */}
      <div>
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <ImageIcon size={20} className="text-brand-400"/> Session Gallery
        </h3>
        
        {userImages.length === 0 ? (
          <div className="text-center py-12 bg-dark-card/50 rounded-2xl border border-dashed border-dark-border">
            <p className="text-slate-500">No images generated yet. Start creating!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userImages.map((img) => (
              <div key={img.id} className="group relative rounded-xl overflow-hidden bg-dark-card border border-dark-border shadow-lg transition-all hover:shadow-brand-900/20 hover:border-brand-500/50">
                <img src={img.url} alt={img.prompt} className="w-full h-64 object-cover" />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                  <p className="text-white text-sm line-clamp-2 mb-3 font-medium">{img.prompt}</p>
                  <div className="flex gap-2">
                    <a 
                      href={img.url} 
                      download={`rex-sumon-ai-${img.id}.png`}
                      className="flex-1 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <Download size={16} /> Download
                    </a>
                    {/* Delete functionality could be added here, effectively just removing from state */}
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className="text-[10px] uppercase font-bold bg-black/50 text-white px-2 py-1 rounded border border-white/10">
                        {img.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;