import pandas as pd
import joblib
import json

model_path = 'nn_model.joblib'
loaded_model = joblib.load(model_path)

def handler(event, context):
    data = json.loads(event['body'])

    input_data = pd.DataFrame([data])

    prediction = loaded_model.predict(input_data)

    response = {
        'statusCode': 200,
        'body': {'prediction': prediction.tolist()[0]}
    }

    return response
