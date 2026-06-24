import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Users,
  GraduationCap,
  FileSpreadsheet,
  Heart,
  Award,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Search,
  Bookmark,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  MessageSquare,
  HelpCircle,
  Send,
  RotateCcw,
  Check,
  X,
  Calendar,
  User,
  ClipboardList,
  CheckSquare,
  Sparkles,
  Menu,
  BookMarked,
  ArrowRight,
  Info,
  ExternalLink,
  ThumbsUp,
  Play,
  Clock,
  Sun,
  Moon
} from "lucide-react";
import { chapters, quizQuestions, bookIntro } from "./data";
import { Chapter, QuizQuestion, UserProgress } from "./types";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("ldr_theme") as "light" | "dark") || "light";
  });

  useEffect(() => {
    localStorage.setItem("ldr_theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Navigation states
  const [currentTab, setCurrentTab] = useState<"home" | "chapters" | "quiz" | "progress" | "cases">("home");
  const [activeChapterId, setActiveChapterId] = useState<string>("cross-functional-synergy");
  const [quickJumpOpen, setQuickJumpOpen] = useState<boolean>(false);
  const quickJumpRef = useRef<HTMLDivElement>(null);
  const [activeCaseIndex, setActiveCaseIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // User Profile
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem("ldr_user_name") || "";
  });
  const [inputName, setInputName] = useState<string>("");

  // Bookmark and progress state
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem("ldr_user_progress");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {
      completedChapters: [],
      discussionAnswers: {},
      quizScores: null,
      bookmarks: []
    };
  });

  // Current active chapter object
  const activeChapter = chapters.find(c => c.id === activeChapterId) || chapters[0];

  // Quiz states
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [tempQuizScore, setTempQuizScore] = useState<number>(0);

  // Discussion input temp states
  const [tempAnswers, setTempAnswers] = useState<Record<string, string>>({});

  // Toast / notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Reading content font size state ("sm" | "base" | "lg" | "xl" | "2xl")
  const [readerFontSize, setReaderFontSize] = useState<"sm" | "base" | "lg" | "xl" | "2xl">(() => {
    return (localStorage.getItem("ldr_reader_font_size") as "sm" | "base" | "lg" | "xl" | "2xl") || "base";
  });

  // Save reader font size to local storage
  useEffect(() => {
    localStorage.setItem("ldr_reader_font_size", readerFontSize);
  }, [readerFontSize]);

  // Click outside listener for Quick Jump dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (quickJumpRef.current && !quickJumpRef.current.contains(event.target as Node)) {
        setQuickJumpOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Helper classes for font size changes
  const getParaFontSizeClass = () => {
    switch (readerFontSize) {
      case "sm": return "text-xs sm:text-sm";
      case "base": return "text-sm sm:text-base"; // Default
      case "lg": return "text-base sm:text-lg";
      case "xl": return "text-lg sm:text-xl";
      case "2xl": return "text-xl sm:text-2xl";
      default: return "text-sm sm:text-base";
    }
  };

  const getCaseStudyFontSizeClass = () => {
    switch (readerFontSize) {
      case "sm": return "text-xs sm:text-[13px]";
      case "base": return "text-[14px] sm:text-[15px]"; // Default
      case "lg": return "text-base sm:text-lg";
      case "xl": return "text-lg sm:text-xl";
      case "2xl": return "text-xl sm:text-2xl";
      default: return "text-[14px] sm:text-[15px]";
    }
  };

  const getSmallFontSizeClass = () => {
    switch (readerFontSize) {
      case "sm": return "text-[10px]";
      case "base": return "text-[11px]"; // Default
      case "lg": return "text-xs";
      case "xl": return "text-sm";
      case "2xl": return "text-base";
      default: return "text-[11px]";
    }
  };

  // Helper to render formatted Khmer text with bold spans and styled bullet points
  const formatCaseStudyText = (text: string, accentType: "orange" | "green" | "indigo") => {
    return text.split("\n").map((line, idx) => {
      let content = line.trim();
      if (!content) return null;

      const isBullet = content.startsWith("•") || content.startsWith("-");
      if (isBullet) {
        content = content.replace(/^[•-]\s*/, "");
      }

      // Parse bold syntax **text**
      const parts = content.split(/(\*\*.*?\*\*)/g);
      const elements = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={pIdx} className="font-extrabold text-slate-900 dark:text-amber-200">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (isBullet) {
        let bulletColor = "text-orange-600 bg-orange-100/80 dark:text-orange-400 dark:bg-orange-950/60";
        if (accentType === "green") bulletColor = "text-emerald-600 bg-emerald-100/80 dark:text-emerald-400 dark:bg-emerald-950/60";
        if (accentType === "indigo") bulletColor = "text-indigo-600 bg-indigo-100/80 dark:text-indigo-400 dark:bg-indigo-950/60";

        return (
          <div key={idx} className="flex items-start gap-2.5 mb-2.5 pl-1">
            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-extrabold shrink-0 ${bulletColor} mt-0.5 select-none`}>
              ✓
            </span>
            <span className={`text-slate-700 dark:text-slate-350 leading-[1.8] font-medium ${getCaseStudyFontSizeClass()}`}>{elements}</span>
          </div>
        );
      }

      return (
        <p key={idx} className={`text-slate-700 dark:text-slate-300 leading-[1.8] mb-3 last:mb-0 font-medium ${getCaseStudyFontSizeClass()}`}>
          {elements}
        </p>
      );
    });
  };

  // Helper to calculate reading time of a chapter based on its contents
  const calculateReadingTime = (chapter: Chapter): number => {
    let totalChars = 0;
    totalChars += chapter.title.length;
    totalChars += chapter.englishTitle.length;
    totalChars += chapter.description.length;
    
    chapter.subSections.forEach((sec) => {
      totalChars += sec.title.length;
      sec.content.forEach((paragraph) => {
        totalChars += paragraph.length;
      });
    });
    
    chapter.examples.forEach((ex) => {
      totalChars += ex.title.length;
      totalChars += ex.scenario.length;
      totalChars += ex.solution.length;
      totalChars += ex.takeaway.length;
    });
    
    chapter.discussionQuestions.forEach((dq) => {
      totalChars += dq.question.length;
      if (dq.guidelines) {
        totalChars += dq.guidelines.length;
      }
    });

    // Khmer reading speed average is about 400 characters per minute
    return Math.max(1, Math.ceil(totalChars / 400));
  };

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("ldr_user_progress", JSON.stringify(progress));
  }, [progress]);

  // Handle Toast Notifications
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Register Name
  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputName.trim()) {
      setUserName(inputName.trim());
      localStorage.setItem("ldr_user_name", inputName.trim());
      showToast("រីករាយដែលបានស្គាល់លោក " + inputName.trim() + "!");
    }
  };

  // Log out/Reset Name
  const handleResetName = () => {
    if (window.confirm("តើអ្នកចង់ប្តូរឈ្មោះអ្នកសិក្សា ឬ?")) {
      setUserName("");
      setInputName("");
      localStorage.removeItem("ldr_user_name");
    }
  };

  // Check if a subsection or chapter is completed
  const handleToggleChapterComplete = (chapterId: string) => {
    setProgress(prev => {
      const completed = prev.completedChapters.includes(chapterId)
        ? prev.completedChapters.filter(id => id !== chapterId)
        : [...prev.completedChapters, chapterId];
      
      const isNowCompleted = completed.includes(chapterId);
      showToast(isNowCompleted ? "បានសម្គាល់ជំពូកនេះថាអានចប់! 🎉" : "បានដកការសម្គាល់ជំពូកនេះ");
      
      return {
        ...prev,
        completedChapters: completed
      };
    });
  };

  // Toggle Bookmark for chapter
  const handleToggleBookmark = (chapterId: string) => {
    setProgress(prev => {
      const isBookmarked = prev.bookmarks.includes(chapterId);
      const bookmarks = isBookmarked
        ? prev.bookmarks.filter(id => id !== chapterId)
        : [...prev.bookmarks, chapterId];

      showToast(isBookmarked ? "បានដកចំណាំទំព័រ!" : "បានចំណាំទំព័រនេះទុក! 📌");

      return {
        ...prev,
        bookmarks
      };
    });
  };

  // Save discussion response
  const handleSaveDiscussionAnswer = (questionId: string) => {
    const answer = tempAnswers[questionId]?.trim();
    if (!answer) {
      showToast("សូមសរសេរចម្លើយ ឬគំនិតរបស់អ្នកមុននឹងរក្សាទុក!");
      return;
    }

    setProgress(prev => {
      const discussionAnswers = {
        ...prev,
        discussionAnswers: {
          ...prev.discussionAnswers,
          [questionId]: answer
        }
      };
      showToast("រក្សាទុកមតិយោបល់របស់លោកអ្នកបានជោគជ័យ! 💾");
      return discussionAnswers;
    });
  };

  // Handle quiz answer selection
  const handleSelectQuizAnswer = (questionId: string, optionIndex: number) => {
    if (quizSubmitted) return; // Cannot change answer after submission
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  // Submit Quiz
  const handleSubmitQuiz = () => {
    // Verify all questions are answered
    const unanswered = quizQuestions.filter(q => selectedAnswers[q.id] === undefined);
    if (unanswered.length > 0) {
      if (!window.confirm(`អ្នកនៅសល់សំណួរចំនួន ${unanswered.length} ទៀតមិនទាន់ឆ្លើយ។ តើអ្នកចង់បញ្ជូនចម្លើយទាំងមិនទាន់រួចរាល់ឬ?`)) {
        return;
      }
    }

    // Calculate score
    let score = 0;
    quizQuestions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        score++;
      }
    });

    const quizResult = {
      score,
      total: quizQuestions.length,
      date: new Date().toLocaleDateString("km-KH", { year: 'numeric', month: 'long', day: 'numeric' }),
      completed: true
    };

    setTempQuizScore(score);
    setQuizSubmitted(true);
    setProgress(prev => ({
      ...prev,
      quizScores: quizResult
    }));

    showToast(`តេស្តត្រូវបានបញ្ចប់! លទ្ធផល៖ ${score}/${quizQuestions.length} 🎉`);
  };

  // Reset Quiz
  const handleResetQuiz = () => {
    if (window.confirm("តើអ្នកពិតជាចង់ធ្វើតេស្តម្តងទៀតមែនទេ? រាល់ចម្លើយចាស់នឹងត្រូវលុបចោល។")) {
      setSelectedAnswers({});
      setQuizSubmitted(false);
      setQuizStarted(true);
      setCurrentQuestionIndex(0);
      setTempQuizScore(0);
      setProgress(prev => ({
        ...prev,
        quizScores: null
      }));
    }
  };

  // Load saved discussion answers into temp state on mount or chapter change
  useEffect(() => {
    const loadedAnswers: Record<string, string> = {};
    chapters.forEach(c => {
      c.discussionQuestions.forEach(q => {
        if (progress.discussionAnswers[q.id]) {
          loadedAnswers[q.id] = progress.discussionAnswers[q.id];
        }
      });
    });
    setTempAnswers(prev => ({ ...prev, ...loadedAnswers }));
  }, [activeChapterId, progress.discussionAnswers]);

  // Helper for chapter icons
  const renderChapterIcon = (iconName: string, className = "w-6 h-6") => {
    switch (iconName) {
      case "Users2":
        return <Users className={className} />;
      case "GraduationCap":
        return <GraduationCap className={className} />;
      case "FileSpreadsheet":
        return <FileSpreadsheet className={className} />;
      case "Heart":
        return <Heart className={className} />;
      default:
        return <BookOpen className={className} />;
    }
  };

  // Reading progress stats
  const completedCount = progress.completedChapters.length;
  const totalChapters = chapters.length;
  const progressPercent = Math.round((completedCount / totalChapters) * 100);

  // Search filtered content
  const getFilteredChapters = () => {
    if (!searchQuery.trim()) return chapters;
    const query = searchQuery.toLowerCase();
    return chapters.filter(c => 
      c.title.toLowerCase().includes(query) || 
      c.englishTitle.toLowerCase().includes(query) || 
      c.description.toLowerCase().includes(query) ||
      c.subSections.some(s => s.title.toLowerCase().includes(query) || s.content.some(text => text.toLowerCase().includes(query)))
    );
  };

  return (
    <div className="min-h-screen bg-[#F3F7FA] dark:bg-[#0B0F19] text-stone-800 dark:text-stone-100 font-sans antialiased flex flex-col selection:bg-sky-100 selection:text-sky-900 transition-colors duration-300 relative overflow-x-hidden">
      
      {/* Premium Ambient Background Pattern & Light/Dark Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Animated Light Blue Ambient Glow (Top Left) */}
        <motion.div 
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -25, 30, 0],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[-10%] left-[-15%] w-[70%] h-[50%] rounded-full bg-gradient-to-br from-sky-200/25 to-blue-200/0 dark:from-sky-950/20 dark:to-indigo-950/0 blur-[130px] opacity-75" 
        />
        
        {/* Animated Indigo/Slate Ambient Glow (Bottom Right) */}
        <motion.div 
          animate={{
            x: [0, -50, 30, 0],
            y: [0, 35, -40, 0],
            scale: [1, 1.2, 0.85, 1],
          }}
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-[-10%] right-[-15%] w-[70%] h-[50%] rounded-full bg-gradient-to-tr from-indigo-100/20 to-sky-100/0 dark:from-indigo-950/15 dark:to-sky-950/0 blur-[130px] opacity-65" 
        />
        
        {/* Animated Soft Center Accent Glow (Cyan/Teal hint) */}
        <motion.div 
          animate={{
            x: [0, 35, -35, 0],
            y: [0, 25, -25, 0],
            scale: [1, 0.88, 1.12, 1],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[30%] left-[25%] w-[45%] h-[35%] rounded-full bg-cyan-100/15 dark:bg-cyan-950/8 blur-[110px] opacity-60" 
        />

        {/* Dynamic Professional Dot-Grid Pattern Layer with Radial Vignette */}
        <div className="absolute inset-0 bg-grid-pattern opacity-95 dark:opacity-40" />

        {/* Tactile Premium Micro-grain Noise Overlay Layer */}
        <div className="absolute inset-0 bg-noise-overlay mix-blend-overlay" />
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 right-6 z-50 bg-stone-900 dark:bg-stone-850 text-stone-100 px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-stone-800/20 max-w-sm text-sm"
          >
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="font-medium leading-relaxed">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Header Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800/80 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => setCurrentTab("home")}>
            <div className="bg-amber-700 p-2.5 rounded-xl text-white shadow-md shadow-amber-700/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] tracking-wider text-amber-800 dark:text-amber-400 font-bold block uppercase leading-none">សៀវភៅឌីជីថល</span>
              <h1 className="text-sm sm:text-base font-moul text-amber-950 dark:text-amber-100 leading-none mt-1.5">យុទ្ធសាស្ត្រដឹកនាំបុគ្គលិក</h1>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-stone-100 dark:bg-stone-950 p-1.5 rounded-xl border border-stone-200/50 dark:border-stone-800/50">
            <button
              onClick={() => { setCurrentTab("home"); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                currentTab === "home"
                  ? "bg-white dark:bg-stone-800 text-amber-800 dark:text-amber-300 shadow-sm"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-900"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              ទំព័រដើម
            </button>
            <button
              onClick={() => { setCurrentTab("chapters"); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                currentTab === "chapters"
                  ? "bg-white dark:bg-stone-800 text-amber-800 dark:text-amber-300 shadow-sm"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-900"
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              អានមាតិកា
            </button>
            <button
              onClick={() => { setCurrentTab("cases"); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                currentTab === "cases"
                  ? "bg-white dark:bg-stone-800 text-amber-800 dark:text-amber-300 shadow-sm"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-900"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              ករណីសិក្សា
            </button>
            <button
              onClick={() => { setCurrentTab("quiz"); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                currentTab === "quiz"
                  ? "bg-white dark:bg-stone-800 text-amber-800 dark:text-amber-300 shadow-sm"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-900"
              }`}
            >
              <Award className="w-4 h-4" />
              តេស្តសមត្ថភាព
            </button>
            <button
              onClick={() => { setCurrentTab("progress"); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                currentTab === "progress"
                  ? "bg-white dark:bg-stone-800 text-amber-800 dark:text-amber-300 shadow-sm"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-900"
              }`}
            >
              <BookMarked className="w-4 h-4" />
              លទ្ធផលសិក្សា
            </button>
          </nav>

          {/* User & Theme Controls Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Jump Dropdown */}
            <div ref={quickJumpRef} className="relative">
              <button
                onClick={() => setQuickJumpOpen(!quickJumpOpen)}
                className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs shadow-sm transition-all duration-200 cursor-pointer"
                aria-haspopup="listbox"
                aria-expanded={quickJumpOpen}
              >
                <span className="hidden sm:inline">ផ្លោះទៅកាន់...</span>
                <span className="sm:hidden">ផ្លោះ...</span>
                <ChevronDown className={`w-3.5 h-3.5 text-stone-500 transition-transform duration-300 ${quickJumpOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {quickJumpOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl py-2 z-50 overflow-hidden max-h-96 overflow-y-auto"
                    role="listbox"
                  >
                    <div className="px-3.5 py-2 border-b border-stone-100 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-950/20">
                      <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider block">ផ្លោះទៅកាន់ជំពូក</span>
                    </div>
                    <div className="divide-y divide-stone-100/60 dark:divide-stone-800/40">
                      {chapters.map((ch) => {
                        const isCompleted = progress.completedChapters.includes(ch.id);
                        const isActive = activeChapterId === ch.id && currentTab === "chapters";
                        return (
                          <button
                            key={ch.id}
                            onClick={() => {
                              setActiveChapterId(ch.id);
                              setCurrentTab("chapters");
                              setQuickJumpOpen(false);
                              showToast(`បានផ្លោះទៅកាន់ជំពូកទី ${ch.number} 📖`);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className={`w-full text-left px-3.5 py-2.5 flex items-start gap-2.5 hover:bg-amber-500/5 dark:hover:bg-amber-500/10 transition-colors duration-150 cursor-pointer ${
                              isActive ? "bg-amber-50/75 dark:bg-amber-950/15 text-amber-900 dark:text-amber-300" : ""
                            }`}
                          >
                            <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center font-mono text-[9px] font-black shrink-0 ${
                              isCompleted
                                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900"
                                : isActive
                                ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/60"
                                : "bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400"
                            }`}>
                              {isCompleted ? <Check className="w-3 h-3" /> : ch.number}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-bold leading-tight ${isActive ? "text-amber-950 dark:text-amber-300" : "text-stone-800 dark:text-stone-200"}`}>
                                {ch.title}
                              </p>
                              <p className="text-[10px] text-stone-400 dark:text-stone-500 truncate mt-0.5">
                                {ch.englishTitle}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Global Theme Toggle Button */}
            <button
              onClick={() => {
                const newTheme = theme === "light" ? "dark" : "light";
                setTheme(newTheme);
                showToast(newTheme === "dark" ? "បានប្តូរទៅមុខងារពេលយប់ (Dark Mode) 🌙" : "បានប្តូរទៅមុខងារពេលថ្ងៃ (Light Mode) ☀️");
              }}
              className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-all duration-200 cursor-pointer shadow-sm shrink-0"
              title={theme === "light" ? "ប្តូរទៅមុខងារពេលយប់" : "ប្តូរទៅមុខងារពេលថ្ងៃ"}
              id="theme-toggle"
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4 text-stone-600" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {userName ? (
              <div 
                className="flex items-center gap-2.5 bg-stone-50 dark:bg-stone-950 hover:bg-stone-100 dark:hover:bg-stone-900 transition border border-stone-200/80 dark:border-stone-800/80 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl cursor-pointer shrink-0" 
                onClick={handleResetName}
              >
                <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-xs uppercase shadow-inner shrink-0">
                  {userName.substring(0, 2)}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="text-[9px] text-stone-400 dark:text-stone-500 block leading-tight">ឈ្មោះអ្នកសិក្សា</span>
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block leading-none">{userName}</span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => { setCurrentTab("progress"); showToast("សូមបញ្ចូលឈ្មោះរបស់លោកអ្នកដើម្បីទទួលវិញ្ញាបនបត្រ!"); }}
                className="bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold px-3 py-2 sm:px-4 sm:py-2 rounded-xl transition duration-200 flex items-center gap-1.5 shadow-md shadow-amber-800/10 cursor-pointer shrink-0"
              >
                <User className="w-4 h-4" />
                <span className="hidden xs:inline">ចូលរៀន</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Areas */}
      <main className="flex-1 relative z-10">
        <AnimatePresence mode="wait">

        {/* 1. HOME TAB */}
        {currentTab === "home" && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
          >
            
            {/* Bento Header: Premium Hero Welcomer (Wide Bento Card) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden bg-gradient-to-br from-[#1E1B18] via-[#2A231D] to-[#402C1B] text-white rounded-3xl p-6 sm:p-10 border border-amber-900/40 shadow-xl"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(180,83,9,0.18),transparent_60%)]"></div>
              <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center relative z-10">
                <div className="lg:col-span-8 space-y-4 text-left">
                  <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-300 px-3 py-1 rounded-full border border-amber-500/20 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    សៀវភៅឌីជីថល
                  </span>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-moul text-white leading-relaxed sm:leading-loose max-w-2xl">
                    {bookIntro.title}
                  </h1>
                  <p className="text-xs sm:text-sm font-semibold text-amber-200/80 font-mono tracking-wider mt-1">
                    {bookIntro.englishTitle}
                  </p>
                  
                  {/* Meta Details Row */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-stone-400 pt-4 border-t border-stone-800/60">
                    <span className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-amber-500" />
                      រៀបរៀង៖ <strong className="text-stone-200 font-bold">{bookIntro.author}</strong>
                    </span>
                    <span className="hidden sm:inline text-stone-700">•</span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-amber-500" />
                      បោះពុម្ភ៖ <span className="text-stone-300">{bookIntro.publishedDate}</span>
                    </span>
                  </div>
                </div>

                {/* Dashboard Quick Stats Circle */}
                <div className="lg:col-span-4 bg-stone-900/80 backdrop-blur-md border border-stone-800/40 p-5 rounded-2xl flex flex-col items-center justify-center text-center space-y-3.5">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    {/* SVG Circular Progress */}
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="48" cy="48" r="40" className="stroke-stone-800 fill-none" strokeWidth="8" />
                      <circle 
                        cx="48" cy="48" r="40" 
                        className="stroke-amber-500 fill-none transition-all duration-500" 
                        strokeWidth="8" 
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - progressPercent / 100)}`}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-xl font-black text-white leading-none">{progressPercent}%</span>
                      <span className="text-[9px] text-stone-500 font-bold uppercase mt-0.5">វឌ្ឍនភាព</span>
                    </div>
                  </div>

                  <div className="w-full text-center">
                    <p className="text-[10px] text-stone-400 font-semibold leading-none">កម្រិតភាពជាអ្នកដឹកនាំ</p>
                    <p className="text-xs font-extrabold text-amber-400 mt-1">
                      {progressPercent === 0 && "សមាជិកសិក្សាទើបចូលរួម"}
                      {progressPercent > 0 && progressPercent < 50 && "អ្នកដឹកនាំពន្លកថ្មី 🌱"}
                      {progressPercent >= 50 && progressPercent < 100 && "អ្នកដឹកនាំយុទ្ធសាស្ត្រ ⚡"}
                      {progressPercent === 100 && "កំពូលអ្នកដឹកនាំឆ្នើម 🏆"}
                    </p>
                  </div>

                  {/* CTAs */}
                  <div className="w-full grid grid-cols-2 gap-2 mt-1">
                    <button 
                      onClick={() => setCurrentTab("chapters")}
                      className="bg-amber-600 hover:bg-amber-700 active:scale-95 transition-all text-white font-bold text-[11px] py-2 px-3 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      ចូលអាន
                    </button>
                    <button 
                      onClick={() => setCurrentTab("quiz")}
                      className="bg-stone-800 hover:bg-stone-700 active:scale-95 transition-all text-amber-400 border border-stone-700 font-bold text-[11px] py-2 px-3 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5" />
                      ធ្វើតេស្ត
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Bento Grid Content Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: Foreword & Introduction (Col-span 2) */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="md:col-span-2 bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between relative overflow-hidden group text-left transition-colors duration-300"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-700"></div>
                
                {/* Decorative Giant Quote */}
                <div className="absolute -right-8 -bottom-10 text-stone-100 dark:text-stone-800/40 font-serif text-[180px] leading-none pointer-events-none select-none opacity-40">
                  ”
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 flex items-center justify-center shadow-inner">
                      <Info className="w-5 h-5" />
                    </div>
                    <h2 className="text-sm sm:text-base font-moul text-amber-950 dark:text-amber-300 leading-normal">សេចក្តីផ្តើម និងបុព្វកថា</h2>
                  </div>

                  <p className="text-stone-700 dark:text-stone-300 text-sm sm:text-base leading-[1.8] mb-5 font-medium whitespace-pre-line">
                    {bookIntro.description}
                  </p>

                  <div className="bg-stone-50 dark:bg-stone-950 border-l-3 border-amber-500/40 p-4 rounded-r-xl mb-6">
                    <p className="text-stone-600 dark:text-stone-400 text-xs sm:text-sm italic leading-[1.7] font-medium">
                      "{bookIntro.foreword}"
                    </p>
                  </div>
                </div>

                <div className="border-t border-stone-100 dark:border-stone-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-stone-900 text-amber-400 font-extrabold flex items-center justify-center text-xs shadow-md border border-stone-800">
                      គច
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-stone-900 dark:text-stone-200 text-xs sm:text-sm leading-none">គួយ ចាន់រ៉ា</h4>
                      <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 leading-none">អ្នករៀបរៀង និងអ្នកឯកទេសគ្រប់គ្រងធនធានមនុស្ស</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono italic">រក្សាសិទ្ធិគ្រប់យ៉ាង © ២០២៦</span>
                </div>
              </motion.div>

              {/* Card 2: Interactive Quiz & Certification Lock/Unlock (Col-span 1) */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`border rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group text-left transition-colors duration-300 ${
                  progress.quizScores && (progress.quizScores.score / progress.quizScores.total >= 0.7)
                    ? "bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-300 dark:from-amber-950/20 dark:to-amber-900/10 dark:border-amber-800"
                    : "bg-white dark:bg-stone-900 border-stone-200/80 dark:border-stone-800"
                }`}
              >
                {/* Visual Glow if unlocked */}
                {progress.quizScores && (progress.quizScores.score / progress.quizScores.total >= 0.7) && (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.1),transparent_50%)]"></div>
                )}

                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-inner ${
                      progress.quizScores && (progress.quizScores.score / progress.quizScores.total >= 0.7)
                        ? "bg-amber-600 text-white"
                        : "bg-stone-100 dark:bg-stone-850 text-stone-600 dark:text-stone-300"
                    }`}>
                      <Award className="w-5 h-5" />
                    </div>
                    
                    {/* Status Badge */}
                    {progress.quizScores ? (
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        progress.quizScores.score / progress.quizScores.total >= 0.7
                           ? "bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-400"
                           : "bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-400"
                      }`}>
                        {progress.quizScores.score / progress.quizScores.total >= 0.7 ? "ជាប់ជោគជ័យ" : "មិនទាន់ជាប់"}
                      </span>
                    ) : (
                      <span className="bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 px-2.5 py-1 rounded-full text-[10px] font-bold">
                        មិនទាន់ធ្វើតេស្ត
                      </span>
                    )}
                  </div>

                  <div className="text-left">
                    <h3 className="text-base sm:text-lg font-display text-amber-950 dark:text-amber-300 leading-snug">
                      វិញ្ញាបនបត្រឌីជីថល
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-450 leading-relaxed mt-1.5 font-medium">
                      បញ្ចប់តេស្តសមត្ថភាព ១០សំណួរ ដោយទទួលបានពិន្ទុយ៉ាងតិច ៧០% ដើម្បីបញ្ចេញវិញ្ញាបនបត្រផ្លូវការ។
                    </p>
                  </div>

                  {/* Lock/Unlock Visual Container */}
                  <div className="py-4 flex justify-center">
                    {progress.quizScores && (progress.quizScores.score / progress.quizScores.total >= 0.7) ? (
                      <motion.div 
                        animate={{ rotate: [0, 5, -5, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className="bg-amber-100 dark:bg-amber-950/60 border-2 border-amber-400 dark:border-amber-700 p-4 rounded-2xl flex flex-col items-center justify-center space-y-1 shadow-md cursor-pointer"
                        onClick={() => setCurrentTab("quiz")}
                      >
                        <Sparkles className="w-8 h-8 text-amber-700 dark:text-amber-300" />
                        <span className="text-[11px] font-black text-amber-900 dark:text-amber-200 uppercase">ដោះសោរួចរាល់ ✨</span>
                      </motion.div>
                    ) : (
                      <div className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 p-4 rounded-2xl flex flex-col items-center justify-center space-y-1 text-stone-400 dark:text-stone-500">
                        <User className="w-8 h-8 opacity-60" />
                        <span className="text-[10px] font-bold">ជាប់សោ (តម្រូវការ ៧០%)</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setCurrentTab("quiz")}
                  className="w-full mt-2 bg-stone-900 dark:bg-stone-800 hover:bg-stone-800 dark:hover:bg-stone-700 active:scale-98 transition text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow cursor-pointer border border-transparent dark:border-stone-700"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
                  {progress.quizScores ? "ពិនិត្យលទ្ធផលតេស្ត" : "ចូលធ្វើតេស្តឥឡូវនេះ"}
                </button>
              </motion.div>

              {/* Card 3: The 4 Chapters Core Tiles (Col-span 3) */}
              <div className="md:col-span-3 space-y-4">
                <div className="text-left mt-4">
                  <span className="text-xs font-extrabold text-amber-800 dark:text-amber-400 tracking-wider uppercase">មាតិកាសិក្សា</span>
                  <h2 className="text-base sm:text-lg font-moul text-amber-950 dark:text-amber-300 mt-2.5 leading-normal">ជំពូកសិក្សាស្នូលទាំង ៤</h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-medium">
                    សិក្សាទ្រឹស្តីទំនើប ករណីសិក្សាពិតប្រាកដ និងកត់ត្រាគំនិតផ្ទាល់ខ្លួនរបស់អ្នក។
                  </p>
                </div>

                {/* 4 Core Chapters grid inside bento dashboard */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {chapters.map((chapter, idx) => {
                    const isCompleted = progress.completedChapters.includes(chapter.id);
                    const isBookmarked = progress.bookmarks.includes(chapter.id);
                    
                    // Design distinct color themes for each chapter cards
                    const themes = [
                      { bg: "hover:bg-amber-50/40 dark:hover:bg-amber-950/20", border: "hover:border-amber-300 dark:hover:border-amber-800", accent: "text-amber-800 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/50" },
                      { bg: "hover:bg-blue-50/40 dark:hover:bg-blue-950/20", border: "hover:border-blue-300 dark:hover:border-blue-800", accent: "text-blue-800 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/50" },
                      { bg: "hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20", border: "hover:border-emerald-300 dark:hover:border-emerald-800", accent: "text-emerald-800 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/50" },
                      { bg: "hover:bg-rose-50/40 dark:hover:bg-rose-950/20", border: "hover:border-rose-300 dark:hover:border-rose-800", accent: "text-rose-800 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/50" }
                    ];
                    const theme = themes[idx % themes.length];

                    return (
                      <motion.div
                        key={chapter.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * idx }}
                        onClick={() => {
                          setActiveChapterId(chapter.id);
                          setCurrentTab("chapters");
                        }}
                        className={`bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer group ${theme.bg} ${theme.border} text-left`}
                      >
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${theme.accent}`}>
                              ជំពូកទី {chapter.number}
                            </span>
                            <div className="flex gap-1">
                              {isBookmarked && (
                                <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 p-1 rounded-full text-xs">
                                  <Bookmark className="w-3 h-3 fill-current" />
                                </span>
                              )}
                              {isCompleted && (
                                <span className="bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300 p-1 rounded-full text-xs" title="អានចប់">
                                  <Check className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                          </div>

                          <h3 className="text-sm sm:text-base font-display text-stone-900 dark:text-stone-100 group-hover:text-amber-800 dark:group-hover:text-amber-400 transition leading-snug text-left">
                            {chapter.title}
                          </h3>
                          <p className="text-[10px] text-stone-400 dark:text-stone-500 font-bold font-mono tracking-wider mt-1 uppercase text-left">{chapter.englishTitle}</p>
                          <p className="text-stone-500 dark:text-stone-400 text-xs mt-3 leading-relaxed text-left line-clamp-3 font-medium">
                            {chapter.description}
                          </p>
                        </div>

                        <div className="border-t border-stone-100 dark:border-stone-800 pt-3.5 mt-4 flex items-center justify-between text-[11px] text-stone-400 dark:text-stone-500">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              {renderChapterIcon(chapter.iconName, "w-4 h-4 text-amber-700/80 dark:text-amber-500")}
                              {chapter.subSections.length} មេរៀន
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
                              ~ {calculateReadingTime(chapter)} នាទី
                            </span>
                          </div>
                          <span className="text-amber-800 dark:text-amber-400 group-hover:translate-x-1.5 transition-transform duration-200 font-extrabold flex items-center gap-0.5">
                            អាន
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Card 4: Reflection Notes Saved (Col-span 2) */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="md:col-span-2 bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between text-left space-y-4 transition-colors duration-300"
              >
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 flex items-center justify-center shadow-inner">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100">
                      កំណត់ត្រាគំនិតផ្ទាល់ខ្លួន (Reflection Feed)
                    </h3>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-medium">
                    ចម្លើយ ឬការយល់ឃើញរបស់អ្នកចំពោះសំណួរពិភាក្សានៅក្នុងមេរៀននីមួយៗ នឹងបង្ហាញឡើងវិញនៅទីនេះ ដើម្បីជាប្រទីបសិក្សាជាក់ស្តែង។
                  </p>
                </div>

                {/* Display dynamic content based on real user answers */}
                {Object.keys(progress.discussionAnswers).length > 0 ? (
                  <div className="space-y-3 bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-2xl p-4 max-h-[160px] overflow-y-auto pr-1">
                    {(() => {
                      const savedAnswers = Object.entries(progress.discussionAnswers);
                      return savedAnswers.slice(0, 3).map(([key, value], idx) => {
                        // Find question text
                        let questionText = "សំណួរគន្លឹះពិភាក្សា";
                        chapters.forEach(c => {
                          const found = c.discussionQuestions.find(q => q.id === key);
                          if (found) questionText = found.question;
                        });
                        return (
                          <div key={idx} className="bg-white dark:bg-stone-900 border border-stone-200/40 dark:border-stone-800/40 p-3 rounded-xl space-y-1 text-xs text-left">
                            <p className="font-bold text-amber-800 dark:text-amber-400 truncate">✏ {questionText}</p>
                            <p className="text-stone-700 dark:text-stone-300 italic font-medium leading-relaxed font-sans line-clamp-2">
                              "{value}"
                            </p>
                          </div>
                        );
                      });
                    })()}
                  </div>
                ) : (
                  <div className="bg-stone-50 dark:bg-stone-950 border border-stone-200/40 dark:border-stone-800/40 rounded-2xl py-8 px-4 text-center text-xs text-stone-400 dark:text-stone-500 space-y-2 font-medium">
                    <p>លោកអ្នកមិនទាន់មានកំណត់ត្រាណាមួយនៅឡើយទេ!</p>
                    <p className="text-[10px] text-stone-400 dark:text-stone-550">សូមអានមេរៀន និងបំពេញប្រអប់សំណួរពិភាក្សា ដើម្បីបង្កើតបណ្ណសារគំនិតផ្ទាល់ខ្លួន។</p>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button 
                    onClick={() => setCurrentTab("progress")}
                    className="text-amber-800 dark:text-amber-400 hover:text-amber-950 dark:hover:text-amber-300 font-extrabold text-xs flex items-center gap-0.5 group cursor-pointer"
                  >
                    ពិនិត្យកំណត់ត្រាទាំងអស់
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>

              {/* Card 5: Leader Bio Stats Card (Col-span 1) */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-[#211E1A] text-stone-200 border border-stone-800/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between text-left relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(180,83,9,0.12),transparent_60%)]"></div>
                <div className="relative z-10 space-y-3.5">
                  <span className="text-[9px] font-mono font-bold tracking-widest text-amber-400 uppercase">សកម្មភាពសិក្សា</span>
                  
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-white leading-none">
                      ស្ថិតិទិន្នន័យអាន
                    </h3>
                    <p className="text-[10px] text-stone-400 font-medium">ស្ថិតិតាមដានពេលវេលាជាក់ស្តែង</p>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <div className="flex justify-between text-xs border-b border-stone-800/50 pb-1.5 font-medium">
                      <span className="text-stone-400">អានជំពូក៖</span>
                      <span className="font-extrabold text-white">{completedCount} / {totalChapters}</span>
                    </div>
                    <div className="flex justify-between text-xs border-b border-stone-800/50 pb-1.5 font-medium">
                      <span className="text-stone-400">ចំណាំទំព័រ៖</span>
                      <span className="font-extrabold text-white">{progress.bookmarks.length} ទំព័រ</span>
                    </div>
                    <div className="flex justify-between text-xs border-b border-stone-800/50 pb-1.5 font-medium">
                      <span className="text-stone-400">ឆ្លើយសំណួរ៖</span>
                      <span className="font-extrabold text-white">{Object.keys(progress.discussionAnswers).length} ប្រធានបទ</span>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 mt-5 pt-3.5 border-t border-stone-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-stone-400">ស្ថានភាពចូលសិក្សា៖</span>
                  <span className="font-black text-green-400 flex items-center gap-1 font-mono">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    ACTIVE
                  </span>
                </div>
              </motion.div>

            </div>
          </motion.div>
        )}


        {/* 2. CHAPTERS READING TAB */}
        {currentTab === "chapters" && (
          <motion.div
            key="chapters"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8"
          >
            
            {/* Sidebar for Navigation */}
            <aside className={`w-full lg:w-80 shrink-0 ${sidebarOpen ? "block" : "hidden lg:block"}`}>
              <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-5 sticky top-24 shadow-sm transition-colors duration-300">
                
                {/* Search box */}
                <div className="relative mb-5">
                  <input
                    type="text"
                    placeholder="ស្វែងរកប្រធានបទ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-150 pl-10 pr-4 py-2 rounded-xl text-xs border border-stone-200 dark:border-stone-800 focus:outline-none focus:border-amber-600 focus:bg-white dark:focus:bg-stone-900 transition"
                  />
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-3 top-2.5 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Chapters List */}
                <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
                  <span className="text-[10px] uppercase font-bold text-stone-400 dark:text-stone-500 tracking-wider block mb-2 px-1">បញ្ជីជំពូកសៀវភៅ</span>
                  {getFilteredChapters().map((c) => {
                    const isSelected = c.id === activeChapterId;
                    const isComp = progress.completedChapters.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        onClick={() => setActiveChapterId(c.id)}
                        className={`w-full text-left p-3 rounded-xl transition duration-150 flex items-center gap-3 border ${
                          isSelected
                            ? "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-900/60 font-bold"
                            : "bg-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-850 border-transparent"
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg ${isSelected ? "bg-amber-200/60 dark:bg-amber-900/40" : "bg-stone-100 dark:bg-stone-800"}`}>
                          {renderChapterIcon(c.iconName, "w-4 h-4 text-amber-800 dark:text-amber-400")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] font-mono font-bold opacity-80 dark:opacity-90 leading-none">ជំពូក {c.number}</p>
                            <span className="text-[9px] text-stone-400 dark:text-stone-550 font-bold flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              {calculateReadingTime(c)} នាទី
                            </span>
                          </div>
                          <p className="text-xs truncate font-bold mt-1">{c.title}</p>
                        </div>
                        {isComp && (
                          <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-450 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                  {getFilteredChapters().length === 0 && (
                    <p className="text-xs text-stone-400 dark:text-stone-500 text-center py-4">រកមិនឃើញលទ្ធផលដែលចង់ស្វែងរក!</p>
                  )}
                </div>

                {/* Reading Tracker Widget inside sidebar */}
                <div className="border-t border-stone-100 dark:border-stone-800 mt-5 pt-4">
                  <div className="flex justify-between items-center text-[10px] text-stone-400 dark:text-stone-550 font-mono mb-2">
                    <span>វឌ្ឍនភាពសរុប</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-600" style={{ width: `${progressPercent}%` }}></div>
                  </div>
                  <button
                    onClick={() => setCurrentTab("quiz")}
                    className="w-full mt-4 bg-stone-900 dark:bg-stone-800 hover:bg-stone-800 dark:hover:bg-stone-700 text-stone-100 dark:text-stone-200 text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 border border-transparent dark:border-stone-700"
                  >
                    <Award className="w-4 h-4 text-amber-400" />
                    តេស្តសមត្ថភាពចុងក្រោយ
                  </button>
                </div>

              </div>
            </aside>

            {/* Main Reading Canvas */}
            <article className="flex-1 bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl shadow-sm overflow-hidden transition-colors duration-300">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeChapter.id}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {/* Cover Banner for Active Chapter */}
                  <div className="bg-gradient-to-r from-amber-900/90 to-stone-900 text-white p-6 sm:p-10 relative">
                <div className="absolute inset-0 bg-stone-900/25"></div>
                <div className="relative z-10">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold tracking-widest text-amber-300 bg-amber-400/10 px-3.5 py-1 rounded-full border border-amber-400/20 uppercase">
                        ជំពូកទី {activeChapter.number}
                      </span>
                      <span className="text-xs font-mono font-bold tracking-widest text-amber-300 bg-amber-400/10 px-3.5 py-1 rounded-full border border-amber-400/20 uppercase flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        ពេលវេលាអាន៖ ~ {calculateReadingTime(activeChapter)} នាទី
                      </span>
                    </div>
                    
                    {/* Action panel for page reading (Bookmark, Complete) */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleBookmark(activeChapter.id)}
                        className={`p-2 rounded-xl border transition ${
                          progress.bookmarks.includes(activeChapter.id)
                            ? "bg-amber-500/20 border-amber-400 text-amber-300"
                            : "bg-white/5 border-white/10 text-stone-300 hover:bg-white/10"
                        }`}
                        title="សម្គាល់ទំព័រនេះទុក"
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>

                      <button
                        onClick={() => handleToggleChapterComplete(activeChapter.id)}
                        className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                          progress.completedChapters.includes(activeChapter.id)
                            ? "bg-green-600/30 border-green-500 text-green-300"
                            : "bg-white/5 border-white/10 text-stone-300 hover:bg-white/10"
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                        {progress.completedChapters.includes(activeChapter.id) ? "បានអានរួច" : "សម្គាល់ថាអានចប់"}
                      </button>
                    </div>
                  </div>

                  <h2 className="text-lg sm:text-2xl font-moul text-white leading-normal tracking-wide">
                    {activeChapter.title}
                  </h2>
                  <p className="text-xs sm:text-sm font-mono text-amber-200 mt-2 tracking-wider font-semibold">
                    {activeChapter.englishTitle}
                  </p>
                </div>
              </div>

              {/* Distraction-Free Reading Area */}
              <div className="p-6 sm:p-10 max-w-4xl mx-auto">

                {/* Accessibility Font Size Control Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-5 mb-8">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-stone-400 dark:text-stone-550 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      ESTIMATED READING TIME: ~ {calculateReadingTime(activeChapter)} MINUTES
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-stone-50 dark:bg-stone-900/60 px-3 py-1.5 rounded-xl border border-stone-200/60 dark:border-stone-800/80 self-start sm:self-auto shadow-sm">
                    <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 mr-2 flex items-center gap-1">
                      <span className="text-xs font-black font-mono">Aa</span>
                      ទំហំអក្សរ៖
                    </span>
                    <div className="flex items-center gap-1">
                      {(["sm", "base", "lg", "xl", "2xl"] as const).map((size) => {
                        const labels: Record<string, string> = {
                          sm: "តូច",
                          base: "មធ្យម",
                          lg: "ធំ",
                          xl: "ធំខ្លាំង",
                          "2xl": "ធំបំផុត",
                        };
                        const isActive = readerFontSize === size;
                        return (
                          <button
                            key={size}
                            onClick={() => setReaderFontSize(size)}
                            className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all duration-200 cursor-pointer ${
                              isActive
                                ? "bg-amber-800 text-stone-100 shadow-sm font-black"
                                : "text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-850 hover:text-stone-700 dark:hover:text-stone-300"
                            }`}
                          >
                            {labels[size]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                {/* Brief intro note */}
                <div className={`bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 rounded-2xl p-4 mb-8 text-stone-600 dark:text-stone-300 leading-relaxed font-medium transition-all duration-200 ${getParaFontSizeClass()}`}>
                  {activeChapter.description}
                </div>

                {/* Subsections Content */}
                <div className="space-y-10 sm:space-y-12">
                  {activeChapter.subSections.map((sec) => (
                    <section key={sec.id} className="scroll-mt-24">
                      <h3 className="text-sm sm:text-base font-moul text-amber-950 dark:text-amber-300 mb-4 pb-2 border-b border-stone-100 dark:border-stone-850 flex items-center gap-2 leading-normal">
                        <span className="text-amber-800 dark:text-amber-500">•</span>
                        {sec.title}
                      </h3>
                      
                      <div className={`space-y-4 text-stone-700 dark:text-stone-300 leading-[1.85] font-medium transition-all duration-200 ${getParaFontSizeClass()}`}>
                        {sec.content.map((paragraph, pIdx) => {
                          // Style list items dynamically if paragraph starts with • or dash
                          if (paragraph.startsWith("•") || paragraph.startsWith("-")) {
                            return (
                              <p key={pIdx} className="pl-4 sm:pl-6 text-stone-700 dark:text-stone-300 border-l-2 border-amber-500/30 dark:border-amber-500/50">
                                {paragraph}
                              </p>
                            );
                          }
                          return (
                            <p key={pIdx} className="indent-4 sm:indent-6">
                              {paragraph}
                            </p>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>

                {/* Practical Examples (ករណីសិក្សានិងឧទاهرណ៍) */}
                <div className="mt-12 sm:mt-16 bg-slate-100/60 dark:bg-stone-950/40 border border-slate-200/50 dark:border-stone-800 rounded-2xl p-6 sm:p-8 transition-colors duration-300">
                  <div className="flex items-center gap-2.5 mb-6">
                    <div className="w-9 h-9 rounded-xl bg-amber-700/10 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-slate-800 dark:text-stone-200 uppercase tracking-wide">
                      ករណីសិក្សា និងឧទាហរណ៍ជាក់ស្តែង (Practical Case Studies)
                    </h4>
                  </div>

                  {activeChapter.examples.map((ex, exIdx) => (
                    <div key={exIdx} className="space-y-6">
                      <h5 className="font-extrabold text-slate-900 dark:text-stone-100 text-base sm:text-lg border-b border-slate-200/50 dark:border-stone-800 pb-2">
                        {ex.title}
                      </h5>
                      
                      <div className="grid grid-cols-1 gap-6">
                        {/* Scenario Card */}
                        <div 
                          className="bg-white dark:bg-stone-900 border border-y-stone-200/80 dark:border-y-stone-800/80 border-r-stone-200/80 dark:border-r-stone-800/80 border-l-4 border-l-orange-500 p-5 sm:p-6 shadow-[0_4px_16px_rgba(0,0,0,0.035)] dark:shadow-none hover:shadow-[0_8px_24px_rgba(249,115,22,0.06)] dark:hover:bg-stone-850 hover:-translate-y-0.5 transition-all duration-300"
                          style={{ borderRadius: '8px' }}
                        >
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 rounded-full text-xs font-extrabold tracking-wide mb-4">
                            <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                            <span>ស្ថានភាពជួបប្រទះ (The Scenario / Problem)</span>
                          </div>
                          <div className="text-slate-700 dark:text-stone-300 font-medium">
                            {formatCaseStudyText(ex.scenario, "orange")}
                          </div>
                        </div>

                        {/* Solution Card */}
                        <div 
                          className="bg-white dark:bg-stone-900 border border-y-stone-200/80 dark:border-y-stone-800/80 border-r-stone-200/80 dark:border-r-stone-800/80 border-l-4 border-l-emerald-500 p-5 sm:p-6 shadow-[0_4px_16px_rgba(0,0,0,0.035)] dark:shadow-none hover:shadow-[0_8px_24px_rgba(16,185,129,0.06)] dark:hover:bg-stone-850 hover:-translate-y-0.5 transition-all duration-300"
                          style={{ borderRadius: '8px' }}
                        >
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-extrabold tracking-wide mb-4">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            <span>យុទ្ធសាស្ត្រដោះស្រាយ (The Solution)</span>
                          </div>
                          <div className="text-slate-700 dark:text-stone-300 font-medium">
                            {formatCaseStudyText(ex.solution, "green")}
                          </div>
                        </div>

                        {/* Key Takeaway Card */}
                        <div 
                          className="bg-white dark:bg-stone-900 border border-y-stone-200/80 dark:border-y-stone-800/80 border-r-stone-200/80 dark:border-r-stone-800/80 border-l-4 border-l-indigo-500 p-5 sm:p-6 shadow-[0_4px_16px_rgba(0,0,0,0.035)] dark:shadow-none hover:shadow-[0_8px_24px_rgba(99,102,241,0.06)] dark:hover:bg-stone-850 hover:-translate-y-0.5 transition-all duration-300"
                          style={{ borderRadius: '8px' }}
                        >
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-extrabold tracking-wide mb-4">
                            <Lightbulb className="w-3.5 h-3.5 text-indigo-500" />
                            <span>មេរៀនជាយុទ្ធសាស្ត្រ (Key Takeaway)</span>
                          </div>
                          <div className="text-indigo-950 dark:text-indigo-300 font-bold italic bg-indigo-50/30 dark:bg-indigo-950/20 p-3 sm:p-4 rounded-lg border border-indigo-100/50 dark:border-indigo-900/40">
                            {formatCaseStudyText(ex.takeaway, "indigo")}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Discussion Questions Board (សំណួរពិភាក្សាសង្ខេប) */}
                <div className="mt-12 border-t border-stone-200 dark:border-stone-800 pt-10">
                  <div className="flex items-center gap-2.5 mb-6">
                    <MessageSquare className="w-5 h-5 text-amber-800 dark:text-amber-400" />
                    <h4 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 uppercase">
                      សំណួរសម្រាប់ពិភាក្សា និងកត់ត្រាគំនិត
                    </h4>
                  </div>

                  <p className="text-xs text-stone-500 dark:text-stone-400 mb-6 font-medium">
                    សំណួរខាងក្រោមជួយឱ្យលោកអ្នកអនុវត្តការគិតស៊ីជម្រៅក្នុងស្ថាប័នរបស់ខ្លួន។ ចម្លើយរបស់លោកអ្នកនឹងត្រូវរក្សាទុកដោយស្វ័យប្រវត្តិក្នុងប្រព័ន្ធស្វែងយល់ផ្ទាល់ខ្លួន។
                  </p>

                  <div className="space-y-6">
                    {activeChapter.discussionQuestions.map((dq, dqIdx) => {
                      const isSaved = !!progress.discussionAnswers[dq.id];
                      return (
                        <div key={dq.id} className="bg-stone-50 dark:bg-stone-950 border border-stone-200/60 dark:border-stone-800/80 p-5 rounded-2xl space-y-3">
                          <p className="text-xs font-bold text-amber-800 dark:text-amber-400 font-mono">សំនួរទី {dqIdx + 1}</p>
                          <p className={`text-stone-900 dark:text-stone-100 font-bold leading-relaxed transition-all duration-200 ${getParaFontSizeClass()}`}>
                            {dq.question}
                          </p>
                          <div className={`bg-stone-100 dark:bg-stone-900 p-3 rounded-lg border border-stone-200/40 dark:border-stone-800 leading-relaxed font-medium transition-all duration-200 ${getSmallFontSizeClass()}`}>
                            💡 {dq.guidelines}
                          </div>
                          
                          {/* Textarea */}
                          <div className="space-y-2 mt-3">
                            <textarea
                              rows={3}
                              placeholder="សរសេរការយល់ឃើញ ឬចម្លើយផ្ទាល់ខ្លួនរបស់អ្នកនៅទីនេះ..."
                              value={tempAnswers[dq.id] || ""}
                              onChange={(e) => setTempAnswers(prev => ({ ...prev, [dq.id]: e.target.value }))}
                              className={`w-full text-stone-800 dark:text-stone-100 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 focus:outline-none focus:border-amber-600 bg-white dark:bg-stone-900 transition-all duration-200 ${getParaFontSizeClass()}`}
                            ></textarea>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-stone-400 dark:text-stone-550 font-mono">
                                {isSaved ? "✓ បានរក្សាទុកក្នុងទិន្នន័យ" : "✏ មិនទាន់រក្សាទុក"}
                              </span>
                              <button
                                onClick={() => handleSaveDiscussionAnswer(dq.id)}
                                className="bg-amber-800 hover:bg-amber-900 text-stone-100 px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow"
                              >
                                <Send className="w-3 h-3" />
                                រក្សាទុក
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Next/Prev Chapter Footer Navigation */}
                <div className="mt-16 pt-8 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  {activeChapter.number > 1 ? (
                    <button
                      onClick={() => {
                        const prevCh = chapters.find(c => c.number === activeChapter.number - 1);
                        if (prevCh) setActiveChapterId(prevCh.id);
                      }}
                      className="text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      ជំពូកមុន៖ {chapters.find(c => c.number === activeChapter.number - 1)?.title.substring(0, 15)}...
                    </button>
                  ) : (
                    <div></div>
                  )}

                  {activeChapter.number < totalChapters ? (
                    <button
                      onClick={() => {
                        const nextCh = chapters.find(c => c.number === activeChapter.number + 1);
                        if (nextCh) setActiveChapterId(nextCh.id);
                      }}
                      className="text-amber-800 dark:text-amber-400 hover:text-amber-950 dark:hover:text-amber-300 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition ml-auto"
                    >
                      ជំពូកបន្ទាប់៖ {chapters.find(c => c.number === activeChapter.number + 1)?.title.substring(0, 15)}...
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentTab("quiz")}
                      className="bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow"
                    >
                      <Award className="w-4 h-4 text-amber-300" />
                      ធ្វើតេស្តសមត្ថភាពចុងក្រោយ
                    </button>
                  )}
                </div>

              </div>
            </motion.div>
          </AnimatePresence>
        </article>
          </motion.div>
        )}


        {/* 3. INTERACTIVE QUIZ TAB */}
        {currentTab === "quiz" && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="max-w-3xl mx-auto px-4 sm:px-6 py-10"
          >
            <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-6 sm:p-10 shadow-md transition-colors duration-300">
              
              {/* Header */}
              <div className="text-center mb-8 border-b border-stone-100 dark:border-stone-800 pb-6">
                <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
                  <Award className="w-6 h-6" />
                </div>
                <h2 className="text-base sm:text-xl font-moul text-amber-950 dark:text-amber-300 leading-normal tracking-wide">តេស្តសមត្ថភាពជាឌីជីថល</h2>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-2 font-medium">
                  វាស់ស្ទង់ការយល់ដឹងរបស់អ្នកលើមេរៀនយុទ្ធសាស្ត្រដឹកនាំ និងគ្រប់គ្រងបុគ្គលិកទាំង ៤ជំពូក។
                </p>
              </div>

              {/* Ensure userName is provided first for certificate generation */}
              {!userName && !quizSubmitted && (
                <div className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 max-w-md mx-auto text-center space-y-4">
                  <div className="text-amber-700 dark:text-amber-400 flex justify-center">
                    <User className="w-10 h-10" />
                  </div>
                  <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm sm:text-base">សូមបញ្ចូលឈ្មោះរបស់អ្នកជាមុនសិន</h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-medium">
                    ឈ្មោះរបស់អ្នកនឹងត្រូវយកទៅបោះពុម្ភជាផ្លូវការនៅលើ 'វិញ្ញាបនបត្រឌីជីថល' ពេលដែលលោកអ្នកបញ្ចប់ការធ្វើតេស្តដោយជោគជ័យ។
                  </p>
                  <form onSubmit={handleSaveName} className="space-y-3">
                    <input
                      type="text"
                      placeholder="ឧ. គួយ ចាន់រ៉ា"
                      value={inputName}
                      onChange={(e) => setInputName(e.target.value)}
                      className="w-full text-sm text-center p-3 rounded-xl border border-stone-200 dark:border-stone-800 focus:outline-none focus:border-amber-600 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full bg-amber-800 hover:bg-amber-900 text-stone-100 font-bold text-xs py-2.5 rounded-xl transition cursor-pointer"
                    >
                      យល់ព្រម និងចាប់ផ្តើម
                    </button>
                  </form>
                </div>
              )}

              {/* Quiz Lobby */}
              {userName && !quizStarted && !progress.quizScores && (
                <div className="text-center py-6 space-y-6 max-w-md mx-auto">
                  <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
                    សួស្តី <strong className="text-stone-950 dark:text-white">{userName}</strong>! តេស្តនេះរួមមានសំណួរពហុជ្រើសរើសចំនួន <strong>១០ សំណួរ</strong>។ អ្នកត្រូវឆ្លើយឱ្យបានត្រឹមត្រូវយ៉ាងតិច <strong>៧០% (៧ សំណួរ)</strong> ដើម្បីអាចប្រលងជាប់ និងទទួលបានវិញ្ញាបនបត្រ។
                  </p>
                  
                  <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-200/50 dark:border-amber-900/40 text-left space-y-2 text-xs text-stone-600 dark:text-stone-300 font-medium leading-relaxed">
                    <p>• សំណួរត្រូវបានចម្រាញ់ចេញពីខ្លឹមសារស្នូលទាំង ៤ ជំពូក។</p>
                    <p>• មិនមានកំណត់ពេលវេលាឡើយ អ្នកអាចពិចារណាបានច្បាស់លាស់។</p>
                    <p>• រាល់ចម្លើយ និងលទ្ធផលនឹងត្រូវបង្ហាញការបកស្រាយលម្អិត។</p>
                  </div>

                  <button
                    onClick={() => { setQuizStarted(true); }}
                    className="bg-amber-800 hover:bg-amber-900 text-white font-bold text-sm px-8 py-3 rounded-2xl transition duration-150 inline-flex items-center gap-2 shadow-lg shadow-amber-800/10 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    ចាប់ផ្តើមធ្វើតេស្តឥឡូវនេះ
                  </button>
                </div>
              )}

              {/* Active Quiz Question Board */}
              {quizStarted && !quizSubmitted && (
                <div className="space-y-6">
                  {/* Progress Indicator */}
                  <div className="flex justify-between items-center text-xs text-stone-400 font-mono">
                    <span>សំណួរទី {currentQuestionIndex + 1} នៃ {quizQuestions.length}</span>
                    <span className="text-amber-800 dark:text-amber-400 font-bold">{Math.round(((currentQuestionIndex + 1) / quizQuestions.length) * 100)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-600 transition-all duration-300" style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}></div>
                  </div>

                  {/* Question Box */}
                  <div className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 p-5 rounded-2xl">
                    <h3 className="text-base sm:text-lg font-extrabold text-stone-900 dark:text-stone-100 leading-relaxed">
                      {quizQuestions[currentQuestionIndex].question}
                    </h3>
                  </div>

                  {/* Options List */}
                  <div className="space-y-3">
                    {quizQuestions[currentQuestionIndex].options.map((option, oIdx) => {
                      const qId = quizQuestions[currentQuestionIndex].id;
                      const isSelected = selectedAnswers[qId] === oIdx;
                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectQuizAnswer(qId, oIdx)}
                          className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm font-semibold transition flex items-center justify-between ${
                            isSelected
                              ? "bg-amber-50 dark:bg-amber-950/40 border-amber-600 dark:border-amber-500 text-amber-900 dark:text-amber-200"
                              : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-850 text-stone-700 dark:text-stone-300"
                          }`}
                        >
                          <span>{option}</span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? "border-amber-700 bg-amber-700" : "border-stone-300 dark:border-stone-700"
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Question Navigation Footer */}
                  <div className="flex justify-between items-center pt-4 border-t border-stone-100 mt-6">
                    <button
                      onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                      disabled={currentQuestionIndex === 0}
                      className="px-4 py-2 text-xs font-bold text-stone-500 disabled:opacity-30 flex items-center gap-1.5"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      ត្រឡប់ក្រោយ
                    </button>

                    {currentQuestionIndex < quizQuestions.length - 1 ? (
                      <button
                        onClick={() => {
                          const qId = quizQuestions[currentQuestionIndex].id;
                          if (selectedAnswers[qId] === undefined) {
                            showToast("សូមជ្រើសរើសចម្លើយមួយសិន!");
                            return;
                          }
                          setCurrentQuestionIndex(prev => prev + 1);
                        }}
                        className="bg-stone-900 hover:bg-stone-800 text-stone-100 px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                      >
                        សំណួរបន្ទាប់
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitQuiz}
                        className="bg-amber-800 hover:bg-amber-900 text-white px-6 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                      >
                        <CheckCircle className="w-4 h-4" />
                        បញ្ជូនវិញ្ញាសា
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Quiz Completed Results Screen (Certificate & Review Details) */}
              {(quizSubmitted || progress.quizScores) && (
                <div className="space-y-10">
                  
                  {/* Score Card Banner */}
                  {(() => {
                    const finalScore = progress.quizScores?.score ?? tempQuizScore;
                    const finalTotal = progress.quizScores?.total ?? quizQuestions.length;
                    const passPercent = Math.round((finalScore / finalTotal) * 100);
                    const isPassed = passPercent >= 70;

                    return (
                      <div className="text-center py-6">
                        
                        {/* Certificate of Achievement Display */}
                        {isPassed ? (
                          <div className="space-y-4">
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              id="digital-certificate-print"
                              className="bg-stone-50 dark:bg-stone-950 border-8 border-amber-600/30 dark:border-amber-800/40 p-6 sm:p-12 rounded-3xl shadow-xl relative overflow-hidden text-center max-w-2xl mx-auto border-double bg-[radial-gradient(ellipse_at_top_left,rgba(251,191,36,0.06),transparent_50%)] transition-colors duration-300"
                            >
                              {/* Thin classical border inside */}
                              <div className="absolute inset-4 border border-amber-800/10 dark:border-amber-500/20 rounded-2xl pointer-events-none"></div>
                              
                              {/* Classic corner ornaments */}
                              <div className="absolute top-6 left-6 w-6 h-6 border-t-2 border-l-2 border-amber-800/20 pointer-events-none"></div>
                              <div className="absolute top-6 right-6 w-6 h-6 border-t-2 border-r-2 border-amber-800/20 pointer-events-none"></div>
                              <div className="absolute bottom-6 left-6 w-6 h-6 border-b-2 border-l-2 border-amber-800/20 pointer-events-none"></div>
                              <div className="absolute bottom-6 right-6 w-6 h-6 border-b-2 border-r-2 border-amber-800/20 pointer-events-none"></div>

                              <span className="text-[10px] uppercase tracking-[0.25em] font-extrabold text-amber-800 dark:text-amber-400 font-mono block relative z-10">វិញ្ញាបនបត្រឌីជីថល</span>
                              
                              <h2 className="text-base sm:text-xl font-moul text-amber-950 dark:text-amber-300 mt-4 relative z-10 leading-normal font-bold">
                                លិខិតបញ្ជាក់ការបញ្ចប់ការសិក្សា
                              </h2>
                              
                              <p className="text-[9px] text-stone-500 dark:text-stone-400 font-bold italic mt-1 font-mono tracking-wide relative z-10">Certificate of Leadership Excellence Completion</p>

                              <p className="text-xs text-stone-500 dark:text-stone-400 mt-6 leading-relaxed relative z-10">
                                វិញ្ញាបនបត្រនេះត្រូវបានប្រគល់ជូនដើម្បីបញ្ជាក់ថា៖
                              </p>

                              {/* Student Name */}
                              <div className="my-4 relative z-10">
                                <h3 className="text-lg sm:text-2xl font-display text-stone-900 dark:text-stone-100 border-b border-amber-800/20 dark:border-amber-600/30 pb-3.5 inline-block px-10 tracking-wide uppercase font-bold">
                                  {userName || "អ្នកសិក្សាឆ្នើម"}
                                </h3>
                              </div>

                              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-md mx-auto leading-[1.8] font-medium relative z-10">
                                បានបញ្ចប់ដោយជោគជ័យនូវការសិក្សាសៀវភៅឌីជីថលអន្តរកម្មស្តីពី <br />
                                <strong className="text-stone-950 dark:text-white text-sm sm:text-base">«យុទ្ធសាស្ត្រសម្រាប់ការគ្រប់គ្រង និងដឹកនាំបុគ្គលិក»</strong> <br />
                                និងទទួលបានពិន្ទុតេស្តយ៉ាងគាប់ប្រសើរចំនួន <strong className="text-amber-800 dark:text-amber-400">{finalScore} លើ {finalTotal} ({passPercent}%)</strong>។
                              </p>

                              {/* Signatures & Golden Rosette Seal */}
                              <div className="mt-12 pt-6 border-t border-stone-200/60 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-6 max-w-lg mx-auto relative z-10">
                                <div className="text-center sm:text-left space-y-1">
                                  <span className="text-[10px] text-stone-400 dark:text-stone-500 block font-bold">ថ្ងៃខែឆ្នាំប្រឡង</span>
                                  <span className="text-xs font-extrabold text-stone-800 dark:text-stone-200 font-mono">{progress.quizScores?.date || new Date().toLocaleDateString("km-KH")}</span>
                                </div>

                                {/* Beautiful Gold Stamp Seal */}
                                <div className="relative flex items-center justify-center">
                                  <svg className="w-16 h-16 text-amber-500 animate-[spin_20s_linear_infinite]" viewBox="0 0 100 100">
                                    <path id="curve" fill="none" d="M 12,50 A 38,38 0 1,1 88,50 A 38,38 0 1,1 12,50" />
                                    <text className="text-[8px] font-bold fill-amber-700 dark:fill-amber-400 tracking-wider">
                                      <textPath href="#curve" startOffset="0%">
                                        • EXCELLENCE IN LEADERSHIP • CHAMPION OF CULTURE
                                      </textPath>
                                    </text>
                                  </svg>
                                  <div className="absolute w-10 h-10 rounded-full bg-amber-500 border border-amber-300 shadow-md flex items-center justify-center text-white">
                                    <Award className="w-5 h-5 text-amber-950" />
                                  </div>
                                  {/* Ribbons hanging down */}
                                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none opacity-80">
                                    <div className="w-2.5 h-6 bg-amber-600 clip-ribbon transform rotate-12"></div>
                                    <div className="w-2.5 h-6 bg-amber-500 clip-ribbon transform -rotate-12"></div>
                                  </div>
                                </div>

                                <div className="text-center sm:text-right space-y-1">
                                  <span className="text-[10px] text-stone-400 dark:text-stone-500 block font-bold">អ្នករៀបរៀងសៀវភៅ</span>
                                  <span className="text-xs font-black text-amber-900 dark:text-amber-400 font-mono">គួយ ចាន់រ៉ា</span>
                                </div>
                              </div>
                            </motion.div>

                            {/* Print / Save Action */}
                            <div className="flex justify-center">
                              <button
                                onClick={() => {
                                  const printContents = document.getElementById("digital-certificate-print")?.outerHTML;
                                  if (printContents) {
                                    const win = window.open("", "_blank");
                                    if (win) {
                                      win.document.write(`
                                        <html>
                                          <head>
                                            <title>Certificate - ${userName}</title>
                                            <script src="https://cdn.tailwindcss.com"></script>
                                            <style>
                                              body { margin: 2rem; display: flex; justify-center; align-items: center; background: #fff; font-family: sans-serif; }
                                              .clip-ribbon { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%); }
                                            </style>
                                          </head>
                                          <body>
                                            <div style="width: 100%; max-width: 650px;">
                                              ${printContents}
                                            </div>
                                            <script>
                                              setTimeout(() => { window.print(); }, 500);
                                            </script>
                                          </body>
                                        </html>
                                      `);
                                      win.document.close();
                                    } else {
                                      window.print();
                                    }
                                  }
                                }}
                                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow shadow-amber-600/10 cursor-pointer"
                              >
                                <Sparkles className="w-4 h-4" />
                                ទាញយក ឬបោះពុម្ភវិញ្ញាបនបត្រ
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-3xl p-6 sm:p-8 max-w-md mx-auto text-center space-y-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-350 flex items-center justify-center mx-auto">
                              <X className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-red-950 dark:text-red-300 text-base">ការធ្វើតេស្តមិនទាន់ឆ្លងកាត់</h3>
                            <p className="text-xs text-red-900/80 dark:text-red-400 leading-relaxed font-medium">
                              លទ្ធផលរបស់លោកអ្នកគឺ <strong>{finalScore} លើ {finalTotal} ({passPercent}%)</strong>។ លោកអ្នកត្រូវឆ្លើយឱ្យបានត្រឹមត្រូវយ៉ាងតិច <strong>៧០%</strong> ដើម្បីអាចទទួលបានវិញ្ញាបនបត្រឌីជីថល។ កុំបារម្ភ! លោកអ្នកអាចអានមេរៀនឡើងវិញ និងសាកល្បងសារជាថ្មី។
                            </p>
                          </div>
                        )}

                        {/* Action Panel */}
                        <div className="mt-8 flex justify-center gap-3">
                          <button
                            onClick={handleResetQuiz}
                            className="bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow cursor-pointer"
                          >
                            <RotateCcw className="w-4 h-4" />
                            ធ្វើតេស្តឡើងវិញ
                          </button>
                          <button
                            onClick={() => { setCurrentTab("chapters"); }}
                            className="bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200/80 dark:border-stone-700 text-stone-700 dark:text-stone-200 font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <BookOpen className="w-4 h-4" />
                            ត្រឡប់ទៅអានសៀវភៅ
                          </button>
                        </div>

                      </div>
                    );
                  })()}

                  {/* Detailed quiz answer sheet review */}
                  <div className="space-y-6">
                    <h3 className="font-extrabold text-stone-900 dark:text-stone-100 text-base border-b border-stone-100 dark:border-stone-800 pb-3">
                      សន្លឹកកិច្ចការ និងការបកស្រាយចម្លើយលម្អិត៖
                    </h3>

                    <div className="space-y-6">
                      {quizQuestions.map((q, idx) => {
                        const userAns = selectedAnswers[q.id];
                        const isCorrect = userAns === q.correctIndex;
                        return (
                          <div key={q.id} className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 space-y-3 text-left">
                            <div className="flex justify-between items-start gap-3">
                              <span className="text-xs font-bold text-stone-400 dark:text-stone-500 font-mono">សំណួរទី {idx + 1}</span>
                              {isCorrect ? (
                                <span className="bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-350 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shrink-0">
                                  <Check className="w-3 h-3" /> ត្រឹមត្រូវ
                                </span>
                              ) : (
                                <span className="bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-350 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shrink-0">
                                  <X className="w-3 h-3" /> ខុសឆ្គង
                                </span>
                              )}
                            </div>

                            <p className="font-extrabold text-stone-900 dark:text-stone-100 text-sm sm:text-base leading-relaxed">
                              {q.question}
                            </p>

                            <div className="space-y-1.5 text-xs text-stone-600 dark:text-stone-400 font-medium">
                              <p>ចម្លើយរបស់អ្នក៖ <span className={isCorrect ? "text-green-700 dark:text-green-400 font-bold" : "text-red-700 dark:text-red-400 font-bold"}>
                                {userAns !== undefined ? q.options[userAns] : "មិនទាន់ឆ្លើយ"}
                              </span></p>
                              {!isCorrect && (
                                <p>ចម្លើយត្រឹមត្រូវ៖ <span className="text-green-700 dark:text-green-400 font-bold">{q.options[q.correctIndex]}</span></p>
                              )}
                            </div>

                            {/* Explanation box */}
                            <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/30 p-3.5 rounded-xl text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                              <strong className="text-amber-900 dark:text-amber-400 block mb-1">💡 ការពន្យល់បកស្រាយ៖</strong>
                              {q.explanation}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

            </div>
          </motion.div>
        )}



        {/* 5. CASE STUDIES TAB */}
        {currentTab === "cases" && (
          <motion.div
            key="cases"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            {(() => {
          const allCaseStudies = chapters.flatMap((c) => 
            c.examples.map((ex) => ({
              ...ex,
              chapterNumber: c.number,
              chapterTitle: c.title,
              chapterId: c.id,
              discussionQuestions: c.discussionQuestions
            }))
          );
          const activeCase = allCaseStudies[activeCaseIndex] || allCaseStudies[0];

          return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-stone-100/60 dark:bg-stone-900/40 rounded-3xl mt-4 border border-stone-200/50 dark:border-stone-800/50 transition-colors duration-300">
              
              {/* Header section with description */}
              <div className="text-center max-w-3xl mx-auto space-y-3">
                <span className="inline-flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-400 px-3.5 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  ករណីសិក្សាជាក់ស្តែងក្នុងបរិបទកម្ពុជា
                </span>
                <h2 className="text-lg sm:text-2xl font-moul text-stone-950 dark:text-stone-100 leading-normal">
                  បណ្ណាល័យករណីសិក្សា និងយុទ្ធសាស្ត្រដឹកនាំ
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed font-medium">
                  សូមជ្រើសរើសករណីសិក្សាខាងក្រោម ដើម្បីស្វែងយល់លម្អិតអំពីវិបត្តិជាក់ស្តែងក្នុងស្ថាប័ន វិធីសាស្ត្រដោះស្រាយដ៏មានប្រសិទ្ធភាព និងមេរៀនគន្លឹះដកស្រង់ចេញពីបទពិសោធន៍។
                </p>
              </div>

              {/* Responsive Selector Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {allCaseStudies.map((cs, idx) => {
                  const isActive = idx === activeCaseIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveCaseIndex(idx)}
                      className={`text-left p-4.5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between gap-3 h-36 ${
                        isActive
                          ? "bg-amber-900 border-amber-900 text-stone-100 shadow-md shadow-amber-900/10 dark:bg-amber-800 dark:border-amber-800"
                          : "bg-white dark:bg-stone-950 border-stone-200/80 dark:border-stone-800 text-stone-800 dark:text-stone-200 hover:border-amber-700/60 hover:-translate-y-1 hover:shadow-md"
                      }`}
                    >
                      <div className="space-y-1">
                        <span className={`text-[9px] uppercase font-bold tracking-widest font-mono ${isActive ? "text-amber-300" : "text-amber-800 dark:text-amber-400"}`}>
                          ជំពូកទី {cs.chapterNumber}
                        </span>
                        <h4 className="text-xs sm:text-sm font-extrabold line-clamp-2 leading-relaxed">
                          {cs.title.replace("ករណីសិក្សា៖ ", "")}
                        </h4>
                      </div>
                      <span className={`text-[10px] font-bold flex items-center gap-1 mt-1 ${isActive ? "text-amber-200" : "text-stone-400 dark:text-stone-500"}`}>
                        អានលម្អិត <ChevronRight className="w-3 h-3" />
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Case Study Reading Board with exact user requirements */}
              {activeCase && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  
                  {/* Case Study Header Card */}
                  <div className="bg-gradient-to-r from-amber-900 to-amber-950 dark:from-stone-950 dark:to-stone-900 text-white p-6 sm:p-8 rounded-3xl shadow-md border border-amber-800/10 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.05),transparent_40%)]"></div>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-amber-400 font-mono">
                      CASE STUDY READER • CHAPTER {activeCase.chapterNumber}
                    </span>
                    <h3 className="text-sm sm:text-base font-moul text-stone-100 mt-2 leading-normal">
                      {activeCase.title}
                    </h3>
                    <p className="text-[10px] text-stone-300 font-semibold mt-1 font-mono italic">
                      {activeCase.chapterTitle}
                    </p>
                  </div>

                  {/* Problem & Solution Cards with 8px radius, Drop shadow, Accent colors and high Khmer readability */}
                  <div className="grid grid-cols-1 gap-6">
                    
                    {/* Scenario/Problem Section - Orange Accent */}
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="bg-white dark:bg-stone-950 border border-y-stone-200/80 dark:border-y-stone-800/80 border-r-stone-200/80 dark:border-r-stone-800/80 border-l-4 border-l-orange-500 p-6 sm:p-8 shadow-[0_4px_16px_rgba(0,0,0,0.035)] hover:shadow-[0_8px_24px_rgba(249,115,22,0.05)] transition-all duration-300"
                      style={{ borderRadius: "8px" }}
                    >
                      <div className="flex items-center gap-2 mb-4.5 border-b border-stone-100 dark:border-stone-900 pb-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                            ស្ថានភាពជួបប្រទះ (The Scenario / Problem)
                          </h4>
                          <span className="text-[9px] text-stone-400 dark:text-stone-500 block font-mono">IDENTIFIED VULNERABILITY</span>
                        </div>
                      </div>
                      
                      <div className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 font-medium leading-[1.85] space-y-3">
                        {formatCaseStudyText(activeCase.scenario, "orange")}
                      </div>
                    </motion.div>

                    {/* Solution Section - Green Accent */}
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                      className="bg-white dark:bg-stone-950 border border-y-stone-200/80 dark:border-y-stone-800/80 border-r-stone-200/80 dark:border-r-stone-800/80 border-l-4 border-l-emerald-500 p-6 sm:p-8 shadow-[0_4px_16px_rgba(0,0,0,0.035)] hover:shadow-[0_8px_24px_rgba(16,185,129,0.05)] transition-all duration-300"
                      style={{ borderRadius: "8px" }}
                    >
                      <div className="flex items-center gap-2 mb-4.5 border-b border-stone-100 dark:border-stone-900 pb-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                            យុទ្ធសាស្ត្រដោះស្រាយ (The Solution)
                          </h4>
                          <span className="text-[9px] text-stone-400 dark:text-stone-500 block font-mono">STRATEGIC RESOLUTION</span>
                        </div>
                      </div>
                      
                      <div className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 font-medium leading-[1.85] space-y-3">
                        {formatCaseStudyText(activeCase.solution, "green")}
                      </div>
                    </motion.div>

                    {/* Key Takeaway Section - Indigo Accent */}
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                      className="bg-white dark:bg-stone-950 border border-y-stone-200/80 dark:border-y-stone-800/80 border-r-stone-200/80 dark:border-r-stone-800/80 border-l-4 border-l-indigo-500 p-6 sm:p-8 shadow-[0_4px_16px_rgba(0,0,0,0.035)] hover:shadow-[0_8px_24px_rgba(99,102,241,0.05)] transition-all duration-300"
                      style={{ borderRadius: "8px" }}
                    >
                      <div className="flex items-center gap-2 mb-4 px-1">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                          <Lightbulb className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                            មេរៀនជាយុទ្ធសាស្ត្រ (Key Takeaway)
                          </h4>
                          <span className="text-[9px] text-stone-400 dark:text-stone-500 block font-mono">EXECUTIVE SUMMARY</span>
                        </div>
                      </div>
                      
                      <div className="text-indigo-950 dark:text-indigo-300 font-bold italic bg-indigo-50/40 dark:bg-indigo-950/20 p-4 sm:p-5 rounded-xl border border-indigo-100/50 dark:border-indigo-900/40 leading-[1.85] text-xs sm:text-sm">
                        {formatCaseStudyText(activeCase.takeaway, "indigo")}
                      </div>
                    </motion.div>

                  </div>

                  {/* Reflection Panel & Case Study Discussion Questions */}
                  {activeCase.discussionQuestions && activeCase.discussionQuestions.length > 0 && (
                    <div className="bg-white dark:bg-stone-950 border border-stone-200/80 dark:border-stone-800 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6 mt-6">
                      <div className="flex items-center gap-2 border-b border-stone-100 dark:border-stone-900 pb-3">
                        <MessageSquare className="w-5 h-5 text-amber-800 dark:text-amber-400" />
                        <div>
                          <h4 className="font-extrabold text-stone-900 dark:text-stone-100 text-sm sm:text-base">
                            សំណួរពិភាក្សា និងការឆ្លុះបញ្ចាំងគំនិត (Case Reflection Hub)
                          </h4>
                          <span className="text-[9px] text-stone-400 dark:text-stone-500 font-mono block">TEST YOUR STRATEGIC JUDGMENT</span>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {activeCase.discussionQuestions.map((q) => {
                          const savedAnswer = progress.discussionAnswers[q.id] || "";
                          const currentTemp = tempAnswers[q.id] !== undefined ? tempAnswers[q.id] : savedAnswer;

                          return (
                            <div key={q.id} className="bg-stone-50 dark:bg-stone-900/30 border border-stone-200/50 dark:border-stone-800/60 p-4 sm:p-5 rounded-2xl space-y-4">
                              <div className="space-y-1">
                                <span className="text-[9px] text-amber-800 dark:text-amber-400 font-black font-mono">QUESTION</span>
                                <p className="text-xs sm:text-sm font-extrabold text-stone-800 dark:text-stone-200 leading-relaxed">
                                  {q.question}
                                </p>
                              </div>

                              {q.guidelines && (
                                <div className="text-[10px] text-stone-500 dark:text-stone-400 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100/30 dark:border-amber-900/20 px-3.5 py-2.5 rounded-xl flex items-start gap-1.5 leading-relaxed">
                                  <Info className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                                  <span>
                                    <strong className="font-bold text-amber-800 dark:text-amber-500">គន្លឹះគិត៖</strong> {q.guidelines}
                                  </span>
                                </div>
                              )}

                              {/* Reflection Input Form */}
                              <div className="space-y-2 pt-2">
                                <label className="text-[10px] text-stone-400 block font-bold">កំណត់ត្រាចម្លើយ ឬមតិយោបល់របស់អ្នក៖</label>
                                <textarea
                                  value={currentTemp}
                                  onChange={(e) => {
                                    setTempAnswers((prev) => ({
                                      ...prev,
                                      [q.id]: e.target.value
                                    }));
                                  }}
                                  placeholder="សូមសរសេរការយល់ឃើញ ឬចម្លើយឆ្លុះបញ្ចាំងរបស់លោកអ្នកនៅទីនេះ..."
                                  rows={3}
                                  className="w-full p-3 text-xs border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:border-amber-600 dark:focus:border-amber-500 bg-white dark:bg-stone-950 text-stone-800 dark:text-stone-200 leading-relaxed font-medium shadow-inner"
                                />
                                <div className="flex justify-end">
                                  <button
                                    onClick={() => {
                                      const ansText = currentTemp.trim();
                                      const updatedAnswers = {
                                        ...progress.discussionAnswers,
                                        [q.id]: ansText
                                      };
                                      const updatedProgress = {
                                        ...progress,
                                        discussionAnswers: updatedAnswers
                                      };
                                      setProgress(updatedProgress);
                                      localStorage.setItem("ldr_user_progress", JSON.stringify(updatedProgress));
                                      showToast("✓ កត់ត្រាគំនិតឆ្លុះបញ្ចាំងជោគជ័យ!");
                                    }}
                                    className="bg-amber-800 hover:bg-amber-900 text-stone-100 font-extrabold text-[10px] sm:text-xs px-4 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    រក្សាទុកកំណត់ត្រា
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          );
        })()}
          </motion.div>
        )}


        {/* 4. LEARNING PROGRESS & NOTES TRACKER */}
        {currentTab === "progress" && (
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10"
          >
            
            {/* Page Header */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm transition-colors duration-300">
              <div className="flex items-center gap-4">
                <div className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 p-3 rounded-2xl">
                  <BookMarked className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-moul text-amber-950 dark:text-amber-300 leading-normal">ទិន្នន័យសិក្សាផ្ទាល់ខ្លួន</h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-medium">
                    តាមដានសកម្មភាពអាន សៀវភៅចំណាំ គំនិតពិភាក្សា និងវិញ្ញាបនបត្រឌីជីថលរបស់អ្នក។
                  </p>
                </div>
              </div>

              {/* Enter Name Form if not set */}
              {!userName ? (
                <form onSubmit={handleSaveName} className="flex gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="បញ្ចូលឈ្មោះរបស់អ្នក..."
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    className="p-2.5 rounded-xl text-xs border border-stone-200 dark:border-stone-800 focus:outline-none focus:border-amber-600 bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-100 w-full sm:w-48 text-center"
                    required
                  />
                  <button type="submit" className="bg-amber-800 hover:bg-amber-900 text-stone-100 font-bold text-xs px-4 py-2.5 rounded-xl transition shrink-0 cursor-pointer">
                    រក្សាទុក
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 block">អ្នកសិក្សា៖</span>
                    <span className="text-sm font-extrabold text-stone-900 dark:text-stone-100">{userName}</span>
                  </div>
                  <button
                    onClick={handleResetName}
                    className="text-stone-400 hover:text-red-700 p-1.5 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition"
                    title="ប្តូរឈ្មោះអ្នកសិក្សា"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              {/* Stat 1 */}
              <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-5 shadow-sm text-center transition-colors duration-300">
                <span className="text-xs text-stone-400 dark:text-stone-500 block font-medium">ជំពូកដែលបានអានរួច</span>
                <span className="text-3xl font-black text-stone-900 dark:text-stone-100 block my-1.5">{completedCount} / {totalChapters}</span>
                <span className="text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold">
                  {progressPercent}% សម្រេចបាន
                </span>
              </div>

              {/* Stat 2 */}
              <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-5 shadow-sm text-center transition-colors duration-300">
                <span className="text-xs text-stone-400 dark:text-stone-500 block font-medium">សំណួរពិភាក្សាដែលបានឆ្លើយ</span>
                <span className="text-3xl font-black text-stone-900 dark:text-stone-100 block my-1.5">
                  {Object.keys(progress.discussionAnswers).length}
                </span>
                <span className="text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold">
                  កត់ត្រាទុកក្នុងប្រព័ន្ធ
                </span>
              </div>

              {/* Stat 3 */}
              <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-5 shadow-sm text-center transition-colors duration-300">
                <span className="text-xs text-stone-400 dark:text-stone-500 block font-medium">លទ្ធផលតេស្តចុងក្រោយ</span>
                <span className="text-3xl font-black text-stone-900 dark:text-stone-100 block my-1.5">
                  {progress.quizScores ? `${progress.quizScores.score} / ${progress.quizScores.total}` : "—"}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  progress.quizScores && (progress.quizScores.score / progress.quizScores.total >= 0.7)
                    ? "bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-350"
                    : "bg-stone-100 dark:bg-stone-800 text-stone-505 dark:text-stone-400"
                }`}>
                  {progress.quizScores ? (progress.quizScores.score / progress.quizScores.total >= 0.7 ? "ជាប់ជោគជ័យ ✓" : "មិនទាន់ជាប់") : "មិនទាន់ធ្វើតេស្ត"}
                </span>
              </div>

            </div>

            {/* Bookmarked Chapters List */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-6 shadow-sm transition-colors duration-300">
              <h3 className="font-extrabold text-stone-900 dark:text-stone-100 text-base mb-4 flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-amber-800 dark:text-amber-400" />
                ទំព័រសៀវភៅដែលអ្នកបានចំណាំទុក ({progress.bookmarks.length})
              </h3>
              
              {progress.bookmarks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {chapters.filter(c => progress.bookmarks.includes(c.id)).map(c => (
                    <div key={c.id} className="border border-stone-100 dark:border-stone-850 rounded-xl p-4 flex justify-between items-center bg-stone-50/50 dark:bg-stone-950/50">
                      <div>
                        <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500">ជំពូកទី {c.number}</span>
                        <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm truncate mt-0.5">{c.title}</h4>
                      </div>
                      <button
                        onClick={() => {
                          setActiveChapterId(c.id);
                          setCurrentTab("chapters");
                        }}
                        className="bg-amber-800 hover:bg-amber-900 text-stone-100 font-bold text-xs px-3.5 py-1.5 rounded-lg transition shrink-0 shadow cursor-pointer"
                      >
                        អានបន្ត
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-400 dark:text-stone-500 py-6 text-center">លោកអ្នកមិនទាន់មានទំព័រចំណាំណាមួយនៅឡើយទេ!</p>
              )}
            </div>

            {/* Saved Discussion Notes Review Sheet */}
            <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-6 transition-colors duration-300">
              <h3 className="font-extrabold text-stone-900 dark:text-stone-100 text-base flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
                <MessageSquare className="w-5 h-5 text-amber-800 dark:text-amber-400" />
                កំណត់ត្រាគំនិត និងចម្លើយពិភាក្សារបស់អ្នក
              </h3>

              {Object.keys(progress.discussionAnswers).length > 0 ? (
                <div className="space-y-6">
                  {chapters.map(c => {
                    const chapterQuestions = c.discussionQuestions.filter(q => progress.discussionAnswers[q.id]);
                    if (chapterQuestions.length === 0) return null;

                    return (
                      <div key={c.id} className="space-y-4">
                        <div className="border-l-4 border-amber-800 dark:border-amber-600 pl-3">
                          <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm">ជំពូកទី {c.number}៖ {c.title}</h4>
                          <span className="text-[10px] text-stone-400 dark:text-stone-500 block font-mono">{c.englishTitle}</span>
                        </div>

                        <div className="space-y-3.5 pl-4">
                          {chapterQuestions.map(q => (
                            <div key={q.id} className="bg-stone-50 dark:bg-stone-950 border border-stone-200/60 dark:border-stone-850 p-4 rounded-xl space-y-2">
                              <p className="text-xs font-bold text-stone-800 dark:text-stone-200">សំនួរ៖ {q.question}</p>
                              <div className="bg-white dark:bg-stone-900 p-3 rounded-lg border border-stone-100 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-medium italic">
                                " {progress.discussionAnswers[q.id]} "
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-stone-400 dark:text-stone-500 py-6 text-center">លោកអ្នកមិនទាន់បានកត់ត្រាចម្លើយសំនួរពិភាក្សាណាមួយនៅឡើយទេ!</p>
              )}
            </div>
          </motion.div>
        )}

        </AnimatePresence>
      </main>

      {/* Decorative, minimalistic footer */}
      <footer className="bg-stone-950 text-stone-400 border-t border-stone-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs">
          <div>
            <p className="font-bold text-stone-200 text-sm">សៀវភៅDigital យុទ្ធសាស្ត្រសម្រាប់ការគ្រប់គ្រង និងដឹកនាំបុគ្គលិក</p>
            <p className="mt-1">រៀបរៀង និងចងក្រងជាអត្ថបទស្រាវជ្រាវដោយ៖ <strong className="text-amber-500 font-bold">គួយ ចាន់រ៉ា</strong></p>
          </div>
          <div className="space-y-1 sm:text-right font-mono">
            <p>រក្សាសិទ្ធិគ្រប់យ៉ាង © ២០២៦</p>
            <p className="text-[10px] text-stone-600">Built as an Interactive Educational Digital Hub</p>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Floating Navigation Dock */}
      <div className="md:hidden fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 20 }}
          className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl border border-stone-200/85 dark:border-stone-800/80 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)] rounded-2xl px-6 py-2.5 flex items-center justify-between gap-6 max-w-sm w-full transition-colors duration-300"
        >
          <button 
            onClick={() => setCurrentTab("home")}
            className={`flex flex-col items-center gap-1 transition-all duration-200 cursor-pointer relative py-0.5 px-2 ${currentTab === "home" ? "text-amber-800 dark:text-amber-400 scale-105" : "text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"}`}
          >
            <BookOpen className="w-5 h-5 z-10" />
            <span className="text-[9px] font-black z-10">ទំព័រដើម</span>
            {currentTab === "home" && (
              <motion.div
                layoutId="activeTabMobile"
                className="absolute inset-0 bg-amber-500/10 dark:bg-amber-500/20 rounded-xl -z-0"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
          
          <button 
            onClick={() => setCurrentTab("chapters")}
            className={`flex flex-col items-center gap-1 transition-all duration-200 cursor-pointer relative py-0.5 px-2 ${currentTab === "chapters" ? "text-amber-800 dark:text-amber-400 scale-105" : "text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"}`}
          >
            <ClipboardList className="w-5 h-5 z-10" />
            <span className="text-[9px] font-black z-10">មាតិកា</span>
            {currentTab === "chapters" && (
              <motion.div
                layoutId="activeTabMobile"
                className="absolute inset-0 bg-amber-500/10 dark:bg-amber-500/20 rounded-xl -z-0"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
          
          <button 
            onClick={() => setCurrentTab("cases")}
            className={`flex flex-col items-center gap-1 transition-all duration-200 cursor-pointer relative py-0.5 px-2 ${currentTab === "cases" ? "text-amber-800 dark:text-amber-400 scale-105" : "text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"}`}
          >
            <Sparkles className="w-5 h-5 z-10" />
            <span className="text-[9px] font-black z-10">ករណីសិក្សា</span>
            {currentTab === "cases" && (
              <motion.div
                layoutId="activeTabMobile"
                className="absolute inset-0 bg-amber-500/10 dark:bg-amber-500/20 rounded-xl -z-0"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
          
          <button 
            onClick={() => setCurrentTab("quiz")}
            className={`flex flex-col items-center gap-1 transition-all duration-200 cursor-pointer relative py-0.5 px-2 ${currentTab === "quiz" ? "text-amber-800 dark:text-amber-400 scale-105" : "text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"}`}
          >
            <Award className="w-5 h-5 z-10" />
            <span className="text-[9px] font-black z-10">តេស្តវាស់</span>
            {currentTab === "quiz" && (
              <motion.div
                layoutId="activeTabMobile"
                className="absolute inset-0 bg-amber-500/10 dark:bg-amber-500/20 rounded-xl -z-0"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
          
          <button 
            onClick={() => setCurrentTab("progress")}
            className={`flex flex-col items-center gap-1 transition-all duration-200 cursor-pointer relative py-0.5 px-2 ${currentTab === "progress" ? "text-amber-800 dark:text-amber-400 scale-105" : "text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"}`}
          >
            <BookMarked className="w-5 h-5 z-10" />
            <span className="text-[9px] font-black z-10">ស្ថិតិ</span>
            {currentTab === "progress" && (
              <motion.div
                layoutId="activeTabMobile"
                className="absolute inset-0 bg-amber-500/10 dark:bg-amber-500/20 rounded-xl -z-0"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        </motion.div>
      </div>

    </div>
  );
}
