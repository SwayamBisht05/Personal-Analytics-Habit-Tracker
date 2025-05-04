"use client";

import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie } from "recharts";
import { Check, Plus, X, Calendar, BarChart2, Settings, Trash2 } from "lucide-react";

// Types
interface Habit {
  id: string;
  name: string;
  category: string;
  streak: number;
  totalCompletions: number;
  completionDates: string[];
  color: string;
}

interface DailyLog {
  date: string;
  completedHabits: string[];
  mood: number;
  notes: string;
}

// Constants
const COLORS = ["#FF6B6B", "#4ECDC4", "#FFD166", "#6A0572", "#AB83A1"];
const CATEGORIES = ["Health", "Productivity", "Learning", "Mental", "Social"];

export default function HabitTrackerPage() {
  // State
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [activeTab, setActiveTab] = useState<"tracker" | "analytics" | "settings">("tracker");
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitCategory, setNewHabitCategory] = useState(CATEGORIES[0]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [mood, setMood] = useState<number>(5);
  const [notes, setNotes] = useState<string>("");
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [timeRange, setTimeRange] = useState<"week" | "month">("week");
  
  // Load data from localStorage
  useEffect(() => {
    const savedHabits = localStorage.getItem("habits");
    const savedLogs = localStorage.getItem("logs");
    
    if (savedHabits) setHabits(JSON.parse(savedHabits));
    if (savedLogs) setLogs(JSON.parse(savedLogs));
    
    // Initialize with sample data if empty
    if (!savedHabits) {
      const sampleHabits = [
        { id: "h1", name: "Meditate", category: "Mental", streak: 3, totalCompletions: 15, completionDates: [], color: COLORS[3] },
        { id: "h2", name: "Exercise", category: "Health", streak: 0, totalCompletions: 8, completionDates: [], color: COLORS[0] }
      ];
      setHabits(sampleHabits);
      localStorage.setItem("habits", JSON.stringify(sampleHabits));
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits));
    localStorage.setItem("logs", JSON.stringify(logs));
  }, [habits, logs]);

  // Helper functions
  const getCurrentLog = () => {
    const log = logs.find(log => log.date === selectedDate);
    if (log) return log;
    return { date: selectedDate, completedHabits: [], mood: 5, notes: "" };
  };

  const isHabitCompleted = (habitId: string) => {
    const log = logs.find(log => log.date === selectedDate);
    return log ? log.completedHabits.includes(habitId) : false;
  };

  const toggleHabit = (habitId: string) => {
    // Update logs
    const updatedLogs = [...logs];
    const logIndex = updatedLogs.findIndex(log => log.date === selectedDate);
    
    if (logIndex === -1) {
      updatedLogs.push({
        date: selectedDate,
        completedHabits: [habitId],
        mood: mood,
        notes: ""
      });
    } else {
      const completedHabits = updatedLogs[logIndex].completedHabits;
      if (completedHabits.includes(habitId)) {
        updatedLogs[logIndex].completedHabits = completedHabits.filter(id => id !== habitId);
      } else {
        updatedLogs[logIndex].completedHabits = [...completedHabits, habitId];
      }
    }
    setLogs(updatedLogs);
    
    // Update habit stats
    const updatedHabits = [...habits];
    const habitIndex = updatedHabits.findIndex(h => h.id === habitId);
    if (habitIndex !== -1) {
      const habit = {...updatedHabits[habitIndex]};
      const isCompleted = updatedLogs.find(log => log.date === selectedDate)?.completedHabits.includes(habitId);
      
      if (isCompleted) {
        if (!habit.completionDates.includes(selectedDate)) {
          habit.completionDates.push(selectedDate);
          habit.totalCompletions += 1;
          habit.streak += 1;
        }
      } else {
        habit.completionDates = habit.completionDates.filter(date => date !== selectedDate);
        if (habit.totalCompletions > 0) habit.totalCompletions -= 1;
        habit.streak = 0;
      }
      
      updatedHabits[habitIndex] = habit;
      setHabits(updatedHabits);
    }
  };

  const addHabit = () => {
    if (newHabitName.trim()) {
      const newHabit: Habit = {
        id: Math.random().toString(36).substring(2, 9),
        name: newHabitName,
        category: newHabitCategory,
        streak: 0,
        totalCompletions: 0,
        completionDates: [],
        color: COLORS[CATEGORIES.indexOf(newHabitCategory) % COLORS.length]
      };
      
      setHabits([...habits, newHabit]);
      setNewHabitName("");
      setShowAddHabit(false);
    }
  };

  const deleteHabit = (id: string) => {
    setHabits(habits.filter(habit => habit.id !== id));
    setLogs(logs.map(log => ({
      ...log,
      completedHabits: log.completedHabits.filter(habitId => habitId !== id)
    })));
  };

  const updateDailyLog = () => {
    const updatedLogs = [...logs];
    const logIndex = updatedLogs.findIndex(log => log.date === selectedDate);
    
    if (logIndex === -1) {
      updatedLogs.push({
        date: selectedDate,
        completedHabits: [],
        mood: mood,
        notes: notes
      });
    } else {
      updatedLogs[logIndex].mood = mood;
      updatedLogs[logIndex].notes = notes;
    }
    
    setLogs(updatedLogs);
  };

  // Analytics data preparation
  const getAnalyticsData = () => {
    const daysCount = timeRange === "week" ? 7 : 30;
    const dates = Array.from({length: daysCount}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (daysCount - i - 1));
      return date.toISOString().split('T')[0];
    });
    
    const completionData = dates.map(date => {
      const log = logs.find(log => log.date === date);
      const completed = log ? log.completedHabits.length : 0;
      return {
        date: date.split('-').slice(1).join('/'),
        completed,
        total: habits.length,
        percentage: habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0
      };
    });
    
    const moodData = dates.map(date => {
      const log = logs.find(log => log.date === date);
      return {
        date: date.split('-').slice(1).join('/'),
        mood: log ? log.mood : 0
      };
    });
    
    const categoryData = CATEGORIES.map(category => {
      const habitsInCategory = habits.filter(h => h.category === category);
      return {
        name: category,
        count: habitsInCategory.length,
        completions: habitsInCategory.reduce((acc, h) => acc + h.totalCompletions, 0)
      };
    }).filter(item => item.count > 0);
    
    return { completionData, moodData, categoryData };
  };

  // Tab components
  const HabitTracker = () => {
    const currentLog = getCurrentLog();
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{new Date(selectedDate).toLocaleDateString()}</h2>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="p-2 border rounded-md"
          />
        </div>
        
        {habits.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500">No habits added yet</p>
            <button 
              onClick={() => setShowAddHabit(true)}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              Add Your First Habit
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map(habit => (
              <div key={habit.id} className="border rounded-lg p-3 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleHabit(habit.id)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isHabitCompleted(habit.id) 
                        ? 'bg-blue-500 text-white' 
                        : 'border-2 border-gray-300'
                    }`}
                  >
                    {isHabitCompleted(habit.id) && <Check size={16} />}
                  </button>
                  <div>
                    <h3 className="font-medium">{habit.name}</h3>
                    <span className="text-sm text-gray-500">{habit.category}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Streak</p>
                    <p className="font-bold">{habit.streak}</p>
                  </div>
                  <button onClick={() => deleteHabit(habit.id)} className="text-gray-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Add Habit Form */}
        {!showAddHabit ? (
          <button
            onClick={() => setShowAddHabit(true)}
            className="flex items-center space-x-2 text-blue-500"
          >
            <Plus size={20} />
            <span>Add New Habit</span>
          </button>
        ) : (
          <div className="border rounded-lg p-3 space-y-3">
            <div className="flex justify-between items-center">
              <h3>Add New Habit</h3>
              <button onClick={() => setShowAddHabit(false)}><X size={20} /></button>
            </div>
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="Habit name"
              className="w-full p-2 border rounded-md"
            />
            <select
              value={newHabitCategory}
              onChange={(e) => setNewHabitCategory(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              {CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <button
              onClick={addHabit}
              className="w-full py-2 bg-blue-500 text-white rounded-md"
            >
              Create Habit
            </button>
          </div>
        )}
        
        {/* Daily Reflection */}
        <div className="border rounded-lg p-3 space-y-3 mt-4">
          <h3 className="font-medium">Daily Reflection</h3>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Mood (1-10)</label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="1"
                max="10"
                value={currentLog.mood}
                onChange={(e) => setMood(parseInt(e.target.value))}
                className="w-full"
              />
              <span>{currentLog.mood}</span>
            </div>
          </div>
          <div>
            <textarea
              value={currentLog.notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How was your day?"
              className="w-full p-2 border rounded-md h-24"
            ></textarea>
          </div>
          <button
            onClick={updateDailyLog}
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Save
          </button>
        </div>
      </div>
    );
  };

  const Analytics = () => {
    const { completionData, moodData, categoryData } = getAnalyticsData();
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Analytics</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeRange("week")}
              className={`px-3 py-1 rounded-md ${timeRange === "week" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeRange("month")}
              className={`px-3 py-1 rounded-md ${timeRange === "month" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            >
              Month
            </button>
          </div>
        </div>
        
        {/* Completion Chart */}
        <div className="border rounded-lg p-3">
          <h3 className="font-medium mb-2">Habit Completion</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={completionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="completed" stroke="#8884d8" />
              <Line yAxisId="right" type="monotone" dataKey="percentage" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Mood Chart */}
        <div className="border rounded-lg p-3">
          <h3 className="font-medium mb-2">Mood Tracking</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={moodData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Line type="monotone" dataKey="mood" stroke="#FF6B6B" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Category Distribution */}
        <div className="border rounded-lg p-3">
          <h3 className="font-medium mb-2">Habits by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Number of Habits" />
              <Bar dataKey="completions" fill="#82ca9d" name="Total Completions" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const Settings = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Settings</h2>
      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-3">Manage Habits</h3>
        <div className="space-y-2">
          {habits.map(habit => (
            <div key={habit.id} className="flex justify-between items-center p-2 border-b">
              <div>
                <span className="inline-block w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: habit.color }}></span>
                {habit.name}
              </div>
              <button 
                onClick={() => deleteHabit(habit.id)}
                className="text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-3">Data Management</h3>
        <button 
          onClick={() => {
            localStorage.removeItem("habits");
            localStorage.removeItem("logs");
            setHabits([]);
            setLogs([]);
          }}
          className="px-4 py-2 bg-red-500 text-white rounded-md"
        >
          Reset All Data
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-6">Personal Analytics & Habit Tracker</h1>
      
      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab("tracker")}
          className={`px-4 py-2 ${activeTab === "tracker" ? "border-b-2 border-blue-500 font-medium" : ""}`}
        >
          <Calendar className="inline mr-2" size={18} /> Tracker
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2 ${activeTab === "analytics" ? "border-b-2 border-blue-500 font-medium" : ""}`}
        >
          <BarChart2 className="inline mr-2" size={18} /> Analytics
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-2 ${activeTab === "settings" ? "border-b-2 border-blue-500 font-medium" : ""}`}
        >
          <Settings className="inline mr-2"size={18} /> Settings
        </button>
      </div>
      
      {/* Active Content */}
      {activeTab === "tracker" && <HabitTracker />}
      {activeTab === "analytics" && <Analytics />}
      {activeTab === "settings" && <Settings />}
    </div>
  );
};