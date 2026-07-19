from fastapi import FastAPI, HTTPException, status 
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import httpx
from database import engine
from sqlalchemy import text
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta, timezone

load_dotenv()

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)   

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY environment variable is missing!")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

app = FastAPI(title="Global Travel Budget Tracker")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

class BudgetCreate(BaseModel):
    country: str
    departure_date: str
    return_date: str
    budget_amount: float
    budget_currency: str
    country_currency: str

class ExpenseCreate(BaseModel):
    country: str
    city: str
    category: str
    expense_amount: float
    expense_date: str

class UserRegister(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

@app.get("/")
def home():
    return {"message":"Welcome to NomadLedger!"}

@app.get("/convert")
async def convert_currency(amount: float, from_currency: str, to_currency: str):
    
    from_currency = from_currency.upper()
    to_currency = to_currency.upper()

    LIVE_API_URL = f"https://open.er-api.com/v6/latest/{from_currency}"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(LIVE_API_URL, timeout=10.0)
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to fetch live exchange rates.")
        data = response.json()

    live_rates = data.get("rates", {})
    if to_currency not in live_rates:
        raise HTTPException(status_code=400, detail="Currency code not supported.")
    
    converted_amount = amount*live_rates[to_currency]

    return{
        "original_amount": amount,
        "from_currency": from_currency,
        "to_currency": to_currency,
        "converted_amount": round(converted_amount, 2),
        "source": "Exchangerate-API"
    }

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        
        if email is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid token")
        
        return email
    
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.post("/budgets", status_code=status.HTTP_201_CREATED)
async def create_budget(budget: BudgetCreate, email: str = Depends(get_current_user)):
    country_key = (budget.country.lower())
    
    from_currency = budget.budget_currency.upper()
    to_currency = budget.country_currency.upper()

    url = f"https://open.er-api.com/v6/latest/{from_currency}"

    async with httpx.AsyncClient() as client:
        response = await client.get(url, timeout=10.0)

    if response.status_code != 200:
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch exchange rates."
        )

    data = response.json()

    rates = data.get("rates", {})

    if to_currency not in rates:
        raise HTTPException(
            status_code=400,
            detail="Unsupported country currency."
        )

    converted_budget = (
        budget.budget_amount*rates[to_currency]
    )

    with engine.begin() as conn:

        user = conn.execute(
            text("""
            SELECT id
            FROM users
            WHERE email = :email
        """),
        {"email": email}
        ).fetchone()

        user_id = user._mapping["id"]

        existing_budget = conn.execute(
            text("""
            SELECT id
            FROM budgets
            WHERE country = :country
            AND user_id = :user_id
        """),
        {
        "country": country_key,
        "user_id": user_id
        }
        ).fetchone()

        if existing_budget:
            raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This budget already exists."
        )

        conn.execute(
        text("""
            INSERT INTO budgets
            (
                country,
                departure_date,
                return_date,
                original_budget,
                original_currency,
                country_currency,
                converted_budget,
                user_id
            )
            VALUES
            (
                :country,
                :departure_date,
                :return_date,
                :original_budget,
                :original_currency,
                :country_currency,
                :converted_budget,
                :user_id
            )
        """),
        {
            "country": country_key,
            "departure_date": budget.departure_date,
            "return_date": budget.return_date,
            "original_budget": budget.budget_amount,
            "original_currency": budget.budget_currency.upper(),
            "country_currency": budget.country_currency.upper(),
            "converted_budget": round(converted_budget, 2),
            "user_id": user_id
        }
        )
    
    return {
    "message": "Budget created successfully.",
    "country": country_key.title(),
    "country_currency": budget.country_currency.upper(),
    "converted_budget": round(converted_budget, 2),
    "departure_date": budget.departure_date,
    "return_date": budget.return_date
}

@app.get("/budgets")
def get_all_budgets(email: str = Depends(get_current_user)):
    with engine.connect() as conn:

        user = conn.execute(
            text("""
                SELECT id
                FROM users
                WHERE email = :email
            """),
            {"email": email}
        ).fetchone()

        user_id = user._mapping["id"]

        budgets = conn.execute(
            text("""
                SELECT country
                FROM budgets
                WHERE user_id = :user_id
            """),
            {"user_id": user_id}
        ).fetchall()

        return {
            "active_budgets": [
                row._mapping["country"]
                for row in budgets
            ]
        }
        
@app.post("/expenses", status_code=status.HTTP_201_CREATED)
def add_expense(expense: ExpenseCreate, email: str = Depends(get_current_user)):

    country_key = expense.country.strip().lower()

    with engine.connect() as conn:

        user = conn.execute(
            text("""
                SELECT id
                FROM users
                WHERE email = :email
            """),
            {"email": email}
        ).fetchone()

        user_id = user._mapping["id"]

        country_key = expense.country.strip().lower()
        
        existing_budget = conn.execute(
        text("""
        SELECT id
        FROM budgets
        WHERE country = :country
        AND user_id = :user_id
        """),
        {
        "country": country_key,
        "user_id": user_id
        }
        ).fetchone()

        if not existing_budget:
            raise HTTPException(
            status_code=404,
            detail="Budget not found"
        )

        budget = conn.execute(
            text("""
            SELECT country_currency
            FROM budgets
            WHERE country = :country
            AND user_id = :user_id
        """),
        {
        "country": country_key,
        "user_id": user_id
        }
        ).fetchone()

        country_currency = budget._mapping["country_currency"]

        conn.execute(
            text("""
                INSERT INTO expenses
                (
                    country,
                    city,
                    category,
                    amount,
                    expense_date,
                    user_id
                )
                VALUES
                (
                    :country,
                    :city,
                    :category,
                    :amount,
                    :expense_date,
                    :user_id
                )
            """),
            {
                "country": expense.country.strip().lower(),
                "city": expense.city,
                "category": expense.category,
                "amount": expense.expense_amount,
                "expense_date": expense.expense_date,
                "user_id": user_id
            }
        )

        conn.commit()
        
        return {
                "message": "Expense added successfully.",
                "country_currency": country_currency,
                "expense": {
                    "country": expense.country.title(),
                    "city": expense.city.title(),
                    "category": expense.category.capitalize(),
                    "amount": expense.expense_amount,
                    "expense_date": expense.expense_date,
                    "country_currency": budget._mapping["country_currency"]
                }
            }

