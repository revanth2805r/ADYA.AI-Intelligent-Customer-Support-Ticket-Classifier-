import sys
import json
import joblib
import numpy as np
from sentence_transformers import SentenceTransformer
import multi_output_xgb_model.joblib from './multi_output_xgb_model.joblib'
import label_encoders.joblib from './label_encoders.joblib'
# Load the SentenceTransformer model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Load the pre-trained XGBoost model and label encoders from saved files
try:
    multi_output_model = joblib.load(r'multi_output_xgb_model.joblib')
    label_encoders = joblib.load(r'label_encoders.joblib')
except Exception as e:
    print(json.dumps({
        "error": f"Failed to load model: {str(e)}",
        "queue": "technical",  # Default fallback values
        "priority": "low",
        "sentiment": "neutral"
    }))
    sys.exit(1)

def predict(text):
    try:
        # Get the text embedding using the SentenceTransformer
        embedding = model.encode([text])
        
        # Predict using the multi-output classifier
        pred_encoded = multi_output_model.predict(embedding)[0]
        
        # Decode the predictions for each category
        predictions = {
            'queue': label_encoders['queue'].inverse_transform([pred_encoded[0]])[0],
            'priority': label_encoders['priority'].inverse_transform([pred_encoded[1]])[0],
            'sentiment': label_encoders['sentiment'].inverse_transform([pred_encoded[2]])[0]
        }
        
        return predictions
    except Exception as e:
        # Return default predictions if an error occurs
        return {
            'queue': 'general',
            'priority': 'low',
            'sentiment': 'neutral'
        }

if __name__ == "__main__":
    # Get the input text from command line arguments
    if len(sys.argv) > 1:
        text_input = sys.argv[1]
    else:
        text_input = "Default ticket message for testing"
    
    # Get predictions
    predictions = predict(text_input)
    
    # Print the predictions in JSON format
    print(json.dumps(predictions))