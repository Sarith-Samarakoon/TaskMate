from flask import Flask, request, jsonify
import joblib
import pandas as pd
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from React Native

# Load the model and encoders
model = joblib.load('task_time_predictor_model.pkl')
label_encoders = joblib.load('label_encoders.pkl')
le_time = joblib.load('time_label_encoder.pkl')

# Function to determine time of day based on hour
def get_time_of_day(hour):
    if 5 <= hour < 12:
        return 'Morning'
    elif 12 <= hour < 18:
        return 'Afternoon'
    else:
        return 'Evening'

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    try:
        # Prepare input DataFrame including the deadline
        input_df = pd.DataFrame([{
            'priority': data['priority'],
            'category': data['category'],
            'skipCount': data['skipCount'],
            'title': data['title'],
            'deadline': data['deadline']  # Include deadline in the input DataFrame
        }])

        # Extract hour from the deadline
        input_df['hour'] = pd.to_datetime(input_df['deadline']).dt.hour

        # Define time of day from hour
        input_df['time_of_day'] = input_df['hour'].apply(get_time_of_day)

        # Handle skipCount > 3
        if data['skipCount'] > 3:
            predicted_time = input_df['time_of_day'].iloc[0]
            return jsonify({'predicted_time': predicted_time})

        return jsonify({'predicted_time': 'No prediction due to low skip count.'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)

