import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiArrowRight, FiArrowLeft, FiAward, FiHome } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import EducationHeader from './EducationHeader';
import EducationFooter from './EducationFooter';
import quizData from '../learning/quizData.json';

interface Quiz {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface Module {
  moduleNumber: number;
  title: string;
  quizzes: Quiz[];
}

const QuantumQuiz: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [modules] = useState<Module[]>(quizData);
  const [currentModuleIndex, setCurrentModuleIndex] = useState<number>(0);
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [totalAnswered, setTotalAnswered] = useState<number>(0);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [moduleScores, setModuleScores] = useState<Record<number, { correct: number, total: number }>>(
    modules.reduce((acc, module) => ({
      ...acc,
      [module.moduleNumber]: { correct: 0, total: module.quizzes.length }
    }), {})
  );

  // Apply dark mode based on system preference
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const currentModule = modules[currentModuleIndex];
  const currentQuiz = currentModule?.quizzes[currentQuizIndex];
  
  const handleOptionSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption || isAnswered) return;
    
    setIsAnswered(true);
    setTotalAnswered(prev => prev + 1);
    
    const isCorrect = selectedOption === currentQuiz.correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 1);
      setModuleScores(prev => ({
        ...prev,
        [currentModule.moduleNumber]: {
          ...prev[currentModule.moduleNumber],
          correct: prev[currentModule.moduleNumber].correct + 1
        }
      }));
    }
  };

  const handleNextQuestion = () => {
    if (currentQuizIndex < currentModule.quizzes.length - 1) {
      // Next question in same module
      setCurrentQuizIndex(prevIndex => prevIndex + 1);
    } else if (currentModuleIndex < modules.length - 1) {
      // First question in next module
      setCurrentModuleIndex(prevIndex => prevIndex + 1);
      setCurrentQuizIndex(0);
    } else {
      // End of quiz, show summary
      setShowSummary(true);
    }
    
    setSelectedOption(null);
    setIsAnswered(false);
  };

  const handlePreviousQuestion = () => {
    if (currentQuizIndex > 0) {
      // Previous question in same module
      setCurrentQuizIndex(prevIndex => prevIndex - 1);
    } else if (currentModuleIndex > 0) {
      // Last question in previous module
      setCurrentModuleIndex(prevIndex => prevIndex - 1);
      setCurrentQuizIndex(modules[currentModuleIndex - 1].quizzes.length - 1);
    }
    
    setSelectedOption(null);
    setIsAnswered(false);
  };

  const handleModuleSelect = (index: number) => {
    setCurrentModuleIndex(index);
    setCurrentQuizIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowSummary(false);
  };

  const resetQuiz = () => {
    setCurrentModuleIndex(0);
    setCurrentQuizIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setTotalAnswered(0);
    setShowSummary(false);
    setModuleScores(
      modules.reduce((acc, module) => ({
        ...acc,
        [module.moduleNumber]: { correct: 0, total: module.quizzes.length }
      }), {})
    );
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    const totalQuestions = modules.reduce((sum, module) => sum + module.quizzes.length, 0);
    const questionsDone = modules.slice(0, currentModuleIndex).reduce(
      (sum, module) => sum + module.quizzes.length, 0
    ) + currentQuizIndex;
    
    return Math.round((questionsDone / totalQuestions) * 100);
  };

  if (showSummary) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
        <EducationHeader title="Quantum Computing Quiz" toggleTheme={toggleTheme} darkMode={darkMode} />
        
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <FiAward className="mx-auto text-yellow-500 w-16 h-16 mb-4" />
              <h1 className="text-3xl font-bold mb-2">Quiz Complete!</h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                You scored {score} out of {totalAnswered} questions ({Math.round((score/totalAnswered) * 100)}%)
              </p>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Module Breakdown</h2>
              <div className="space-y-4">
                {modules.map((module, index) => {
                  const moduleScore = moduleScores[module.moduleNumber];
                  const percentage = moduleScore.correct / moduleScore.total * 100;
                  return (
                    <div key={index} className="border dark:border-gray-700 rounded p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">Module {module.moduleNumber}: {module.title}</h3>
                        <span className="font-semibold">
                          {moduleScore.correct}/{moduleScore.total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={resetQuiz}
                className="px-6 py-2 bg-blue-600 text-white rounded-md flex items-center"
              >
                <FiArrowRight className="mr-2" /> Restart Quiz
              </button>
              <Link
                to="/education"
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md flex items-center"
              >
                <FiHome className="mr-2" /> Back to Education Hub
              </Link>
            </div>
          </div>
        </main>
      
        <EducationFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <EducationHeader title="Quantum Computing Quiz" toggleTheme={toggleTheme} darkMode={darkMode} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Module selection */}
          <div className="mb-6 overflow-x-auto">
            <div className="flex space-x-2 min-w-max">
              {modules.map((module, index) => (
                <button
                  key={index}
                  onClick={() => handleModuleSelect(index)}
                  className={`px-4 py-2 rounded-md text-sm whitespace-nowrap ${
                    currentModuleIndex === index 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  Module {module.moduleNumber}: {module.title.length > 20 
                    ? module.title.substring(0, 20) + '...' 
                    : module.title
                  }
                </button>
              ))}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{calculateProgress()}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
          </div>
          
          {/* Quiz card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">
                Module {currentModule.moduleNumber}: {currentModule.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Question {currentQuizIndex + 1} of {currentModule.quizzes.length}
              </p>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">{currentQuiz.question}</h3>
              
              <div className="space-y-3">
                {currentQuiz.options.map((option, index) => (
                  <button
                    key={index}
                    className={`w-full text-left p-4 rounded-md border ${
                      selectedOption === option
                        ? isAnswered
                          ? option === currentQuiz.correctAnswer
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : isAnswered && option === currentQuiz.correctAnswer
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => handleOptionSelect(option)}
                    disabled={isAnswered}
                  >
                    <div className="flex justify-between items-center">
                      <span>{option}</span>
                      {isAnswered && (
                        option === currentQuiz.correctAnswer ? (
                          <FiCheck className="text-green-500" />
                        ) : selectedOption === option ? (
                          <FiX className="text-red-500" />
                        ) : null
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Explanation (shown after answering) */}
            {isAnswered && (
              <div className={`p-4 mb-6 rounded-md ${
                selectedOption === currentQuiz.correctAnswer
                  ? 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900'
                  : 'bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900'
              }`}>
                <h4 className="font-medium mb-2">
                  {selectedOption === currentQuiz.correctAnswer
                    ? 'Correct!'
                    : `Incorrect. The correct answer is: ${currentQuiz.correctAnswer}`
                  }
                </h4>
                <p className="text-sm">{currentQuiz.explanation}</p>
              </div>
            )}
            
            {/* Action buttons */}
            <div className="flex justify-between">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentModuleIndex === 0 && currentQuizIndex === 0}
                className={`flex items-center px-4 py-2 rounded-md ${
                  currentModuleIndex === 0 && currentQuizIndex === 0
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <FiArrowLeft className="mr-2" /> Previous
              </button>
              
              {!isAnswered ? (
                <button
                  onClick={handleCheckAnswer}
                  disabled={!selectedOption}
                  className={`px-6 py-2 rounded-md ${
                    !selectedOption
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  Check Answer
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                >
                  {currentQuizIndex === currentModule.quizzes.length - 1 && currentModuleIndex === modules.length - 1
                    ? 'Finish Quiz'
                    : 'Next Question'
                  } <FiArrowRight className="ml-2" />
                </button>
              )}
            </div>
          </div>
          
          {/* Score display */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
            <p className="font-medium">
              Current Score: {score} correct out of {totalAnswered} answered 
              {totalAnswered > 0 && ` (${Math.round((score/totalAnswered) * 100)}%)`}
            </p>
          </div>
        </div>
      </main>
      
      <EducationFooter />
    </div>
  );
};

export default QuantumQuiz; 