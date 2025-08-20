import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Camera, Target, TrendingUp, RefreshCw, Plus, X, Volume2, Trash2, Calendar } from 'lucide-react';

// Storage service
const loadData = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error loading data:', error);
    return defaultValue;
  }
};

const saveData = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

// Helper function to get week number
const getWeekNumber = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNo;
};

// Helper function to get week start date
const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

// Metric Card Component
const MetricCard = ({ title, value, progress, colorClass }) => (
  <div className="bg-gray-700 p-3 rounded-lg shadow-sm border border-gray-600">
    <div>
      <h3 className="text-xs font-medium text-gray-300">{title}</h3>
      <p className="text-lg font-bold text-gray-100 mt-1">{value}</p>
    </div>
    {progress !== undefined && (
      <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
        <div className={`${colorClass} h-2 rounded-full transition-all duration-300`} style={{ width: `${Math.min(100, progress)}%` }}></div>
      </div>
    )}
  </div>
);

// Weekly Progress Component
const WeeklyProgress = ({ data, weeklyTargets }) => {
  const currentWeek = getWeekNumber(new Date());
  const currentWeekStart = getWeekStart(new Date());
  
  // Get data for current week
  const currentWeekData = data.filter(entry => {
    const entryDate = new Date(entry.date);
    const entryWeekStart = getWeekStart(entryDate);
    return entryWeekStart.getTime() === currentWeekStart.getTime();
  });

  const latestEntry = currentWeekData.length > 0 ? currentWeekData[currentWeekData.length - 1] : null;
  const weekStartWeight = weeklyTargets.startWeight || 0;
  const weekEndWeight = weeklyTargets.endWeight || 0;
  
  // Calculate progress
  const weightProgress = weekEndWeight > weekStartWeight ? 
    ((latestEntry?.weight || weekStartWeight) - weekStartWeight) / (weekEndWeight - weekStartWeight) * 100 : 0;

  const weeklyData = [
    { day: 'Mon', target: weekStartWeight, actual: weekStartWeight },
    { day: 'Tue', target: weekStartWeight + (weekEndWeight - weekStartWeight) * 0.2, actual: null },
    { day: 'Wed', target: weekStartWeight + (weekEndWeight - weekStartWeight) * 0.4, actual: null },
    { day: 'Thu', target: weekStartWeight + (weekEndWeight - weekStartWeight) * 0.6, actual: null },
    { day: 'Fri', target: weekStartWeight + (weekEndWeight - weekStartWeight) * 0.8, actual: null },
    { day: 'Sat', target: weekEndWeight, actual: null },
    { day: 'Sun', target: weekEndWeight, actual: latestEntry?.weight || null }
  ];

  // Add actual data points
  currentWeekData.forEach(entry => {
    const dayOfWeek = new Date(entry.date).getDay();
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to 0-6 index
    if (dayIndex < weeklyData.length) {
      weeklyData[dayIndex].actual = entry.weight;
    }
  });

  return (
    <div className="bg-gray-700 p-4 rounded-xl shadow-lg border border-gray-600">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-gray-100">Weekly Progress</h2>
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Calendar size={16} />
          Week {currentWeek}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center p-2 bg-gray-600 rounded-lg">
          <p className="text-xs text-gray-300">Start Weight</p>
          <p className="font-bold text-gray-100">{weekStartWeight > 0 ? `${weekStartWeight.toFixed(1)} kg` : 'Not Set'}</p>
        </div>
        <div className="text-center p-2 bg-gray-600 rounded-lg">
          <p className="text-xs text-gray-300">Target Weight</p>
          <p className="font-bold text-gray-100">{weekEndWeight > 0 ? `${weekEndWeight.toFixed(1)} kg` : 'Not Set'}</p>
        </div>
      </div>

      {weekStartWeight > 0 && weekEndWeight > 0 ? (
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-gray-300">
            <span>Progress: {Math.max(0, weightProgress).toFixed(1)}%</span>
            <span>Current: {latestEntry?.weight?.toFixed(1) || weekStartWeight.toFixed(1)} kg</span>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9ca3af" fontSize={10} />
              <YAxis stroke="#9ca3af" fontSize={10} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#374151', 
                  border: '1px solid #4b5563',
                  borderRadius: '8px',
                  color: '#f9fafb'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="target" 
                stroke="#8b5cf6" 
                fill="#8b5cf6"
                fillOpacity={0.1}
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 3 }}
              />
              <Area 
                type="monotone" 
                dataKey="actual" 
                stroke="#10b981" 
                fill="#10b981"
                fillOpacity={0.3}
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span className="text-gray-300">Target</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-300">Actual</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <Target size={32} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Set weekly targets to see your progress!</p>
        </div>
      )}
    </div>
  );
};

