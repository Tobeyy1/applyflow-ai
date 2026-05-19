// types/index.ts

export interface CoverLetter {
  content: string;
}

export interface ExperienceReframe {
  current_experience: string;
  better_positioning: string;
}

export interface GapAnalysis {
  match_score: number;
  summary: string;
  strong_matches: string[];
  skill_gaps: string[];
  experience_reframes: ExperienceReframe[];
  recommended_next_steps: string[];
}

export interface AnalyzeResponse {
  cover_letter: CoverLetter;
  gap_analysis: GapAnalysis;
}