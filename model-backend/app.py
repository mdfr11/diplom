from flask import Flask, request, jsonify
import pandas as pd
import joblib

model_path = 'nn_model.joblib'
loaded_model = joblib.load(model_path)

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    input_data = pd.DataFrame([data])
    prediction = loaded_model.predict(input_data)
    
    return jsonify({'prediction': prediction.tolist()[0]})

if __name__ == '__main__':
    app.run(debug=True)
