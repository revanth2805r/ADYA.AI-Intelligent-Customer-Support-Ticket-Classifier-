import sys
import json
import joblib
import numpy as np
from sentence_transformers import SentenceTransformer

# Load the SentenceTransformer model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Load the pre-trained XGBoost model and label encoders from saved files
multi_output_model = joblib.load('multi_output_xgb_model.joblib')
label_encoders = joblib.load('label_encoders.joblib')

def predict(text):
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

if _name_ == "_main_":
    # Get the input text from command line arguments
    text_input = sys.argv[1]
    
    # Get predictions
    predictions = predict(text_input)
    
    # Print the predictions in JSON format
    print(json.dumps(predictions))