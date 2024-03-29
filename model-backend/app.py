from flask import Flask, request, jsonify
import pandas as pd
import joblib
import numpy as np

model_path = 'nn_model.joblib'
scaler_path = 'scaler.joblib'

loaded_model = joblib.load(model_path)
scaler = joblib.load(scaler_path)

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    scaled_input_data = scaler.transform(np.array([data['data']]))

    prediction = loaded_model.predict(scaled_input_data)
    
    return jsonify({'prediction': prediction.tolist()[0]})

if __name__ == '__main__':
    app.run(debug=True)
