import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Swords, 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  Zap,
  AlertTriangle,
  Activity,
  Loader2,
  Target,
  HelpCircle,
  ClipboardList,
  CheckCircle,
  XCircle,
  Minus,
  FileText
} from 'lucide-react';
import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Types
interface Message {
  role: 'bull' | 'bear';
  content: string;
  timestamp: number;
  round: number;
}

interface Verdict {
  winner: 'Bull' | 'Bear' | 'Tie';
  confidence_score: number;
  reasoning: string;
  key_takeaway: string;
}

interface DebatePoint {
  point_number: number;
  point_title: string;
  bull_case: string;
  bear_case: string;
  winner: 'Bull' | 'Bear' | 'Tie';
  rationale: string;
}

interface ModeratorAnalysis {
  points: DebatePoint[];
  bull_wins: number;
  bear_wins: number;
  ties: number;
  closing_notes: string;
}

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '/api');

// The core question being debated
const CORE_QUESTION = {
  title: "Opportunity Validation",
  question: "What is the need and has it been validated?",
  description: "We're determining whether a real, validated, and sufficiently urgent customer need exists. We're looking for evidence of \"problem-solution fit,\" early traction from real customers, and favorable market timing."
};

// Loading phases for the preparation countdown
const LOADING_PHASES = [
  { text: "Retrieving investment memo...", duration: 3000 },
  { text: "Bull is reviewing the opportunity...", duration: 4000 },
  { text: "Preparing opening arguments...", duration: 4000 },
  { text: "Debate starting...", duration: 2000 },
];

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isDebating, setIsDebating] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [prepPhase, setPrepPhase] = useState(0);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [moderatorAnalysis, setModeratorAnalysis] = useState<ModeratorAnalysis | null>(null);
  const [currentSpeaker, setCurrentSpeaker] = useState<'bull' | 'bear' | 'judge' | 'moderator' | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, verdict, moderatorAnalysis]);

  // Handle preparation phase animation
  useEffect(() => {
    if (isPreparing && prepPhase < LOADING_PHASES.length - 1) {
      const timer = setTimeout(() => {
        setPrepPhase(prev => prev + 1);
      }, LOADING_PHASES[prepPhase].duration);
      return () => clearTimeout(timer);
    }
  }, [isPreparing, prepPhase]);

  const startDebate = async () => {
    setIsPreparing(true);
    setPrepPhase(0);
    setMessages([]);
    setVerdict(null);
    setModeratorAnalysis(null);
    setCurrentSpeaker(null);

    try {
      const response = await fetch(`${API_URL}/api/debate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: 'Opportunity Validation' }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      let buffer = '';
      let roundCounter = { bull: 0, bear: 0 };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            
            if (dataStr === '[DONE]') {
              setCurrentSpeaker(null);
              setIsPreparing(false);
              break;
            }
            
            try {
              const data = JSON.parse(dataStr);
              
              // First message received - debate has started
              if (isPreparing) {
                setIsPreparing(false);
                setIsDebating(true);
              }
              
              if (data.type === 'error') {
                console.error('Server error:', data.content);
                continue;
              }
              
              if (data.type === 'judge') {
                setCurrentSpeaker('judge');
                setVerdict(data.content);
              } else if (data.type === 'moderator') {
                setCurrentSpeaker('moderator');
                setModeratorAnalysis(data.content);
              } else {
                setCurrentSpeaker(data.type);
                roundCounter[data.type as 'bull' | 'bear']++;
                setMessages(prev => [...prev, {
                  role: data.type,
                  content: data.content,
                  timestamp: Date.now(),
                  round: roundCounter[data.type as 'bull' | 'bear']
                }]);
              }
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsDebating(false);
      setIsPreparing(false);
      setCurrentSpeaker(null);
    }
  };

  const getRoundLabel = (role: 'bull' | 'bear', round: number) => {
    if (round === 1) return role === 'bull' ? 'Opening' : 'Challenge';
    if (round === 2) return role === 'bull' ? 'Defense' : 'Counter';
    return 'Closing';
  };

  return (
    <div className="min-h-screen bg-warroom-darker text-slate-100 grid-pattern relative overflow-hidden">
      {/* Gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-emerald-950/20 via-transparent to-rose-950/20 pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/50 bg-warroom-dark/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Swords className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white font-mono">
                  WAR ROOM
                </h1>
                <p className="text-xs text-slate-400 tracking-widest uppercase">
                  Investment Committee Simulator
                </p>
              </div>
            </div>

            {/* Start Button */}
            <button 
              onClick={startDebate}
              disabled={isDebating || isPreparing}
              className={clsx(
                "relative px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center gap-2",
                (isDebating || isPreparing)
                  ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
              )}
            >
              {isPreparing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Preparing...
                </>
              ) : isDebating ? (
                <>
                  <Activity className="w-4 h-4 animate-pulse" />
                  Live Debate
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Start Debate
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        
        {/* Question Card - Always visible at top */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6 mb-8 border-l-4 border-amber-500"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center border border-amber-500/30 shrink-0">
              <Target className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-lg font-bold text-amber-400">{CORE_QUESTION.title}</h2>
              </div>
              <p className="text-xl font-semibold text-white mb-2">{CORE_QUESTION.question}</p>
              <p className="text-sm text-slate-400 leading-relaxed">{CORE_QUESTION.description}</p>
            </div>
          </div>
        </motion.div>

        {/* Preparation Loading State */}
        <AnimatePresence mode="wait">
          {isPreparing && messages.length === 0 && (
            <motion.div
              key="preparing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass rounded-xl p-8 mb-8"
            >
              <div className="flex flex-col items-center justify-center space-y-6">
                {/* Animated icon */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center animate-pulse">
                    <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-amber-500/30 animate-ping" />
                </div>
                
                {/* Phase text */}
                <div className="text-center">
                  <p className="text-lg font-medium text-slate-200 mb-2">
                    {LOADING_PHASES[prepPhase].text}
                  </p>
                  
                  {/* Progress dots */}
                  <div className="flex items-center justify-center gap-2 mt-4">
                    {LOADING_PHASES.map((_, idx) => (
                      <div
                        key={idx}
                        className={clsx(
                          "w-2 h-2 rounded-full transition-all duration-300",
                          idx <= prepPhase ? "bg-amber-400" : "bg-slate-700"
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* Tip */}
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-4">
                  <HelpCircle className="w-3 h-3" />
                  <span>The AI is analyzing the investment memo to build arguments</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!isPreparing && !isDebating && messages.length === 0 && !verdict && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-xl p-12 mb-8 text-center"
          >
            <div className="flex justify-center gap-8 mb-6">
              <div className="text-center">
                <div className="w-14 h-14 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 mx-auto mb-2">
                  <TrendingUp className="w-7 h-7 text-emerald-400" />
                </div>
                <p className="text-sm font-medium text-emerald-400">The Bull</p>
                <p className="text-xs text-slate-500">Advocate</p>
              </div>
              <div className="flex items-center">
                <span className="text-3xl text-slate-700">⚔️</span>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-xl bg-rose-500/20 flex items-center justify-center border border-rose-500/30 mx-auto mb-2">
                  <TrendingDown className="w-7 h-7 text-rose-400" />
                </div>
                <p className="text-sm font-medium text-rose-400">The Bear</p>
                <p className="text-xs text-slate-500">Skeptic</p>
              </div>
            </div>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Click <span className="text-amber-400 font-semibold">Start Debate</span> to watch two AI partners argue whether this venture has validated a real customer need.
            </p>
          </motion.div>
        )}

        {/* Debate Thread - Vertical Layout */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {messages.map((msg) => (
              <motion.div
                key={msg.timestamp}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className={clsx(
                  "glass rounded-xl p-5 shadow-lg",
                  msg.role === 'bull' 
                    ? "border-l-4 border-emerald-500 shadow-emerald-900/10" 
                    : "border-l-4 border-rose-500 shadow-rose-900/10"
                )}
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={clsx(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    msg.role === 'bull' 
                      ? "bg-emerald-500/20 border border-emerald-500/30" 
                      : "bg-rose-500/20 border border-rose-500/30"
                  )}>
                    {msg.role === 'bull' 
                      ? <TrendingUp className="w-4 h-4 text-emerald-400" />
                      : <TrendingDown className="w-4 h-4 text-rose-400" />
                    }
                  </div>
                  <div>
                    <span className={clsx(
                      "font-bold text-sm",
                      msg.role === 'bull' ? "text-emerald-400" : "text-rose-400"
                    )}>
                      {msg.role === 'bull' ? 'THE BULL' : 'THE BEAR'}
                    </span>
                    <span className="text-slate-600 mx-2">•</span>
                    <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                      {getRoundLabel(msg.role, msg.round)}
                    </span>
                  </div>
                </div>
                
                {/* Content */}
                <div className={clsx(
                  "prose prose-invert prose-sm max-w-none",
                  msg.role === 'bull' ? "text-slate-300" : "text-slate-300"
                )}>
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      strong: ({children}) => (
                        <span className={clsx(
                          "font-bold",
                          msg.role === 'bull' ? "text-emerald-300" : "text-rose-300"
                        )}>
                          {children}
                        </span>
                      ),
                      p: ({children}) => <p className="leading-relaxed mb-2 last:mb-0">{children}</p>,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {currentSpeaker && currentSpeaker !== 'judge' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={clsx(
                "glass rounded-xl p-4",
                currentSpeaker === 'bull' 
                  ? "border-l-4 border-emerald-500" 
                  : "border-l-4 border-rose-500"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={clsx(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  currentSpeaker === 'bull' 
                    ? "bg-emerald-500/20 border border-emerald-500/30" 
                    : "bg-rose-500/20 border border-rose-500/30"
                )}>
                  {currentSpeaker === 'bull' 
                    ? <TrendingUp className="w-4 h-4 text-emerald-400" />
                    : <TrendingDown className="w-4 h-4 text-rose-400" />
                  }
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className={clsx(
                      "w-2 h-2 rounded-full animate-typing",
                      currentSpeaker === 'bull' ? "bg-emerald-400" : "bg-rose-400"
                    )} style={{ animationDelay: '0s' }} />
                    <span className={clsx(
                      "w-2 h-2 rounded-full animate-typing",
                      currentSpeaker === 'bull' ? "bg-emerald-400" : "bg-rose-400"
                    )} style={{ animationDelay: '0.2s' }} />
                    <span className={clsx(
                      "w-2 h-2 rounded-full animate-typing",
                      currentSpeaker === 'bull' ? "bg-emerald-400" : "bg-rose-400"
                    )} style={{ animationDelay: '0.4s' }} />
                  </div>
                  <span className={clsx(
                    "text-xs font-mono",
                    currentSpeaker === 'bull' ? "text-emerald-400/60" : "text-rose-400/60"
                  )}>
                    {currentSpeaker === 'bull' ? 'The Bull' : 'The Bear'} is responding...
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Verdict Section */}
        <AnimatePresence mode="wait">
          {(currentSpeaker === 'judge' || verdict) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-8"
            >
              {!verdict && currentSpeaker === 'judge' ? (
                <div className="glass rounded-xl p-8 text-center">
                  <Scale className="w-12 h-12 text-amber-400/50 mx-auto mb-4 animate-pulse" />
                  <p className="text-amber-400/60 text-sm font-mono">The Managing Partner is deliberating...</p>
                </div>
              ) : verdict && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="glass rounded-xl overflow-hidden animate-pulse-glow"
                >
                  {/* Winner Banner */}
                  <div className={clsx(
                    "px-6 py-4 text-center border-b",
                    verdict.winner === 'Bull' 
                      ? "bg-emerald-500/20 border-emerald-500/30" 
                      : verdict.winner === 'Bear'
                      ? "bg-rose-500/20 border-rose-500/30"
                      : "bg-slate-500/20 border-slate-500/30"
                  )}>
                    <div className="flex items-center justify-center gap-3 mb-1">
                      <Scale className="w-5 h-5 text-amber-400" />
                      <p className="text-xs text-slate-400 uppercase tracking-widest">The Verdict</p>
                    </div>
                    <p className={clsx(
                      "text-2xl font-bold tracking-tight",
                      verdict.winner === 'Bull' ? "text-emerald-400" : 
                      verdict.winner === 'Bear' ? "text-rose-400" : "text-slate-400"
                    )}>
                      {verdict.winner === 'Bull' && '🐂 '}
                      {verdict.winner === 'Bear' && '🐻 '}
                      THE {verdict.winner.toUpperCase()} PREVAILS
                    </p>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Confidence Score */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-slate-400 uppercase tracking-wider">Conviction Level</span>
                        <span className="font-mono text-amber-400">{verdict.confidence_score}/10</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${verdict.confidence_score * 10}%` }}
                          transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                        />
                      </div>
                    </div>

                    {/* Reasoning */}
                    <div>
                      <h3 className="text-xs text-slate-400 uppercase tracking-wider mb-2">Analysis</h3>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {verdict.reasoning}
                      </p>
                    </div>

                    {/* Key Takeaway */}
                    <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <h3 className="text-xs text-amber-400 uppercase tracking-wider font-semibold">
                          Key Investment Insight
                        </h3>
                      </div>
                      <p className="text-sm text-amber-200/80 italic leading-relaxed">
                        "{verdict.key_takeaway}"
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Moderator Analysis Section */}
        <AnimatePresence mode="wait">
          {(currentSpeaker === 'moderator' || moderatorAnalysis) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8"
            >
              {!moderatorAnalysis && currentSpeaker === 'moderator' ? (
                <div className="glass rounded-xl p-8 text-center border border-violet-500/30">
                  <ClipboardList className="w-12 h-12 text-violet-400/50 mx-auto mb-4 animate-pulse" />
                  <p className="text-violet-400/60 text-sm font-mono">The Moderator is analyzing key points...</p>
                  <p className="text-xs text-slate-500 mt-2">Using Claude Opus 4.5 for truth-seeking analysis</p>
                </div>
              ) : moderatorAnalysis && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="glass rounded-xl overflow-hidden border border-violet-500/30"
                >
                  {/* Header with Scoreboard */}
                  <div className="px-6 py-5 bg-gradient-to-r from-violet-900/40 to-indigo-900/40 border-b border-violet-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
                          <ClipboardList className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-violet-300">Truth-Seeking Analysis</h2>
                          <p className="text-xs text-slate-400">Point-by-point breakdown</p>
                        </div>
                      </div>
                      
                      {/* Scoreboard */}
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-emerald-400">{moderatorAnalysis.bull_wins}</p>
                          <p className="text-xs text-emerald-400/60 uppercase tracking-wider">Bull</p>
                        </div>
                        <div className="text-slate-600 text-lg">—</div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-rose-400">{moderatorAnalysis.bear_wins}</p>
                          <p className="text-xs text-rose-400/60 uppercase tracking-wider">Bear</p>
                        </div>
                        {moderatorAnalysis.ties > 0 && (
                          <>
                            <div className="text-slate-600 text-lg">—</div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-slate-400">{moderatorAnalysis.ties}</p>
                              <p className="text-xs text-slate-400/60 uppercase tracking-wider">Ties</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Points List */}
                  <div className="p-6 space-y-4">
                    {moderatorAnalysis.points.map((point, index) => (
                      <motion.div
                        key={point.point_number}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                        className={clsx(
                          "rounded-lg border overflow-hidden",
                          point.winner === 'Bull' 
                            ? "border-emerald-500/30 bg-emerald-900/10" 
                            : point.winner === 'Bear'
                            ? "border-rose-500/30 bg-rose-900/10"
                            : "border-slate-500/30 bg-slate-900/10"
                        )}
                      >
                        {/* Point Header */}
                        <div className={clsx(
                          "px-4 py-3 flex items-center justify-between",
                          point.winner === 'Bull' 
                            ? "bg-emerald-500/10" 
                            : point.winner === 'Bear'
                            ? "bg-rose-500/10"
                            : "bg-slate-500/10"
                        )}>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-slate-500">#{point.point_number}</span>
                            <h3 className="font-semibold text-white">{point.point_title}</h3>
                          </div>
                          <div className={clsx(
                            "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold",
                            point.winner === 'Bull' 
                              ? "bg-emerald-500/20 text-emerald-400" 
                              : point.winner === 'Bear'
                              ? "bg-rose-500/20 text-rose-400"
                              : "bg-slate-500/20 text-slate-400"
                          )}>
                            {point.winner === 'Bull' && <CheckCircle className="w-3.5 h-3.5" />}
                            {point.winner === 'Bear' && <XCircle className="w-3.5 h-3.5" />}
                            {point.winner === 'Tie' && <Minus className="w-3.5 h-3.5" />}
                            {point.winner === 'Bull' ? '🐂 Bull Wins' : point.winner === 'Bear' ? '🐻 Bear Wins' : 'Tie'}
                          </div>
                        </div>
                        
                        {/* Cases */}
                        <div className="p-4 grid md:grid-cols-2 gap-4">
                          {/* Bull's Case */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-emerald-400" />
                              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Bull's Case</span>
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed">{point.bull_case}</p>
                          </div>
                          
                          {/* Bear's Case */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <TrendingDown className="w-4 h-4 text-rose-400" />
                              <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Bear's Case</span>
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed">{point.bear_case}</p>
                          </div>
                        </div>

                        {/* Rationale */}
                        <div className="px-4 pb-4">
                          <div className={clsx(
                            "rounded-lg p-3 text-sm",
                            point.winner === 'Bull' 
                              ? "bg-emerald-500/10 border border-emerald-500/20" 
                              : point.winner === 'Bear'
                              ? "bg-rose-500/10 border border-rose-500/20"
                              : "bg-slate-500/10 border border-slate-500/20"
                          )}>
                            <span className="text-slate-400 text-xs uppercase tracking-wider block mb-1">Rationale</span>
                            <p className={clsx(
                              "italic",
                              point.winner === 'Bull' 
                                ? "text-emerald-200/80" 
                                : point.winner === 'Bear'
                                ? "text-rose-200/80"
                                : "text-slate-300"
                            )}>
                              {point.rationale}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Closing Notes */}
                  <div className="px-6 pb-6">
                    <div className="rounded-lg p-4 bg-violet-500/10 border border-violet-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-4 h-4 text-violet-400" />
                        <h3 className="text-xs text-violet-400 uppercase tracking-wider font-semibold">
                          Moderator's Closing Notes
                        </h3>
                      </div>
                      <p className="text-sm text-violet-200/80 leading-relaxed">
                        {moderatorAnalysis.closing_notes}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/50 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between text-xs text-slate-600">
          <span className="font-mono">WAR ROOM v1.0</span>
          <span>Powered by LangGraph + OpenRouter</span>
        </div>
      </footer>
    </div>
  );
}
