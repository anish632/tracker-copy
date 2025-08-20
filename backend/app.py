from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from datetime import datetime, timedelta
import numpy as np

app = Flask(__name__)
CORS(app)

# Simple in-memory storage (in production, use a database)
data_store = {
    'entries': [],
    'targets': {'weight': 0, 'bodyFat': 0},
    'photos': []
}

@app.route('/api/entries', methods=['GET'])
def get_entries():
    """Get all data entries"""
    return jsonify(data_store['entries'])

@app.route('/api/entries', methods=['POST'])
def add_entry():
    """Add a new data entry"""
    entry = request.json
    entry['date'] = datetime.now().isoformat()
    data_store['entries'].append(entry)
    return jsonify({'message': 'Entry added successfully', 'entry': entry})

@app.route('/api/targets', methods=['GET'])
def get_targets():
    """Get current targets"""
    return jsonify(data_store['targets'])

@app.route('/api/targets', methods=['POST'])
def set_targets():
    """Set new targets"""
    data_store['targets'] = request.json
    return jsonify({'message': 'Targets updated successfully'})

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    """Get analytics data"""
    if not data_store['entries']:
        return jsonify({'error': 'No data available'})
    
    entries = data_store['entries']
    
    # Calculate basic statistics
    weights = [entry['weight'] for entry in entries]
    body_fats = [entry['bodyFat'] for entry in entries]
    
    analytics = {
        'total_entries': len(entries),
        'weight': {
            'current': weights[-1] if weights else 0,
            'average': np.mean(weights) if weights else 0,
            'min': min(weights) if weights else 0,
            'max': max(weights) if weights else 0,
            'trend': 'increasing' if len(weights) > 1 and weights[-1] > weights[-2] else 'decreasing'
        },
        'bodyFat': {
            'current': body_fats[-1] if body_fats else 0,
            'average': np.mean(body_fats) if body_fats else 0,
            'min': min(body_fats) if body_fats else 0,
            'max': max(body_fats) if body_fats else 0,
            'trend': 'increasing' if len(body_fats) > 1 and body_fats[-1] > body_fats[-2] else 'decreasing'
        }
    }
    
    return jsonify(analytics)

@app.route('/api/progress', methods=['GET'])
def get_progress():
    """Get progress towards targets"""
    if not data_store['entries']:
        return jsonify({'error': 'No data available'})
    
    latest_entry = data_store['entries'][-1]
    targets = data_store['targets']
    
    progress = {
        'weight': {
            'current': latest_entry['weight'],
            'target': targets['weight'],
            'progress_percentage': (latest_entry['weight'] / targets['weight'] * 100) if targets['weight'] > 0 else 0
        },
        'bodyFat': {
            'current': latest_entry['bodyFat'],
            'target': targets['bodyFat'],
            'progress_percentage': (targets['bodyFat'] / latest_entry['bodyFat'] * 100) if latest_entry['bodyFat'] > 0 else 0
        }
    }
    
    return jsonify(progress)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
