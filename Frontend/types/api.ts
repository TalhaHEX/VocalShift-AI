// VocalShift-AI API Type Definitions

export interface User {
  username: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface ProfileResponse {
  message: string;
}

export interface PipelineStartResponse {
  status: string;
  task_id: string;
  message: string;
}

export interface PipelineTaskResult {
  status: "COMPLETED" | string;
  original_video: string;
  final_video_file: string;
  final_video_path: string;
  target_language: string;
}

export type PipelineStatusType = "PENDING" | "PROCESSING" | "SUCCESS" | "FAILURE";

export interface PipelineTaskStatusResponse {
  task_id: string;
  status: PipelineStatusType;
  progress?: string;
  result?: PipelineTaskResult;
  error?: string;
}

// Granular Workbench Types
export interface UploadVideoResponse {
  Success: string;
}

export interface ListUploadFilesResponse {
  files: string[];
}

export interface ExtractAudioResponse {
  status: string;
  audio_file: string;
  Error?: string;
}

export interface TranscribeAudioResponse {
  status: string;
  transcript_file: string;
  transcription: string;
}

export interface TranslateRequest {
  transcript_file: string;
  target_language: string;
}

export interface TranslateResponse {
  status: string;
  translated_file: string;
  translation_preview: string;
}

export interface GenerateAudioResponse {
  status: string;
  audio_file: string;
}

export interface ReplaceAudioRequest {
  video_file: string;
  audio_file: string;
  output_file?: string;
}

export interface ReplaceAudioResponse {
  status: string;
  output_file: string;
  output_path: string;
}

export interface AudioListResponse {
  "Audio Files": string[];
}

// Target languages with proprietary studio voice branding
export interface SupportedLanguage {
  id: string;
  name: string;
  nativeName: string;
  code: string;
  flag: string;
  voice: string;
  description: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  {
    id: "Urdu",
    name: "Urdu",
    nativeName: "اردو",
    code: "UR",
    flag: "🇵🇰",
    voice: "ur-PK-UzmaNeural",
    description: "Studio Natural • Warm Expressive",
  },
  {
    id: "English",
    name: "English",
    nativeName: "English",
    code: "EN",
    flag: "🇺🇸",
    voice: "en-US-JennyNeural",
    description: "Studio Clear • Balanced Cinematic",
  },
  {
    id: "Hindi",
    name: "Hindi",
    nativeName: "हिन्दी",
    code: "HI",
    flag: "🇮🇳",
    voice: "hi-IN-SwaraNeural",
    description: "Studio Rich • Articulate Dialogue",
  },
  {
    id: "Arabic",
    name: "Arabic",
    nativeName: "العربية",
    code: "AR",
    flag: "🇸🇦",
    voice: "ar-SA-ZariyahNeural",
    description: "Studio Deep • Broadcast Resonance",
  },
];
