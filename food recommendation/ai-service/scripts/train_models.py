import os
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "trained_models")

def train():
    os.makedirs(MODELS_DIR, exist_ok=True)
    
    # Very simple mock training
    X = np.random.rand(100, 20)
    y = np.random.randint(0, 2, 100)
    
    # Food Recommendation Model
    rf_rec = RandomForestClassifier(n_estimators=10)
    rf_rec.fit(X, y)
    joblib.dump(rf_rec, os.path.join(MODELS_DIR, "rf_recommendation.joblib"))
    
    # Health Risk Model
    X_risk = np.random.rand(100, 10) # 10 features for user
    y_risk = np.random.randint(0, 2, (100, 4)) # 4 outputs
    rf_risk = RandomForestClassifier(n_estimators=10)
    rf_risk.fit(X_risk, y_risk)
    joblib.dump(rf_risk, os.path.join(MODELS_DIR, "rf_risk_predictor.joblib"))
    
    print("Models trained and saved successfully.")

if __name__ == "__main__":
    train()
