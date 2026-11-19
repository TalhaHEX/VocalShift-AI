"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  Clock,
  Copy,
  Check,
  RefreshCw,
  AudioWaveform,
  Mic,
  Languages,
  Volume2,
  Film,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { PipelineStatusType } from "@/types/api";

interface PipelineTrackerProps {
  taskId: string;
  status: PipelineStatusType;
  progressMessage?: string;
  errorMessage?: string;
  targetLanguage: string;
  onRetry?: () => void;
}

interface StageDefinition {
  step: number;
  label: string;
  engine: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  description: string;
}

const STAGES: StageDefinition[] = [
  {
    step: 1,
    label: "Audio Separation",
    engine: "MP3 48kHz",
    icon: AudioWaveform,
    description: "Extracts primary dialogue stream from source container",
  },
  {
    step: 2,
    label: "Speech Recognition",
    engine: "Time-Coded ASR",
    icon: Mic,
    description: "Transcribes dialogue with sentence-level timestamps",
  },
  {
    step: 3,
    label: "Dialogue Translation",
    engine: "Semantic Script",
    icon: Languages,
    description: "Translates dialogue matching target dialect cadence",
  },
  {
    step: 4,
    label: "Speech Synthesis",
    engine: "Studio Voice",
    icon: Volume2,
    description: "Synthesizes expressive voice matching target language",
  },
  {
    step: 5,
    label: "Video Multiplexing",
    engine: "H.264 / AAC",
    icon: Film,
    description: "Multiplexes dubbed audio into final video container",
  },
];

