import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaRobot, FaDumbbell, FaClock, FaCalendarAlt, FaBullseye, FaExclamationTriangle, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const AIWorkoutPersonalization = ({ userProfile, onWorkoutGenerated, isLoading, error }) => {
  const [formData, setFormData] = useState({
    goals: userProfile?.goals || [],
    injuries: userProfile?.injuries || [],
    experience: userProfile?.experience || '',
    preferredDays: userProfile?.preferredDays || [],
    sessionDuration: userProfile?.sessionDuration || 45
  });
  
  const [expandedSection, setExpandedSection] = useState(null);

  const goalOptions = [
    'Build Strength', 'Increase Muscle', 'Fat Loss', 'Endurance', 
    'Athletic Performance', 'Functional Fitness', 'Rehabilitation'
  ];

  const injuryOptions = [
    'Shoulder Issues', 'Lower Back Pain', 'Knee Problems', 'Neck Issues',
    'Wrist Pain', 'Ankle Issues', 'Hip Problems', 'None'
  ];

  const dayOptions = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const durationOptions = [30, 45, 60, 75, 90];

  const handleGoalToggle = (goal) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal) 
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const handleInjuryToggle = (injury) => {
    if (injury === 'None') {
      setFormData(prev => ({ ...prev, injuries: [] }));
    } else {
      setFormData(prev => ({
        ...prev,
        injuries: prev.injuries.includes(injury) 
          ? prev.injuries.filter(i => i !== injury)
          : [...prev.injuries, injury]
      }));
    }
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      preferredDays: prev.preferredDays.includes(day) 
        ? prev.preferredDays.filter(d => d !== day)
        : [...prev.preferredDays, day]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const userData = {
      level: userProfile?.level || 'beginner',
      ...formData
    };
    
    onWorkoutGenerated(userData);
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full">
              <FaRobot className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">AI Workout Personalization</h2>
              <p className="text-gray-600 text-sm">Get a custom workout plan tailored to your needs</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <FaExclamationTriangle className="text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Goals Section */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('goals')}
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <FaBullseye className="text-purple-500" />
                <span className="font-semibold text-gray-700">Your Goals</span>
                <span className="text-sm text-gray-500">({formData.goals.length} selected)</span>
              </div>
              {expandedSection === 'goals' ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            
            {expandedSection === 'goals' && (
              <div className="p-4 bg-white">
                <div className="grid grid-cols-2 gap-3">
                  {goalOptions.map(goal => (
                    <label
                      key={goal}
                      className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all ${
                        formData.goals.includes(goal)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.goals.includes(goal)}
                        onChange={() => handleGoalToggle(goal)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm font-medium">{goal}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Injuries Section */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('injuries')}
              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <FaExclamationTriangle className="text-orange-500" />
                <span className="font-semibold text-gray-700">Injuries & Limitations</span>
                <span className="text-sm text-gray-500">({formData.injuries.length} selected)</span>
              </div>
              {expandedSection === 'injuries' ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            
            {expandedSection === 'injuries' && (
              <div className="p-4 bg-white">
                <div className="grid grid-cols-2 gap-3">
                  {injuryOptions.map(injury => (
                    <label
                      key={injury}
                      className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all ${
                        (injury === 'None' && formData.injuries.length === 0) || formData.injuries.includes(injury)
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={injury === 'None' ? formData.injuries.length === 0 : formData.injuries.includes(injury)}
                        onChange={() => handleInjuryToggle(injury)}
                        className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm font-medium">{injury}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaDumbbell className="inline mr-2 text-blue-500" />
              Experience Level
            </label>
            <select
              value={formData.experience}
              onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              <option value="">Select your experience</option>
              <option value="Beginner (0-6 months)">Beginner (0-6 months)</option>
              <option value="Intermediate (6-18 months)">Intermediate (6-18 months)</option>
              <option value="Advanced (18+ months)">Advanced (18+ months)</option>
              <option value="Expert (3+ years)">Expert (3+ years)</option>
            </select>
          </div>

          {/* Preferred Training Days */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaCalendarAlt className="inline mr-2 text-green-500" />
              Preferred Training Days
            </label>
            <div className="grid grid-cols-3 gap-2">
              {dayOptions.map(day => (
                <label
                  key={day}
                  className={`flex items-center justify-center p-2 rounded-lg border cursor-pointer transition-all text-sm ${
                    formData.preferredDays.includes(day)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.preferredDays.includes(day)}
                    onChange={() => handleDayToggle(day)}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500 mr-2"
                  />
                  <span className="font-medium">{day.slice(0, 3)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Session Duration */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaClock className="inline mr-2 text-indigo-500" />
              Session Duration
            </label>
            <div className="flex space-x-2">
              {durationOptions.map(duration => (
                <button
                  key={duration}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, sessionDuration: duration }))}
                  className={`flex-1 py-2 px-3 rounded-lg border transition-all ${
                    formData.sessionDuration === duration
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {duration}min
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || formData.goals.length === 0 || formData.preferredDays.length === 0}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>AI is creating your workout...</span>
              </>
            ) : (
              <>
                <FaRobot />
                <span>Generate AI Workout Plan</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AIWorkoutPersonalization;