@app.get("/summary/{country}")
def get_summary(country: str, email: str = Depends(get_current_user)):

    country_key = country.lower()

    with engine.connect() as conn:

        user = conn.execute(
            text("""
                SELECT id
                FROM users
                WHERE email = :email
            """),
            {"email": email}
        ).fetchone()

        user_id = user._mapping["id"]

        budget = conn.execute(
            text("""
                SELECT *
                FROM budgets
                WHERE country = :country
                AND user_id = :user_id
            """),
            {
                "country": country_key,
                "user_id": user_id
            }
        ).fetchone()

        if not budget:
            raise HTTPException(
                status_code=404,
                detail="Budget not found"
            )

        expenses = conn.execute(
            text("""
                SELECT *
                FROM expenses
                WHERE country = :country
                AND user_id = :user_id
            """),
            {
                "country": country_key,
                "user_id": user_id
            }
        ).fetchall()

        total_spent = sum(
            row._mapping["amount"]
            for row in expenses
        )

        daily_spending = {}

    budget_amount = budget._mapping["converted_budget"]

    accommodation_spent = 0
    food_spent = 0
    attractions_spent = 0
    shopping_spent = 0
    flights_spent = 0
    utilities_spent = 0
    healthcare_spent = 0
    transport_spent = 0
    other_spent = 0

    cities_visited = set()

    daily_spending = {}

    for expense in expenses:

        cities_visited.add(expense._mapping["city"])

        amount = expense._mapping["amount"]

        category = expense._mapping["category"].lower()

        date = str(expense._mapping["expense_date"])

        amount = expense._mapping["amount"]

        if date not in daily_spending:
            daily_spending[date] = 0

        daily_spending[date] += amount

        if category == "accommodation":
            accommodation_spent += amount
        elif category == "food":
            food_spent += amount
        elif category == "attractions":
            attractions_spent += amount
        elif category == "shopping":
            shopping_spent += amount
        elif category == "flights":
            flights_spent += amount    
        elif category == "utilities":
            utilities_spent += amount
        elif category == "healthcare":
            healthcare_spent += amount    
        elif category == "transport":
            transport_spent += amount
        else:
            other_spent += amount

    total_spent = accommodation_spent + food_spent + flights_spent + utilities_spent + healthcare_spent + transport_spent + attractions_spent + shopping_spent + other_spent
           
    remaining = budget_amount - total_spent

    return {
    "country": country_key,

    "cities_visited": [
    city.title()
    for city in cities_visited],

    "departure_date": budget._mapping["departure_date"],

    "return_date": budget._mapping["return_date"],

    "original_budget": budget._mapping["original_budget"],

    "original_currency": budget._mapping["original_currency"],
  
    "country_currency": budget._mapping["country_currency"],

    "converted_budget": budget._mapping["converted_budget"],

    "daily_spending": daily_spending,
    "accommodation_spent": accommodation_spent,
    "food_spent": food_spent,
    "shopping_spent": shopping_spent,
    "attractions_spent": attractions_spent,
    "transport_spent": transport_spent,
    "flights_spent": flights_spent,
    "utilities_spent": utilities_spent,
    "healthcare_spent": healthcare_spent,
    "other_spent": other_spent,

    "total_spent": total_spent,

    "remaining_budget": round(remaining, 2)
}

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
    minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt

@app.post("/register")
def register(user: UserRegister):

    hashed_password = pwd_context.hash(user.password)

    with engine.connect() as conn:

        existing_user = conn.execute(
            text("""
                SELECT id
                FROM users
                WHERE email = :email
                OR username = :username
            """),
            {
                "email": user.email,
                "username": user.username
            }
        ).fetchone()

        if existing_user:
            raise HTTPException(
                status_code=409,
                detail="Email or username already exists"
            )

        conn.execute(
            text("""
                INSERT INTO users
                (
                    username,
                    email,
                    password_hash
                )
                VALUES
                (
                    :username,
                    :email,
                    :password_hash
                )
            """),
            {
                "username": user.username,
                "email": user.email,
                "password_hash": hashed_password
            }
        )

        conn.commit()

    return {
        "message": "User registered successfully."
    }

@app.post("/login")
def login(login: UserLogin):
    with engine.connect() as conn:

        # 1. Fetch user from DB
        user = conn.execute(
            text("""
                SELECT *
                FROM users
                WHERE email = :email
            """),
            {"email": login.email}
        ).fetchone()

        # 2. Check if user exists
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # 3. Verify password
        if not pwd_context.verify(
            login.password,
            user._mapping["password_hash"]
        ):
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # 4. Success response
        access_token = create_access_token(
    data={
        "sub": user._mapping["email"]
    }
)
        return {
        "access_token": access_token,
        "token_type": "bearer"
        }
    
@app.get("/protected")
def protected_route(
    _: str = Depends(get_current_user)
):
    return {
        "message": "Access granted"
    }
