"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileVideo,
  X,
  Play,
  CheckCircle2,
  AlertCircle,
  AudioWaveform,
  Check,
  ChevronRight,
  Plus,
  FolderOpen,
  Clock,
  Layers,
  HardDrive,
  FileAudio,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import { pipelineApi, studioAssetsApi, mediaUrls } from "@/lib/api";
import {
  SUPPORTED_LANGUAGES,
  PipelineTaskResult,
  PipelineStatusType,
} from "@/types/api";
import { PipelineTracker } from "@/components/PipelineTracker";
import { VideoComparisonPlayer } from "@/components/VideoComparisonPlayer";

// Minimalist Studio Clapperboard Icon
const StudioConsoleIcon = () => (
  <svg
    className="w-3.5 h-3.5 text-indigo-600"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 11v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8H4Z" />
    <path d="m4 11 3-7h4l-3 7" />
    <path d="m11 4 3 7" />
    <path d="m15 4 3 7" />
  </svg>
);

// Bespoke Studio Video Slate Icon
const StudioVideoSlateIcon = () => (
  <svg
    className="w-6 h-6 text-indigo-300"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3 9h18" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 4l-2 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M14 4l-2 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="12" cy="15" r="2.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export default function StudioPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { success, error, info } = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<string>("Urdu");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [recentAssets, setRecentAssets] = useState<string[]>([]);

  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<PipelineStatusType | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>("");
  const [taskResult, setTaskResult] = useState<PipelineTaskResult | null>(null);
  const [taskError, setTaskError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (localVideoUrl) URL.revokeObjectURL(localVideoUrl);
    };
  }, [localVideoUrl]);

  // Load existing server assets
  useEffect(() => {
    if (isAuthenticated) {
      studioAssetsApi
        .listUploadFiles()
        .then((res) => {
          if (res.files) setRecentAssets(res.files.slice(0, 4));
        })
        .catch(() => { });
    }
  }, [isAuthenticated]);

  // Celery Polling
  useEffect(() => {
    if (!taskId || taskStatus === "SUCCESS" || taskStatus === "FAILURE") {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const data = await pipelineApi.getTaskStatus(taskId);
        setTaskStatus(data.status);

        if (data.status === "PROCESSING") {
          setProgressMessage(data.progress || "Processing video pipeline...");
        } else if (data.status === "SUCCESS") {
          setProgressMessage("Dubbing Complete! Final dubbed video is ready.");
          if (data.result) {
            setTaskResult(data.result);
          }
          success("Pipeline Finished", "Dubbed video rendered and ready for playback!");
          clearInterval(interval);
        } else if (data.status === "FAILURE") {
          setTaskError(data.error || "Dubbing process encountered an error.");
          error("Pipeline Error", "Dubbing task interrupted. Review diagnostic report.");
          clearInterval(interval);
        }
      } catch (err: unknown) {
        console.error("Task status polling error:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [taskId, taskStatus, success, error]);

  const handleFile = (file: File) => {
    const validExtensions = ["mp4", "mov", "avi", "mkv", "webm"];
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !validExtensions.includes(ext)) {
      error("Invalid File Format", "Please upload a video file (.mp4, .mov, .avi, .mkv).");
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      error("File Too Large", "Maximum supported video file size is 500MB.");
      return;
    }

    if (localVideoUrl) URL.revokeObjectURL(localVideoUrl);
    const objectUrl = URL.createObjectURL(file);
    setLocalVideoUrl(objectUrl);
    setSelectedFile(file);

    setTaskId(null);
    setTaskStatus(null);
    setTaskResult(null);
    setTaskError(null);
    setProgressMessage("");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleStartPipeline = async () => {
    if (!isAuthenticated) {
      info("Authentication Required", "Please sign in to start dubbing.");
      router.push("/login");
      return;
    }

    if (!selectedFile) {
      error("No File Selected", "Please select a master video file first.");
      return;
    }

    setIsSubmitting(true);
    setTaskError(null);
    try {
      const res = await pipelineApi.start(selectedFile, targetLanguage);
      setTaskId(res.task_id);
      setTaskStatus("PENDING");
      setProgressMessage("Task submitted. Initializing pipeline workers...");
      info("Pipeline Started", `Job ID: ${res.task_id.slice(0, 8)}...`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to start pipeline.";
      error("Submission Error", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (localVideoUrl) URL.revokeObjectURL(localVideoUrl);
    setSelectedFile(null);
    setLocalVideoUrl(null);
    setTaskId(null);
    setTaskStatus(null);
    setTaskResult(null);
    setTaskError(null);
    setProgressMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
      {/* Studio Header Ribbon */}
      <div className="text-center pt-2 pb-1 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-sm mb-3">
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 max-w-3xl">
          Multi-Language{" "}
          <span className="text-indigo-600">Video Dubbing</span>
        </h1>

        <p className="text-sm text-slate-500 mt-2 max-w-xl font-normal leading-relaxed">
          Audio extraction, contextual dialogue translation, and synchronized voice synthesis.
        </p>
      </div>

      {/* Main Studio Frame */}
      <div className="w-full rounded-2xl bg-white border border-slate-200/90 shadow-window p-2 sm:p-2.5 overflow-hidden">
        {/* Window Chrome Header */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
        </div>

        {/* Embedded Split Studio */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
          {/* Left Studio Sidebar */}
          <div className="lg:col-span-4 p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-slate-100 bg-slate-50/60 flex flex-col justify-between gap-6">
            <div className="space-y-6">
              <button
                onClick={handleReset}
                className="w-full py-2.5 px-4 rounded-xl bg-[#140F35] hover:bg-[#221B52] text-white font-bold text-xs tracking-tight flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4 text-indigo-300" strokeWidth={2} />
                <span>New Dubbing Project</span>
              </button>

              {/* Target Language Selection */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Target Dialect
                  </span>
                  <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-semibold">
                    Studio Voice
                  </span>
                </div>

                <div className="space-y-2">
                  {SUPPORTED_LANGUAGES.map((lang) => {
                    const isSelected = targetLanguage === lang.id;
                    return (
                      <button
                        key={lang.id}
                        type="button"
                        onClick={() => setTargetLanguage(lang.id)}
                        className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${isSelected
                          ? "bg-white border-indigo-600 shadow-sm ring-1 ring-indigo-500/10"
                          : "bg-white/70 hover:bg-white border-slate-200/80 hover:border-slate-300"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{lang.flag}</span>
                          <div>
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{lang.name}</span>
                              <span className="text-slate-400 font-normal">
                                ({lang.nativeName})
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                              {lang.description}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* User Session Footer */}
            <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                  {user ? user.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {user || "Studio Guest"}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {isAuthenticated ? "Authenticated Session" : "Guest Mode"}
                  </div>
                </div>
              </div>

              {!isAuthenticated && (
                <Link
                  href="/login"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>

          {/* Right Studio Canvas */}
          <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-center">
            {taskId ? (
              <div className="space-y-6">
                <PipelineTracker
                  taskId={taskId}
                  status={taskStatus || "PENDING"}
                  progressMessage={progressMessage}
                  errorMessage={taskError || undefined}
                  targetLanguage={targetLanguage}
                  onRetry={handleStartPipeline}
                />

                {taskStatus === "SUCCESS" && (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" strokeWidth={1.5} />
                        <h3 className="text-sm font-bold text-slate-900">
                          Master Comparison & Export Workspace
                        </h3>
                      </div>
                      <button
                        onClick={handleReset}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                      >
                        Dub Another Video
                      </button>
                    </div>

                    <VideoComparisonPlayer
                      originalSrc={
                        localVideoUrl ||
                        mediaUrls.uploadedVideo(
                          taskResult?.original_video || selectedFile?.name || ""
                        )
                      }
                      dubbedSrc={
                        taskResult?.final_video_file
                          ? mediaUrls.downloadPipelineVideo(
                            taskResult.final_video_file
                          )
                          : ""
                      }
                      originalLabel="Master Track"
                      dubbedLabel={`Dubbed Track (${targetLanguage})`}
                      downloadUrl={
                        taskResult?.final_video_file
                          ? pipelineApi.getDownloadUrl(
                            taskResult.final_video_file
                          )
                          : undefined
                      }
                      downloadFilename={
                        taskResult?.final_video_file || "dubbed_video.mp4"
                      }
                    />
                  </div>
                )}
              </div>
            ) : (
              /* Idle Studio Video Ingestion Canvas */
              <div className="flex flex-col items-center text-center max-w-xl mx-auto py-2">
                {/* Media Ingestion Header */}
                <div className="w-12 h-12 rounded-xl bg-[#140F35] text-white flex items-center justify-center mb-4 shadow-sm ring-1 ring-white/10">
                  <StudioVideoSlateIcon />
                </div>

                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Master Video Ingestion
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-md">
                  Upload raw video footage to execute automated audio extraction, dialogue transcription, contextual translation, and voice synthesis.
                </p>

                {/* Drag and Drop Container */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full mt-6 rounded-2xl border-2 border-dashed p-6 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center ${isDragging
                    ? "border-indigo-600 bg-indigo-50/50 scale-[0.99]"
                    : selectedFile
                      ? "border-emerald-500 bg-emerald-50/20"
                      : "border-slate-300 hover:border-slate-400 bg-slate-50/60 hover:bg-slate-50"
                    }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*,.mp4,.mov,.avi,.mkv,.webm"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFile(e.target.files[0]);
                      }
                    }}
                  />

                  {selectedFile ? (
                    <div className="w-full flex flex-col items-center gap-3">
                      {localVideoUrl && (
                        <div className="w-full max-w-sm aspect-video rounded-xl overflow-hidden bg-black shadow-md">
                          <video
                            src={localVideoUrl}
                            controls
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between w-full max-w-sm p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2.5 truncate">
                          <FileVideo className="w-5 h-5 text-indigo-600 shrink-0" strokeWidth={1.75} />
                          <div className="text-left truncate">
                            <div className="text-xs font-bold text-slate-900 truncate">
                              {selectedFile.name}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400">
                              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReset();
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        >
                          <X className="w-4 h-4" strokeWidth={1.75} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2.5">
                      <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center shadow-sm">
                        <Upload className="w-5 h-5" strokeWidth={1.75} />
                      </div>
                      <span className="text-xs font-bold text-slate-800">
                        Drag and drop master video footage here
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        MP4, MOV, MKV, AVI (Max 500MB)
                      </span>
                      <button
                        type="button"
                        className="mt-1 px-3 py-1 rounded-md bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm"
                      >
                        Select from Computer
                      </button>
                    </div>
                  )}
                </div>

                {/* Primary Action Button */}
                <button
                  type="button"
                  disabled={!selectedFile || isSubmitting}
                  onClick={handleStartPipeline}
                  className="w-full max-w-sm mt-5 py-3 px-6 rounded-xl bg-[#140F35] hover:bg-[#221B52] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>
                    {isSubmitting
                      ? "Assigning Cloud Workers..."
                      : `Execute Dubbing (${targetLanguage})`}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Studio Asset History Deck (Inspired by reference sidebar/bottom shelf) */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <HardDrive className="w-4 h-4 text-slate-600" strokeWidth={1.5} />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Studio Assets & Recent Media
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Storage Engine: Active
          </span>
        </div>

        {recentAssets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {recentAssets.map((fileName, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <FileVideo className="w-4 h-4 text-indigo-600 shrink-0" strokeWidth={1.5} />
                  <span className="text-xs font-medium text-slate-800 truncate">
                    {fileName}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-white border border-slate-200 shrink-0 ml-2">
                  Stored
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-400 p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <span>No previous session videos found in studio storage. Upload a video above to begin.</span>
            <span className="text-[11px] font-mono text-slate-400">Ready for Ingestion</span>
          </div>
        )}
      </div>
    </div>
  );
}
