"use client";

import React, { useState, useRef } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Columns,
  Square,
  Download,
  RotateCcw,
  Check,
  Film,
  AudioWaveform,
} from "lucide-react";

interface VideoComparisonPlayerProps {
  originalSrc: string;
  dubbedSrc: string;
  originalLabel?: string;
  dubbedLabel?: string;
  downloadUrl?: string;
  downloadFilename?: string;
}

export const VideoComparisonPlayer: React.FC<VideoComparisonPlayerProps> = ({
  originalSrc,
  dubbedSrc,
  originalLabel = "Master Video",
  dubbedLabel = "Dubbed Video",
  downloadUrl,
  downloadFilename = "vocalshift_dubbed.mp4",
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"sideBySide" | "toggle">("sideBySide");
  const [activeToggle, setActiveToggle] = useState<"original" | "dubbed">("dubbed");
  const [activeAudio, setActiveAudio] = useState<"original" | "dubbed">("dubbed");
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const originalRef = useRef<HTMLVideoElement>(null);
  const dubbedRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const togglePlay = () => {
    if (isPlaying) {
      originalRef.current?.pause();
      dubbedRef.current?.pause();
      setIsPlaying(false);
    } else {
      originalRef.current?.play();
      dubbedRef.current?.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const time = e.currentTarget.currentTime;
    setCurrentTime(time);
    if (e.currentTarget.duration && !isNaN(e.currentTarget.duration)) {
      setDuration(e.currentTarget.duration);
    }

    const targetVideo =
      e.currentTarget === originalRef.current
        ? dubbedRef.current
        : originalRef.current;

    if (targetVideo && Math.abs(targetVideo.currentTime - time) > 0.15) {
      targetVideo.currentTime = time;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (originalRef.current) originalRef.current.currentTime = newTime;
    if (dubbedRef.current) dubbedRef.current.currentTime = newTime;
  };

  const handleAudioSwitch = (track: "original" | "dubbed") => {
    setActiveAudio(track);
    if (originalRef.current)
      originalRef.current.muted = track !== "original" || isMuted;
    if (dubbedRef.current)
      dubbedRef.current.muted = track !== "dubbed" || isMuted;
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (originalRef.current)
      originalRef.current.muted = nextMuted || activeAudio !== "original";
    if (dubbedRef.current)
      dubbedRef.current.muted = nextMuted || activeAudio !== "dubbed";
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full rounded-2xl bg-white border border-slate-200/90 shadow-window overflow-hidden flex flex-col"
    >
      {/* Studio Header Ribbon */}
      <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-800 shadow-sm font-semibold">
            <Film className="w-3.5 h-3.5 text-indigo-600" strokeWidth={1.5} />
            <span>Dual-Track Synchronized Preview</span>
          </div>

          <span className="text-slate-400 font-mono text-xs hidden sm:inline">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* View Mode & Download Action */}
        <div className="flex items-center gap-2.5">
          {/* Mode Switcher */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-200/70 text-xs">
            <button
              onClick={() => setViewMode("sideBySide")}
              className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "sideBySide"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Columns className="w-3 h-3" strokeWidth={1.75} />
              Side-by-Side
            </button>
            <button
              onClick={() => setViewMode("toggle")}
              className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "toggle"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Square className="w-3 h-3" strokeWidth={1.75} />
              A/B Toggle
            </button>
          </div>

          {/* Toggle switcher */}
          {viewMode === "toggle" && (
            <div className="flex items-center p-0.5 rounded-lg bg-slate-200/70 text-xs">
              <button
                onClick={() => {
                  setActiveToggle("original");
                  handleAudioSwitch("original");
                }}
                className={`px-2 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  activeToggle === "original"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Master
              </button>
              <button
                onClick={() => {
                  setActiveToggle("dubbed");
                  handleAudioSwitch("dubbed");
                }}
                className={`px-2 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  activeToggle === "dubbed"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Dubbed
              </button>
            </div>
          )}

          {/* Download */}
          {downloadUrl && (
            <a
              href={downloadUrl}
              download={downloadFilename}
              className="px-3.5 py-1.5 rounded-lg bg-[#140F35] hover:bg-[#221B52] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Export Video</span>
            </a>
          )}
        </div>
      </div>

      {/* Video Viewport Area */}
      <div className="relative bg-slate-950 p-3 min-h-[320px] flex items-center justify-center">
        {viewMode === "sideBySide" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full h-full">
            {/* Original Video Canvas */}
            <div className="relative rounded-xl overflow-hidden bg-black/90 border border-white/10 aspect-video flex items-center justify-center shadow-lg">
              <video
                ref={originalRef}
                src={originalSrc}
                onTimeUpdate={handleTimeUpdate}
                muted={activeAudio !== "original" || isMuted}
                playsInline
                className="w-full h-full object-contain"
              />
              <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-slate-200">
                {originalLabel}
              </div>
              <button
                onClick={() => handleAudioSwitch("original")}
                className={`absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md transition-all cursor-pointer ${
                  activeAudio === "original"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-black/60 text-slate-300 hover:text-white border border-white/10"
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                {activeAudio === "original" ? "Track: Playing" : "Listen Master"}
              </button>
            </div>

            {/* Dubbed Video Canvas */}
            <div className="relative rounded-xl overflow-hidden bg-black/90 border border-indigo-500/30 aspect-video flex items-center justify-center shadow-lg">
              <video
                ref={dubbedRef}
                src={dubbedSrc}
                onTimeUpdate={handleTimeUpdate}
                muted={activeAudio !== "dubbed" || isMuted}
                playsInline
                className="w-full h-full object-contain"
              />
              <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-indigo-900/80 backdrop-blur-md border border-indigo-400/30 text-[10px] font-mono text-indigo-100 flex items-center gap-1.5 shadow-sm">
                <AudioWaveform className="w-3 h-3 text-indigo-300" strokeWidth={1.75} />
                <span>{dubbedLabel}</span>
              </div>
              <button
                onClick={() => handleAudioSwitch("dubbed")}
                className={`absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md transition-all cursor-pointer ${
                  activeAudio === "dubbed"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-black/60 text-slate-300 hover:text-white border border-white/10"
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                {activeAudio === "dubbed" ? "Track: Playing" : "Listen Dubbed"}
              </button>
            </div>
          </div>
        ) : (
          /* Single Toggled Player */
          <div className="relative w-full max-w-4xl aspect-video rounded-xl overflow-hidden bg-black border border-white/10 flex items-center justify-center shadow-xl">
            <video
              ref={originalRef}
              src={originalSrc}
              onTimeUpdate={handleTimeUpdate}
              muted={activeAudio !== "original" || isMuted}
              playsInline
              className={`w-full h-full object-contain ${
                activeToggle === "original" ? "block" : "hidden"
              }`}
            />
            <video
              ref={dubbedRef}
              src={dubbedSrc}
              onTimeUpdate={handleTimeUpdate}
              muted={activeAudio !== "dubbed" || isMuted}
              playsInline
              className={`w-full h-full object-contain ${
                activeToggle === "dubbed" ? "block" : "hidden"
              }`}
            />
            <div className="absolute top-3 left-3 px-3 py-1 rounded-md bg-black/80 backdrop-blur-md border border-white/15 text-xs font-mono text-white">
              {activeToggle === "original" ? originalLabel : dubbedLabel}
            </div>
          </div>
        )}
      </div>

      {/* Control Transport Strip */}
      <div className="px-5 py-3.5 bg-white flex flex-col gap-2.5">
        {/* Scrubber Timeline */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-medium text-slate-500 w-11 text-right">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
          />
          <span className="text-xs font-mono font-medium text-slate-400 w-11">
            {formatTime(duration)}
          </span>
        </div>

        {/* Transport Buttons Row */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-2.5">
            <button
              onClick={togglePlay}
              className="w-8 h-8 rounded-lg bg-[#140F35] hover:bg-[#211A4F] text-white flex items-center justify-center transition-all shadow-sm cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-white" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
              )}
            </button>

            <button
              onClick={() => {
                if (originalRef.current) originalRef.current.currentTime = 0;
                if (dubbedRef.current) dubbedRef.current.currentTime = 0;
                setCurrentTime(0);
              }}
              title="Restart"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>

            <div className="h-4 w-px bg-slate-200 mx-1" />

            <button
              onClick={toggleMute}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-500" strokeWidth={1.75} />
              ) : (
                <Volume2 className="w-3.5 h-3.5" strokeWidth={1.75} />
              )}
            </button>

            {/* Audio Track Selector */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-100 text-xs font-medium">
              <button
                onClick={() => handleAudioSwitch("original")}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  activeAudio === "original"
                    ? "bg-white text-slate-900 shadow-sm font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Master Track
              </button>
              <button
                onClick={() => handleAudioSwitch("dubbed")}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  activeAudio === "dubbed"
                    ? "bg-indigo-600 text-white shadow-sm font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Dubbed Track
              </button>
            </div>
          </div>

          <button
            onClick={handleFullscreen}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );
};
