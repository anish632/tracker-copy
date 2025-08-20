import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Camera, Target, TrendingUp, RefreshCw, Plus, X, Volume2 } from 'lucide-react';

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

// Metric Card Component
const MetricCard = ({ title, value, progress, colorClass }) => (
  <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-white/30">
    <div>
      <h3 className="text-xs font-medium text-gray-600">{title}</h3>
      <p className="text-lg font-bold text-gray-900 mt-1">{value}</p>
    </div>
    {progress !== undefined && (
      <div className="w-full bg-gray-200/50 rounded-full h-2 mt-2">
        <div className={`${colorClass} h-2 rounded-full transition-all duration-300`} style={{ width: `${Math.min(100, progress)}%` }}></div>
      </div>
    )}
  </div>
);

// Metrics Dashboard Component
const MetricsDashboard = ({ latestEntry, targets, onSetTargets }) => {
  const weight = latestEntry?.weight ?? 0;
  const bodyFat = latestEntry?.bodyFat ?? 0;
  
  const leanMass = weight > 0 && bodyFat > 0 ? weight * (1 - bodyFat / 100) : 0;
  const fatMass = weight > 0 && bodyFat > 0 ? weight * (bodyFat / 100) : 0;

  const weightProgress = targets.weight > 0 ? (weight / targets.weight) * 100 : 0;
  const bodyFatProgress = targets.bodyFat > 0 ? (targets.bodyFat / bodyFat) * 100 : 0;

  return (
    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/20">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-gray-800">Current Stats</h2>
        <button 
          onClick={onSetTargets} 
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
        >
          <Target size={14} />
          Set Targets
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard title="Weight (lbs)" value={weight.toFixed(1)} progress={weightProgress} colorClass="bg-gradient-to-r from-purple-500 to-purple-600" />
        <MetricCard title="Body Fat (%)" value={bodyFat.toFixed(1)} progress={100 - bodyFatProgress} colorClass="bg-gradient-to-r from-emerald-500 to-emerald-600" />
        <MetricCard title="Lean Mass (lbs)" value={leanMass.toFixed(1)} colorClass="bg-gradient-to-r from-blue-500 to-blue-600" />
        <MetricCard title="Fat Mass (lbs)" value={fatMass.toFixed(1)} colorClass="bg-gradient-to-r from-rose-500 to-rose-600" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="text-center p-2 bg-gray-50/50 rounded-lg">
          <p className="text-xs text-gray-600">Weight Target</p>
          <p className="font-bold text-gray-900">{targets.weight > 0 ? `${targets.weight.toFixed(1)} lbs` : 'Not Set'}</p>
        </div>
        <div className="text-center p-2 bg-gray-50/50 rounded-lg">
          <p className="text-xs text-gray-600">Body Fat Target</p>
          <p className="font-bold text-gray-900">{targets.bodyFat > 0 ? `${targets.bodyFat.toFixed(1)} %` : 'Not Set'}</p>
        </div>
      </div>
    </div>
  );
};

// Data Entry Form Component
const DataEntryForm = ({ onAddEntry }) => {
  const [formData, setFormData] = useState({ weight: '', bodyFat: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.weight && formData.bodyFat) {
      onAddEntry({
        weight: parseFloat(formData.weight),
        bodyFat: parseFloat(formData.bodyFat)
      });
      setFormData({ weight: '', bodyFat: '' });
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/20">
      <h2 className="text-lg font-semibold mb-3 text-gray-800">Add New Entry</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Weight (lbs)</label>
          <input
            type="number"
            step="0.1"
            value={formData.weight}
            onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            placeholder="155.5"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Body Fat (%)</label>
          <input
            type="number"
            step="0.1"
            value={formData.bodyFat}
            onChange={(e) => setFormData(prev => ({ ...prev, bodyFat: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            placeholder="15.2"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all font-medium text-sm"
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
const PhotoGallery = ({ photos, onAddPhoto }) => {
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => onAddPhoto(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/20">
      <h2 className="text-lg font-semibold mb-3 text-gray-800">Progress Photos</h2>
      <div className="mb-3">
        <label className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all text-sm">
          <Camera size={14} />
          Add Photo
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </label>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {photos.map((photo, index) => (
          <div key={index} className="relative group">
            <img
              src={photo.dataUrl}
              alt={`Progress photo ${index + 1}`}
              className="w-full h-24 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
              <span className="text-white opacity-0 group-hover:opacity-100 text-xs">
                {new Date(photo.date).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
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
    <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 p-4 rounded-xl shadow-lg text-white">
      <h2 className="text-lg font-semibold mb-3">Daily Motivation</h2>
      <blockquote className="text-sm mb-3 italic">"{quote.text}"</blockquote>
      <p className="text-xs opacity-90 mb-3">— {quote.author}</p>
      <div className="flex gap-2">
        <button
          onClick={onNewQuote}
          className="flex items-center gap-1 px-3 py-1.5 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors text-sm"
        >
          <RefreshCw size={14} />
          New Quote
        </button>
        <button
          onClick={speakQuote}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all text-sm ${
            isSpeaking 
              ? 'bg-white bg-opacity-40 text-purple-600' 
              : 'bg-white bg-opacity-20 hover:bg-opacity-30'
          }`}
          title={isSpeaking ? "Stop reading" : "Read quote aloud"}
        >
          <Volume2 size={14} />
          {isSpeaking ? "Stop" : "Read"}
        </button>
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
      <div className="bg-white rounded-xl p-4 w-full max-w-sm">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Set Targets</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Target Weight (lbs)</label>
            <input
              type="number"
              step="0.1"
              value={targets.weight}
              onChange={(e) => setTargets(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Target Body Fat (%)</label>
            <input
              type="number"
              step="0.1"
              value={targets.bodyFat}
              onChange={(e) => setTargets(prev => ({ ...prev, bodyFat: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 px-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all text-sm"
            >
              Save Targets
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-3 rounded-lg hover:bg-gray-300 transition-colors text-sm"
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
  
  const handleSetTargets = (newTargets) => {
    setTargets(newTargets);
    setIsModalOpen(false);
  };

  const latestEntry = useMemo(() => data.length > 0 ? data[data.length - 1] : null, [data]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 text-gray-900 font-sans">
      <div className="max-w-7xl mx-auto p-4">
        <header className="mb-4 text-center">
          <h1 className="text-3xl font-bold text-purple-600 mb-1">Body Progress Tracker</h1>
          <p className="text-sm text-gray-600">Track your fitness journey with ease</p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <MetricsDashboard latestEntry={latestEntry} targets={targets} onSetTargets={() => setIsModalOpen(true)} />
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/20">
              <h2 className="text-lg font-semibold mb-3 text-gray-800">Progress Over Time</h2>
              <ProgressChart data={data} />
            </div>
            <PhotoGallery photos={photos} onAddPhoto={handleAddPhoto} />
          </div>

          <div className="lg:col-span-1 space-y-4">
            <DataEntryForm onAddEntry={handleAddEntry} />
            <MotivationCard quote={quote} onNewQuote={fetchQuote} />
          </div>
        </main>
      </div>
      {isModalOpen && <TargetModal currentTargets={targets} onSetTargets={handleSetTargets} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default App;