// Metrics Dashboard Component
const MetricsDashboard = ({ latestEntry, targets, onSetTargets }) => {
  const weight = latestEntry?.weight ?? 0;
  const bodyFat = latestEntry?.bodyFat ?? 0;
  
  const leanMass = weight > 0 && bodyFat > 0 ? weight * (1 - bodyFat / 100) : 0;
  const fatMass = weight > 0 && bodyFat > 0 ? weight * (bodyFat / 100) : 0;

  const weightProgress = targets.weight > 0 ? (weight / targets.weight) * 100 : 0;
  const bodyFatProgress = targets.bodyFat > 0 ? (targets.bodyFat / bodyFat) * 100 : 0;

  return (
    <div className="bg-gray-700 p-4 rounded-xl shadow-lg border border-gray-600">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-gray-100">Current Stats</h2>
        <button 
          onClick={onSetTargets} 
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-200 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors"
        >
          <Target size={14} />
          Set Targets
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard title="Weight (kg)" value={weight.toFixed(1)} progress={weightProgress} colorClass="bg-gray-500" />
        <MetricCard title="Body Fat (%)" value={bodyFat.toFixed(1)} progress={100 - bodyFatProgress} colorClass="bg-gray-500" />
        <MetricCard title="Lean Mass (kg)" value={leanMass.toFixed(1)} colorClass="bg-gray-500" />
        <MetricCard title="Fat Mass (kg)" value={fatMass.toFixed(1)} colorClass="bg-gray-500" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="text-center p-2 bg-gray-600 rounded-lg">
          <p className="text-xs text-gray-300">Weight Target</p>
          <p className="font-bold text-gray-100">{targets.weight > 0 ? `${targets.weight.toFixed(1)} kg` : 'Not Set'}</p>
        </div>
        <div className="text-center p-2 bg-gray-600 rounded-lg">
          <p className="text-xs text-gray-300">Body Fat Target</p>
          <p className="font-bold text-gray-100">{targets.bodyFat > 0 ? `${targets.bodyFat.toFixed(1)} %` : 'Not Set'}</p>
        </div>
      </div>
    </div>
  );
};

