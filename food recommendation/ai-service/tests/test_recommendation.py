import pytest
from app.services.health_calculator import calculate_bmi
from app.schemas.models import UserProfile

def test_calculate_bmi():
    assert calculate_bmi(72, 175) == 23.51

def test_user_profile():
    user = UserProfile(
        age=30,
        gender="Male",
        height=175.0,
        weight=70.0,
        activity_level="Sedentary",
        goal="Weight Loss",
        diet_type="Non-Vegetarian"
    )
    assert user.age == 30
