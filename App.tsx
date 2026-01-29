
import React, { useState } from 'react';
import { SectionKey, UserAnswer, ExamResult } from './types';
import { EXAM_DATA, READING_PASSAGE } from './constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

type ViewState = 'menu' | 'quiz' | 'result';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('menu');
  const [activeSection, setActiveSection] = useState<SectionKey>('comprehension');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [isAdVisible, setIsAdVisible] = useState(false);
  const [adTimer, setAdTimer] = useState(5);
  const [showPassage, setShowPassage] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);

  // Stats tracking for sections
  const [sectionScores, setSectionScores] = useState<Record<string, string>>({
    comprehension: 'No Data',
    language: 'No Data',
    writing: 'No Data'
  });

  const startExam = (section: SectionKey) => {
    setActiveSection(section);
    setCurrentIndex(0);
    setUserAnswers(EXAM_DATA[section].map((_, i) => ({
      section,
      questionIndex: i,
      selectedOption: null
    })));
    setView('quiz');
  };

  const handleAnswerSelect = (optionIndex: number) => {
    const updated = [...userAnswers];
    updated[currentIndex].selectedOption = optionIndex;
    setUserAnswers(updated);
  };

  const nextQuestion = () => {
    if (currentIndex < EXAM_DATA[activeSection].length - 1) {
      if ((currentIndex + 1) % 10 === 0) {
        triggerAd();
      }
      setCurrentIndex(prev => prev + 1);
    }
  };

  const triggerAd = () => {
    setIsAdVisible(true);
    setAdTimer(5);
    const interval = setInterval(() => {
      setAdTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const finishExam = () => {
    const questions = EXAM_DATA[activeSection];
    let right = 0;
    let wrong = 0;
    let skipped = 0;

    userAnswers.forEach((ans, idx) => {
      if (ans.selectedOption === null) skipped++;
      else if (ans.selectedOption === questions[idx].correct) right++;
      else wrong++;
    });

    const score = right - (wrong * 0.25); 
    setResult({ right, wrong, skipped, total: questions.length, score });
    setSectionScores(prev => ({ ...prev, [activeSection]: `${right}/${questions.length}` }));
    setView('result');
  };

  const reset = () => {
    setView('menu');
  };

  const currentQuestions = EXAM_DATA[activeSection];
  const activeQuestion = currentQuestions[currentIndex];

  if (isAdVisible) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4">
        <div className="bg-white text-slate-900 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Sponsored Content</p>
          <h3 className="text-2xl font-bold mb-4">Master Academic English</h3>
          <p className="text-slate-600 mb-6">Unlock the "Advanced IELTS Vocabulary" guide for free this week.</p>
          <div className="bg-slate-100 h-32 rounded-xl mb-6 flex items-center justify-center text-slate-400 font-medium italic">
            Ad Visual Placeholder
          </div>
          <button
            disabled={adTimer > 0}
            onClick={() => setIsAdVisible(false)}
            className={`w-full py-4 rounded-xl font-bold transition-all ${adTimer > 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg'}`}
          >
            {adTimer > 0 ? `Wait (${adTimer}s)` : 'Resume Assessment'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 flex items-center justify-center bg-slate-950">
      <div className="max-w-4xl w-full">
        
        {view === 'menu' && (
          <div className="bg-white text-slate-900 rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20">
            <h1 className="text-4xl font-black text-center text-indigo-600 mb-2">English Portal</h1>
            <p className="text-center text-slate-500 mb-10">Advanced Comprehensive Assessment Suite</p>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 flex items-center justify-between relative overflow-hidden group">
              <span className="absolute top-1 right-2 text-[9px] font-bold text-amber-600 uppercase">Ad</span>
              <div className="flex items-center gap-4">
                <div className="bg-amber-100 p-3 rounded-xl">🚀</div>
                <div>
                  <h4 className="font-bold text-amber-900 text-sm">1-on-1 IELTS Coaching</h4>
                  <p className="text-amber-800 text-xs">Score 8.5 on your first try. Book a free session.</p>
                </div>
              </div>
              <button className="text-amber-600 font-bold text-xs hover:underline">Apply Now</button>
            </div>

            <div className="space-y-4">
              <SectionButton 
                title="Part 1: Comprehension" 
                subtitle="Reading & Context (16 Questions)" 
                score={sectionScores.comprehension}
                icon="📖"
                onClick={() => startExam('comprehension')} 
              />
              <SectionButton 
                title="Part 2: Language" 
                subtitle="Grammar & Vocabulary (48 Questions)" 
                score={sectionScores.language}
                icon="📝"
                onClick={() => startExam('language')} 
              />
              <SectionButton 
                title="Part 3: Writing" 
                subtitle="Composition & Logic (16 Questions)" 
                score={sectionScores.writing}
                icon="✍️"
                onClick={() => startExam('writing')} 
              />
            </div>
          </div>
        )}

        {view === 'quiz' && (
          <div className="bg-white text-slate-900 rounded-3xl p-6 md:p-10 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold uppercase tracking-widest text-indigo-600">{activeSection}</h2>
              <span className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-600">
                Question {currentIndex + 1} of {currentQuestions.length}
              </span>
            </div>

            {activeSection === 'comprehension' && (
              <div className="mb-8">
                <button 
                  onClick={() => setShowPassage(!showPassage)}
                  className="w-full bg-slate-50 border border-slate-200 py-3 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                >
                  {showPassage ? 'Hide' : 'Show'} Full Reading Passage 👁️
                </button>
                {showPassage && (
                  <div className="mt-4 bg-amber-50/30 border border-amber-100 p-6 rounded-2xl max-h-96 overflow-y-auto leading-relaxed text-slate-700 text-sm italic">
                    <div dangerouslySetInnerHTML={{ __html: READING_PASSAGE.replace(/\n/g, '<br/><br/>') }} />
                  </div>
                )}
              </div>
            )}

            <div className="mb-10 animate-in slide-in-from-right duration-300">
              <p className="text-lg md:text-xl font-semibold mb-6 text-slate-800">{activeQuestion.q}</p>
              <div className="grid gap-3">
                {activeQuestion.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswerSelect(i)}
                    className={`text-left p-5 rounded-2xl border-2 transition-all group flex justify-between items-center ${userAnswers[currentIndex].selectedOption === i ? 'border-indigo-600 bg-indigo-50/50 shadow-inner' : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}`}
                  >
                    <span className={`font-medium ${userAnswers[currentIndex].selectedOption === i ? 'text-indigo-700' : 'text-slate-600'}`}>{opt}</span>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${userAnswers[currentIndex].selectedOption === i ? 'border-indigo-600 bg-indigo-600' : 'border-slate-200'}`}>
                      {userAnswers[currentIndex].selectedOption === i && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center gap-4">
              <button 
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(prev => prev - 1)}
                className="px-6 py-4 rounded-2xl font-bold bg-slate-100 text-slate-500 disabled:opacity-30 hover:bg-slate-200 transition-all"
              >
                Previous
              </button>
              
              {currentIndex === currentQuestions.length - 1 ? (
                <button 
                  onClick={finishExam}
                  className="px-8 py-4 rounded-2xl font-bold bg-red-600 text-white shadow-lg hover:bg-red-700 transition-all"
                >
                  Finish Assessment
                </button>
              ) : (
                <button 
                  onClick={nextQuestion}
                  className="px-8 py-4 rounded-2xl font-bold bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-all"
                >
                  Next Question
                </button>
              )}
            </div>
          </div>
        )}

        {view === 'result' && result && (
          <div className="bg-white text-slate-900 rounded-3xl p-8 md:p-12 shadow-2xl text-center">
            <h2 className="text-3xl font-black mb-2">Performance Analysis</h2>
            <p className="text-slate-500 mb-8">Detailed breakdown of your assessment</p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-10">
              <div className="w-full max-w-[300px] h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Correct', value: result.right },
                        { name: 'Incorrect', value: result.wrong },
                        { name: 'Skipped', value: result.skipped },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="#4f46e5" />
                      <Cell fill="#ef4444" />
                      <Cell fill="#94a3af" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="text-left bg-slate-50 p-8 rounded-3xl border border-slate-100">
                <div className="mb-4">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Aggregate Score</span>
                  <p className="text-5xl font-black text-indigo-600">{result.score.toFixed(1)} <span className="text-lg text-slate-400">pts</span></p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                    <p className="text-xs text-slate-400 font-bold">Accuracy</p>
                    <p className="text-xl font-bold text-slate-700">{Math.round((result.right / result.total) * 100)}%</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                    <p className="text-xs text-slate-400 font-bold">Completion</p>
                    <p className="text-xl font-bold text-slate-700">{Math.round(((result.total - result.skipped) / result.total) * 100)}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Corrections Section */}
            <div className="mt-10 text-left border-t border-slate-100 pt-10 mb-10">
              <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <span className="bg-slate-100 p-2 rounded-lg">🔍</span> Corrections & Review
              </h3>
              <div className="space-y-8">
                {currentQuestions.map((q, idx) => {
                  const userAns = userAnswers[idx].selectedOption;
                  const isCorrect = userAns === q.correct;
                  
                  return (
                    <div key={idx} className={`p-6 rounded-2xl border-2 transition-all ${isCorrect ? 'bg-green-50/30 border-green-100' : 'bg-red-50/30 border-red-100'}`}>
                      <div className="flex justify-between items-start mb-3">
                        <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          Question {idx + 1}: {isCorrect ? 'Correct' : userAns === null ? 'Skipped' : 'Incorrect'}
                        </span>
                      </div>
                      <p className="font-bold text-slate-800 mb-4">{q.q}</p>
                      
                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const isUserChoice = userAns === optIdx;
                          const isCorrectChoice = q.correct === optIdx;
                          
                          let choiceClass = "p-3 rounded-xl border flex items-center justify-between text-sm ";
                          if (isCorrectChoice) {
                            choiceClass += "bg-green-100 border-green-300 text-green-900 font-bold ";
                          } else if (isUserChoice && !isCorrect) {
                            choiceClass += "bg-red-100 border-red-300 text-red-900 font-bold ";
                          } else {
                            choiceClass += "bg-white border-slate-100 text-slate-500 ";
                          }

                          return (
                            <div key={optIdx} className={choiceClass}>
                              <span>{opt}</span>
                              {isCorrectChoice && <span className="text-lg">✅</span>}
                              {isUserChoice && !isCorrect && <span className="text-lg">❌</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button 
              onClick={reset}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-slate-800 transition-all shadow-xl"
            >
              Back to Assessment Hub
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

interface SectionButtonProps {
  title: string;
  subtitle: string;
  score: string;
  icon: string;
  onClick: () => void;
}

const SectionButton: React.FC<SectionButtonProps> = ({ title, subtitle, score, icon, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-6 bg-white border-2 border-slate-100 rounded-2xl hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-500/10 transition-all group text-left"
  >
    <div className="flex items-center gap-5">
      <div className="text-3xl bg-slate-50 p-4 rounded-2xl group-hover:bg-indigo-50 transition-colors">{icon}</div>
      <div>
        <h4 className="font-bold text-slate-800 text-lg">{title}</h4>
        <p className="text-slate-400 text-sm">{subtitle}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Recent Score</p>
      <span className={`px-4 py-1 rounded-full text-xs font-bold ${score === 'No Data' ? 'bg-slate-100 text-slate-500' : 'bg-green-100 text-green-700'}`}>
        {score}
      </span>
    </div>
  </button>
);

export default App;