// Data Entry Form Component
const DataEntryForm = ({ onAddEntry, onAddPhoto }) => {
  const [formData, setFormData] = useState({ weight: '', bodyFat: '' });
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.weight && formData.bodyFat) {
      onAddEntry({
        weight: parseFloat(formData.weight),
        bodyFat: parseFloat(formData.bodyFat)
      });
      
      // Add photo if selected
      if (selectedPhoto) {
        onAddPhoto(photoPreview);
      }
      
      // Reset form
      setFormData({ weight: '', bodyFat: '' });
      setSelectedPhoto(null);
      setPhotoPreview(null);
    }
  };

  return (
    <div className="bg-gray-700 p-4 rounded-xl shadow-lg border border-gray-600">
      <h2 className="text-lg font-semibold mb-3 text-gray-100">Add New Entry</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">Weight (kg)</label>
          <input
            type="number"
            step="0.1"
            value={formData.weight}
            onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-600 bg-gray-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm placeholder-gray-400"
            placeholder="70.5"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">Body Fat (%)</label>
          <input
            type="number"
            step="0.1"
            value={formData.bodyFat}
            onChange={(e) => setFormData(prev => ({ ...prev, bodyFat: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-600 bg-gray-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm placeholder-gray-400"
            placeholder="15.2"
            required
          />
        </div>
        
        {/* Photo Upload Section */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">Progress Photo (Optional)</label>
          <div className="space-y-2">
            <label className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-all text-sm">
              <Camera size={14} />
              {selectedPhoto ? 'Change Photo' : 'Add Photo'}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
            
            {photoPreview && (
              <div className="relative bg-gray-800 rounded-lg p-2">
                <div className="flex items-center justify-center min-h-[120px]">
                  <img
                    src={photoPreview}
                    alt="Photo preview"
                    className="max-w-full max-h-[120px] object-contain rounded-lg"
                    style={{ maxHeight: '120px', width: 'auto' }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPhoto(null);
                    setPhotoPreview(null);
                  }}
                  className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                  title="Remove photo"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition-all font-medium text-sm"
        >
          Add Entry
        </button>
      </form>
    </div>
  );
};

// Progress Chart Component
const ProgressChart = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <TrendingUp size={32} className="mx-auto mb-2 text-gray-300" />
        <p className="text-sm">No data yet. Add your first entry to see your progress!</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="date" 
          stroke="#6b7280"
          fontSize={10}
          tickFormatter={(date) => new Date(date).toLocaleDateString()}
        />
        <YAxis stroke="#6b7280" fontSize={10} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}
          labelFormatter={(date) => new Date(date).toLocaleDateString()}
        />
        <Line 
          type="monotone" 
          dataKey="weight" 
          stroke="#8b5cf6" 
          strokeWidth={2}
          dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 3 }}
        />
        <Line 
          type="monotone" 
          dataKey="bodyFat" 
          stroke="#10b981" 
          strokeWidth={2}
          dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// Photo Gallery Component
const PhotoGallery = ({ photos, onDeletePhoto }) => {
  return (
    <div className="bg-gray-700 p-4 rounded-xl shadow-lg border border-gray-600">
      <h2 className="text-lg font-semibold mb-3 text-gray-100">Progress Photos</h2>
      {photos.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <Camera size={32} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No photos yet. Add a photo when creating a new entry!</p>
        </div>
      ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {photos.map((photo, index) => (
                <div key={index} className="relative group bg-gray-800 rounded-lg p-2">
                  <img
                    src={photo.dataUrl}
                    alt={`Progress photo ${index + 1}`}
                    className="w-full h-32 object-contain rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 text-xs mb-6">
                      {new Date(photo.date).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => onDeletePhoto(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-700"
                      title="Delete photo"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
      )}
    </div>
  );
};

// Motivation Card Component
const MotivationCard = ({ quote, onNewQuote }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speakQuote = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(quote.text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="bg-gray-700 p-4 rounded-xl shadow-lg text-white relative overflow-hidden">

      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
            </svg>
          </div>
          <h2 className="text-lg font-semibold">Daily Motivation</h2>
        </div>
        <blockquote className="text-sm mb-3 italic">"{quote.text}"</blockquote>
        <p className="text-xs opacity-90 mb-3">— {quote.author}</p>
        <div className="flex gap-2">
          <button
            onClick={onNewQuote}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors text-sm"
          >
            <RefreshCw size={14} />
            New Quote
          </button>
          <button
            onClick={speakQuote}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all text-sm ${
              isSpeaking 
                ? 'bg-gray-500 text-gray-800' 
                : 'bg-gray-600 hover:bg-gray-500'
            }`}
            title={isSpeaking ? "Stop reading" : "Read quote aloud"}
          >
            <Volume2 size={14} />
            {isSpeaking ? "Stop" : "Read"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Target Modal Component
const TargetModal = ({ currentTargets, onSetTargets, onClose }) => {
  const [targets, setTargets] = useState(currentTargets);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSetTargets(targets);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-xl p-4 w-full max-w-sm border border-slate-700">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-100">Set Targets</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-300">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Target Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              value={targets.weight}
              onChange={(e) => setTargets(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Target Body Fat (%)</label>
            <input
              type="number"
              step="0.1"
              value={targets.bodyFat}
              onChange={(e) => setTargets(prev => ({ ...prev, bodyFat: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Weekly Start Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              value={targets.startWeight || ''}
              onChange={(e) => setTargets(prev => ({ ...prev, startWeight: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              placeholder="Current weight"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Weekly End Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              value={targets.endWeight || ''}
              onChange={(e) => setTargets(prev => ({ ...prev, endWeight: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-gray-100 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              placeholder="Target weight for this week"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-teal-600 to-teal-700 text-white py-2 px-3 rounded-lg hover:from-teal-700 hover:to-teal-800 transition-all text-sm"
            >
              Save Targets
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-600 text-gray-100 py-2 px-3 rounded-lg hover:bg-slate-500 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [data, setData] = useState(() => loadData('dataEntries', []));
  const [targets, setTargets] = useState(() => loadData('targets', { weight: 0, bodyFat: 0 }));
  const [photos, setPhotos] = useState(() => loadData('photos', []));
  const [quote, setQuote] = useState({ text: 'Your body can stand almost anything. It\'s your mind you have to convince.', author: 'Unknown' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchQuote = useCallback(() => {
    const quotes = [
      { text: 'The only bad workout is the one that didn\'t happen.', author: 'Unknown' },
      { text: 'Your body can stand almost anything. It\'s your mind you have to convince.', author: 'Unknown' },
      { text: 'Strength does not come from the physical capacity. It comes from an indomitable will.', author: 'Mahatma Gandhi' },
      { text: 'The difference between the impossible and the possible lies in determination.', author: 'Tommy Lasorda' },
      { text: 'Don\'t wish for it. Work for it.', author: 'Unknown' }
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
  }, []);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  useEffect(() => {
    saveData('dataEntries', data);
  }, [data]);

  useEffect(() => {
    saveData('targets', targets);
  }, [targets]);

  useEffect(() => {
    saveData('photos', photos);
  }, [photos]);

  const handleAddEntry = (entry) => {
    const newEntry = { ...entry, date: new Date().toISOString().split('T')[0] };
    setData(prevData => [...prevData, newEntry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  };

  const handleAddPhoto = (photoDataUrl) => {
    const newPhoto = { dataUrl: photoDataUrl, date: new Date().toISOString() };
    setPhotos(prevPhotos => [newPhoto, ...prevPhotos]);
  };

  const handleDeletePhoto = (index) => {
    setPhotos(prevPhotos => prevPhotos.filter((_, i) => i !== index));
  };
  
  const handleSetTargets = (newTargets) => {
    setTargets(newTargets);
    setIsModalOpen(false);
  };

  const latestEntry = useMemo(() => data.length > 0 ? data[data.length - 1] : null, [data]);

  return (
    <div className="min-h-screen bg-gray-800 text-gray-100 font-sans">
      <div className="max-w-7xl mx-auto p-4">
        <header className="mb-4 text-center">
          <h1 className="text-3xl font-bold text-gray-200 mb-1">Tracker</h1>
          <p className="text-sm text-gray-300">Track your fitness journey with ease</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <MetricsDashboard latestEntry={latestEntry} targets={targets} onSetTargets={() => setIsModalOpen(true)} />
            <WeeklyProgress data={data} weeklyTargets={targets} />
            <div className="bg-gray-700 p-4 rounded-xl shadow-lg border border-gray-600">
              <h2 className="text-lg font-semibold mb-3 text-gray-100">Progress Over Time</h2>
              <ProgressChart data={data} />
            </div>
            <PhotoGallery photos={photos} onDeletePhoto={handleDeletePhoto} />
          </div>

          <div className="lg:col-span-1 space-y-4">
            <DataEntryForm onAddEntry={handleAddEntry} onAddPhoto={handleAddPhoto} />
            <MotivationCard quote={quote} onNewQuote={fetchQuote} />
          </div>
        </main>
      </div>
      {isModalOpen && <TargetModal currentTargets={targets} onSetTargets={handleSetTargets} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default App;
