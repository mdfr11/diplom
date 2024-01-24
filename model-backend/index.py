import pandas as pd
import joblib
import json
import numpy as np

model_path = 'nn_model.joblib'
scaler_path = 'scaler.joblib'

loaded_model = joblib.load(model_path)
scaler = joblib.load(scaler_path)

def handler(event, context):
    data = json.loads(event['body'])

    scaled_input_data = scaler.transform(np.array([data['data']]))

    prediction = loaded_model.predict(scaled_input_data)

    response = {
        'statusCode': 200,
        'body': {'prediction': prediction.tolist()[0]}
    }

    return response
