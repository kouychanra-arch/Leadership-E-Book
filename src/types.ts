export interface SubSection {
  id: string;
  title: string;
  content: string[];
}

export interface PracticalExample {
  title: string;
  scenario: string;
  solution: string;
  takeaway: string;
}

export interface DiscussionQuestion {
  id: string;
  question: string;
  guidelines: string;
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  englishTitle: string;
  description: string;
  iconName: string;
  subSections: SubSection[];
  examples: PracticalExample[];
  discussionQuestions: DiscussionQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface UserProgress {
  completedChapters: string[];
  discussionAnswers: Record<string, string>;
  quizScores: {
    score: number;
    total: number;
    date: string;
    completed: boolean;
    timeTaken?: number; // Time taken in seconds
  } | null;
  bookmarks: string[];
  highlights?: Highlight[];
}

export interface Highlight {
  id: string;
  chapterId: string;
  chapterTitle: string;
  chapterNumber: number;
  text: string;
  note?: string;
  color?: string; // e.g., 'yellow' | 'cyan' | 'emerald' | 'pink'
  date: string;
}
