export interface User {
  id: string;
  email: string;
  plan: 'free' | 'pro';
  videos_today: number;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  topic: string;
  language: 'en' | 'ru';
  tone: 'funny' | 'motivational' | 'aggressive' | 'storytelling';
  status: 'draft' | 'script' | 'voice' | 'subtitles' | 'video' | 'complete';
  created_at: string;
}

export interface Script {
  id: string;
  project_id: string;
  hook: string;
  body: string;
  cta: string;
  full_text: string;
  created_at: string;
}

export interface Voice {
  id: string;
  project_id: string;
  audio_url: string;
  voice_id: string;
  speed: number;
  created_at: string;
}

export interface Subtitle {
  id: string;
  project_id: string;
  srt_content: string;
  captions_json: SubtitleSegment[];
  created_at: string;
}

export interface SubtitleSegment {
  start: number;
  end: number;
  text: string;
  highlighted_words: string[];
}

export interface Video {
  id: string;
  project_id: string;
  video_url: string;
  format: '9:16';
  has_watermark: boolean;
  created_at: string;
}

export interface ContentIdea {
  title: string;
  hook: string;
  core_message: string;
  cta: string;
}