export const PipelineTracker: React.FC<PipelineTrackerProps> = ({
  taskId,
  status,
  progressMessage = "",
  errorMessage,
  targetLanguage,
  onRetry,
}) => {
  const [copied, setCopied] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showDiagnostic, setShowDiagnostic] = useState(false);

  let activeStep = 0;
  if (status === "SUCCESS") {
    activeStep = 6;
  } else if (status === "PROCESSING") {
    const match = progressMessage.match(/^([1-5])\/5/);
    if (match) {
      activeStep = parseInt(match[1], 10);
    } else {
      activeStep = 1;
    }
  } else if (status === "PENDING") {
    activeStep = 0;
  }

  useEffect(() => {
    if (status === "SUCCESS" || status === "FAILURE") return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  const copyTaskId = () => {
    navigator.clipboard.writeText(taskId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatElapsed = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const progressPercent =
    status === "SUCCESS"
      ? 100
      : status === "FAILURE"
      ? Math.max(10, (activeStep - 1) * 20)
      : Math.min(100, Math.max(5, (activeStep / 5) * 100));

  const sanitizeErrorMessage = (rawError?: string) => {
    if (!rawError) return "An unexpected error occurred during processing. Please try again.";
    if (
      rawError.includes("ffmpeg") ||
      rawError.includes("Error opening input") ||
      rawError.includes("No such file") ||
      rawError.includes("MoviePy")
    ) {
      return "The studio pipeline encountered an issue reading the video stream. Please ensure the media file is uncorrupted and contains a valid audio track.";
    }
    if (rawError.includes("GEMINI_API_KEY") || rawError.includes("API key")) {
      return "The translation service is currently initializing. Please check configuration and try again.";
    }
    return rawError;
  };

  return (
    <div className="w-full rounded-2xl bg-white border border-slate-200/90 p-6 shadow-window transition-all">
      {/* Tracker Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-3 h-3 rounded-full ${
              status === "SUCCESS"
                ? "bg-emerald-500 shadow-[0_0_10px_#10B981]"
                : status === "FAILURE"
                ? "bg-rose-500 shadow-[0_0_10px_#F43F5E]"
                : "bg-indigo-600 shadow-[0_0_10px_#6366F1] animate-pulse"
            }`}
          />
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                {status === "SUCCESS"
                  ? "Dubbing Completed Successfully"
                  : status === "FAILURE"
                  ? "Processing Interrupted"
                  : status === "PENDING"
                  ? "Job Queued for Processing"
                  : "Automated Studio Pipeline in Progress"}
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                {targetLanguage}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-normal">
              {progressMessage ||
                (status === "PENDING"
                  ? "Allocating dedicated cloud studio compute..."
                  : "Executing pipeline stages...")}
            </p>
          </div>
        </div>

        {/* Runtime and Job ID Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600">
            <Clock className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.75} />
            <span>{formatElapsed(elapsedSeconds)}</span>
          </div>

          <button
            onClick={copyTaskId}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 transition-colors cursor-pointer"
            title="Copy Job ID"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.75} />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.75} />
            )}
            <span className="text-slate-400 text-[10px]">ID:</span>
            <span className="max-w-[70px] truncate">{taskId}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="my-5">
        <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
          <span>Overall Progress</span>
          <span className="text-indigo-600 font-bold">{Math.round(progressPercent)}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              status === "SUCCESS"
                ? "bg-emerald-500"
                : status === "FAILURE"
                ? "bg-rose-500"
                : "bg-indigo-600"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Error Card */}
      {status === "FAILURE" && (
        <div className="mb-5 p-4 rounded-xl border border-rose-200 bg-rose-50/70 text-xs text-rose-800 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" strokeWidth={1.75} />
              <div>
                <span className="font-bold block text-rose-900 text-xs">
                  Processing Interrupted
                </span>
                <p className="text-xs text-rose-700 mt-0.5 leading-relaxed font-normal">
                  {sanitizeErrorMessage(errorMessage)}
                </p>
              </div>
            </div>

            {onRetry && (
              <button
                onClick={onRetry}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" strokeWidth={1.75} />
                Retry
              </button>
            )}
          </div>

          {errorMessage && (
            <div className="pt-2 border-t border-rose-200/60">
              <button
                onClick={() => setShowDiagnostic(!showDiagnostic)}
                className="text-[11px] font-medium text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Diagnostic Report</span>
                {showDiagnostic ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>

              {showDiagnostic && (
                <div className="mt-2 p-3 rounded-lg bg-rose-900 text-rose-100 font-mono text-[10px] break-words leading-relaxed max-h-36 overflow-y-auto">
                  {errorMessage}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 5-Stage Stepper */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-1">
        {STAGES.map((s) => {
          const isDone = activeStep > s.step || status === "SUCCESS";
          const isCurrent = activeStep === s.step && status === "PROCESSING";
          const isPending = activeStep < s.step && status !== "SUCCESS";
          const isFailedHere = status === "FAILURE" && activeStep === s.step;
          const Icon = s.icon;

          return (
            <div
              key={s.step}
              className={`relative rounded-xl p-3.5 border transition-all duration-200 flex flex-col justify-between ${
                isDone
                  ? "border-emerald-200 bg-emerald-50/20"
                  : isCurrent
                  ? "border-indigo-300 bg-indigo-50/30 ring-1 ring-indigo-500/10"
                  : isFailedHere
                  ? "border-rose-300 bg-rose-50/40"
                  : "border-slate-100 bg-slate-50/50 opacity-60"
              }`}
            >
              {/* Step Badge */}
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400">
                  0{s.step}
                </span>
                <div>
                  {isDone && (
                    <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3" strokeWidth={2} />
                    </div>
                  )}
                  {isCurrent && (
                    <div className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center animate-spin">
                      <Loader2 className="w-3 h-3" strokeWidth={2} />
                    </div>
                  )}
                  {isFailedHere && (
                    <div className="w-4 h-4 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                      <AlertCircle className="w-3 h-3" strokeWidth={2} />
                    </div>
                  )}
                  {isPending && (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-200 bg-white" />
                  )}
                </div>
              </div>

              {/* Title & Engine */}
              <div className="mb-1.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3.5 h-3.5 text-slate-700" strokeWidth={1.75} />
                  <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                    {s.label}
                  </h4>
                </div>
                <span className="text-[9px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  {s.engine}
                </span>
              </div>

              <p className="text-[11px] text-slate-500 leading-snug font-normal">
                {s.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
