'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Upload, 
  Check, 
  Camera,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { useTimelineStore } from '../hooks/TimelineContext';
import { authService } from '../services/timelineService';
import { motion } from 'motion/react';

export default function AccountTab() {
  const { currentUser, updateUserProfile, uploadProfilePicture, selectProfilePicture, enableTransitions } = useTimelineStore();
  const [profileName, setProfileName] = useState(currentUser?.name || "");
  const [dragActive, setDragActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [picturesHistory, setPicturesHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchHistory = async () => {
    if (!currentUser) return;
    try {
      setIsLoadingHistory(true);
      const list = await authService.getProfilePictures();
      setPicturesHistory(list);
    } catch (err) {
      console.error("Failed to load picture history", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    setSelectedFile(null);
    setPreviewUrl(null);
  }, [currentUser?.avatar]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleUploadPreview = async () => {
    if (!selectedFile) return;
    try {
      setIsSaving(true);
      setFeedback(null);
      await uploadProfilePicture(selectedFile);
      setFeedback({ type: 'success', text: 'Avatar uploaded and updated successfully!' });
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to upload profile picture.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelPreview = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setFeedback(null);
  };

  const handleSelectHistoryPicture = async (pictureId: string) => {
    try {
      setIsSaving(true);
      setFeedback(null);
      await selectProfilePicture(pictureId);
      setFeedback({ type: 'success', text: 'Avatar updated from history successfully!' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to select profile picture.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentUser) return null;

  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', text: 'Unsupported format. Please select an image (JPG, PNG, WEBP).' });
      return;
    }

    // Limit size to 2MB
    if (file.size > 2 * 1024 * 1024) {
      setFeedback({ type: 'error', text: 'Image is too large. Choose an image under 2MB.' });
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setFeedback(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!profileName.trim()) {
      setFeedback({ type: 'error', text: 'Name cannot be blank.' });
      return;
    }

    try {
      setIsSaving(true);
      await updateUserProfile(profileName.trim());
      setFeedback({ type: 'success', text: 'Profile changes saved successfully!' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to update account name.' });
    } finally {
      setIsSaving(false);
    }
  };

  const wrapAnimation = (children: React.ReactNode) => {
    if (!enableTransitions) return children;
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    );
  };

  return wrapAnimation(
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 font-sans bg-zinc-50">
      <div className="max-w-3xl mx-auto">
        
        {/* Module Header */}
        <div className="border-b border-zinc-200 pb-5 mb-8">
          <h2 className="text-xl font-bold font-serif italic text-zinc-900 tracking-tight">Account Settings</h2>
          <p className="text-xs text-zinc-500 mt-1">Update your profile information and customize your profile photo.</p>
        </div>

        {feedback && (
          <div className={`p-4 rounded-xl border mb-6 flex items-start gap-3 transition-all ${
            feedback.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-850 text-xs font-semibold' 
              : 'bg-red-50 border-red-200 text-red-800 text-xs font-semibold'
          }`}>
            {feedback.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            )}
            <div>
              <span>{feedback.text}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* Avatar Picture Section */}
          <div className="md:col-span-1 bg-white border border-zinc-200 rounded-2xl p-6 text-center shadow-xs">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono block mb-4">Profile Photo</span>
            
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className={`relative mx-auto w-32 h-32 rounded-full cursor-pointer overflow-hidden border-2 transition-all ${
                dragActive 
                  ? 'border-zinc-900 ring-4 ring-zinc-900/10 scale-95' 
                  : 'border-zinc-200 hover:border-zinc-400 hover:ring-4 hover:ring-zinc-150'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={previewUrl || currentUser.avatar || "https://picsum.photos/seed/totok/100/100"} 
                alt={currentUser.username} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 mb-1" />
                <span className="text-[9px] font-bold uppercase font-mono tracking-wider">Change photo</span>
              </div>

              {/* Dragging Overlay */}
              {dragActive && (
                <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center text-white">
                  <Upload className="w-6 h-6 animate-bounce" />
                </div>
              )}
            </div>

            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/jpg, image/webp"
              className="hidden"
            />

            {selectedFile ? (
              <div className="mt-4 flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={handleUploadPreview}
                  disabled={isSaving}
                  className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider font-mono cursor-pointer disabled:opacity-50"
                >
                  Save Photo
                </button>
                <button
                  type="button"
                  onClick={handleCancelPreview}
                  disabled={isSaving}
                  className="px-3.5 py-1.5 border border-zinc-250 hover:bg-zinc-55 hover:text-zinc-900 text-zinc-600 rounded-lg text-[10px] font-bold uppercase tracking-wider font-mono cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={triggerFileSelect}
                disabled={isSaving}
                className="mt-4 px-3.5 py-1.5 border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:text-zinc-950 text-[10px] font-bold uppercase tracking-wider font-mono text-zinc-600 cursor-pointer disabled:opacity-50"
              >
                Upload Photo
              </button>
            )}
            <p className="text-[10px] text-zinc-400 mt-2.5 max-w-[180px] mx-auto leading-normal">
              {selectedFile ? "Click Save Photo to upload, or Cancel to discard." : "Supports PNG, JPG, or WEBP up to 2MB. Drag and drop file to upload."}
            </p>

            {/* Pictures History Gallery */}
            {picturesHistory.length > 0 && (
              <div className="mt-8 pt-6 border-t border-zinc-150 text-left">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono block mb-3">Upload History</span>
                <div className="grid grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
                  {picturesHistory.map((pic) => {
                    const isActive = pic.url === currentUser.avatar;
                    return (
                      <div
                        key={pic.id}
                        onClick={() => !isActive && !isSaving && handleSelectHistoryPicture(pic.id)}
                        className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border transition-all ${
                          isActive
                            ? 'border-zinc-900 ring-2 ring-zinc-900/10 scale-95'
                            : 'border-zinc-200 hover:border-zinc-450 hover:scale-105'
                        } ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={pic.url}
                          alt="Uploaded avatar"
                          className="w-full h-full object-cover"
                        />
                        {isActive && (
                          <div className="absolute inset-0 bg-zinc-900/10 flex items-center justify-center">
                            <div className="bg-zinc-900/80 rounded-full p-1 shadow-xs">
                              <Check className="w-3.5 h-3.5 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Form Settings Details */}
          <div className="md:col-span-2 bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono block mb-6">Profile Details</span>
            
            <form onSubmit={handleSaveChanges} className="flex flex-col gap-5">

              {/* Username (Locked) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[9.5px] font-bold text-zinc-500 uppercase font-mono tracking-wider">Username</label>
                  <span className="text-[8.5px] text-zinc-400 font-sans flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5 text-zinc-400" /> Cannot be changed
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    disabled
                    value={currentUser.username}
                    className="w-full bg-zinc-50/70 border border-zinc-200 text-zinc-400 rounded-lg px-3.5 py-2 pl-9 text-xs font-semibold select-none cursor-not-allowed"
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-350" />
                </div>
                <span className="text-[9.5px] text-zinc-400 mt-1 block leading-normal leading-relaxed">
                  Usernames are unique identifiers and cannot be updated.
                </span>
              </div>

              {/* Email (Locked) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[9.5px] font-bold text-zinc-500 uppercase font-mono tracking-wider">Email Address</label>
                  <span className="text-[8.5px] text-zinc-400 font-sans flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5 text-zinc-400" /> Cannot be changed
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="email"
                    disabled
                    value={currentUser.email}
                    className="w-full bg-zinc-50/70 border border-zinc-200 text-zinc-400 rounded-lg px-3.5 py-2 pl-9 text-xs font-semibold select-none cursor-not-allowed"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-350" />
                </div>
                <span className="text-[9.5px] text-zinc-400 mt-1 block leading-normal leading-relaxed">
                  Your registered email address cannot be changed.
                </span>
              </div>

              {/* Full Name (Editable) */}
              <div>
                <label className="block text-[9.5px] font-bold text-zinc-500 uppercase font-mono tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Totok Michael"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-white border border-zinc-250 rounded-lg px-3.5 py-2 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all font-medium"
                />
                <span className="text-[9.5px] text-zinc-400 mt-1 block leading-relaxed">
                  Enter your display name as you would like it to appear in the application.
                </span>
              </div>

              <div className="border-t border-zinc-150 pt-5 mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving || !profileName.trim() || profileName === currentUser.name}
                  className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-850 disabled:bg-zinc-150 disabled:text-zinc-400 text-white rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>

            </form>

          </div>

        </div>

      </div>
    </div>
  );
}
