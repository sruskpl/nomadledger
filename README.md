# NomadLedger

A full-stack travel budget management application that helps users plan trips, track expenses, convert currencies using live exchange rates, and visualize spending through interactive dashboards.

## Project Overview

NomadLedger is a full-stack travel budget management application designed to help users plan budgets, track expenses, convert currencies, and visualize spending through interactive analytics. The project was built to explore modern backend development practices, authentication, database design, and frontend-backend integration within a realistic use case.

## Key Highlights

- Secure JWT-based authentication and authorization.
- PostgreSQL Database.
- RESTful APIs built with FastAPI.
- Live currency conversion using ExchangeRate-API.
- Interactive spending analytics powered by Chart.js.
- Clean and responsive user interface built with HTML, CSS and JavaScript.

## Features

### Authentication & Security
- User registration and login.
- Password hashing using Passlib (bcrypt).
- JWT-based authentication.
- Authorization for protected API routes.
- Automatic session expiration after token expiry.
### Currency Conversion
- Convert between multiple international currencies.
- Fetch live exchange rates using ExchangeRate-API.
### Travel Budget Management
- Create travel budgets for any destination country.
- Supports both domestic and international trips.
- Set departure and return dates.
- Define the total trip budget in the destination currency.
### Expense Management
- Add categorized expenses for each trip.
- Track expenses by city, category, amount, and date.
- Real-time budget updates after every expense.
### Analytics & Insights
- Visualize spending trends over time.
- View total spending for the selected trip.
- View category-wise expense breakdowns.
- Budget utilization progress bar.
### User Experience
- Clean and responsive user interface.
- Country selection based on user-created budgets.
- Session timeout handling.
- Interactive dashboard with charts.

## Tech Stack

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript
- Chart.js
### Backend
- FastAPI
- Python
### Database
- PostgreSQL
- SQLAlchemy
### Authentication
- JWT (JSON Web Tokens)
- Passlib (bcrypt)
### APIs
- ExchangeRate-API
### Development Tools
- VS Code
- Git
- GitHub

## Architecture

NomadLedger follows a client-server architecture.
- The frontend is built using HTML, CSS, and JavaScript.
- FastAPI provides RESTful APIs that handle the application's business logic.
- SQLAlchemy handles database interactions.
- PostgreSQL stores user, budget, and expense data.
- JWT secures protected endpoints.
- Chart.js visualizes travel spending analytics.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register`          | Register a new user                                           |
| POST | `/login`             | Authenticate a user and return a JWT access token             |
| GET  | `/convert`           | Convert currencies using live exchange rates                  |
| POST | `/budgets`           | Create a new travel budget                                    |
| GET  | `/budgets`           | Retrieve all travel budgets created by the authenticated user |
| POST | `/expenses`          | Record a travel expense                                       |
| GET  | `/summary/{country}` | Retrieve the spending summary for a selected trip                 |

## Screenshots

### Register
![Register Page](assets/images/Register.png)

### Login
![Login Page](assets/images/Login.png)

### Currency Converter
![Currency Converter](assets/images/Currency%20Exchange.png)

### Travel Budget Setup
![Budget Setup](assets/images/Travel%20Budget%20Setup.png)

### Expense Management
![Expense Management](assets/images/Expense%20Management.png)

### Budget Summary
![Budget Summary](assets/images/Financial%20Overview.png)

### Trip Intelligence
![Trip Intelligence](assets/images/Trip%20Intelligence.png)

## Installation

### 1. Clone the repository:
```bash
git clone https://github.com/sruskpl/nomadledger.git
```
### 2.Navigate to the project:
```bash
cd nomadledger
```
### 3.Create and activate a virtual environment:
```bash
python -m venv .venv
```
**Windows**
```bash
.venv\Scripts\activate
```
### 4.Install the required dependencies:
```bash
pip install -r requirements.txt
```

## Environment Variables

Create a `.env` file in the project root and add the following variables:

```env
DATABASE_URL=your_postgresql_database_url
SECRET_KEY=your_secret_key
```

Replace the placeholders with your own PostgreSQL database URL and a secure secret key.

## Running the Project

Start the FastAPI backend:

```bash
python -m uvicorn main:app --reload --port 5000
```

Once the backend server is running, open `auth.html` in your browser to start using the application.

## Future Improvements

Although NomadLedger is fully functional, there are several enhancements planned for future versions:
- Add descriptions for individual expenses to better distinguish multiple expenses within the same category.
- Allow users to edit and delete budgets and expenses.
- Prevent expenses from being added outside the selected travel dates.
- Notify users when spending approaches or exceeds the allocated budget.
- Implement refresh tokens for seamless user authentication without requiring frequent logins.

## Skills Demonstrated

- FastAPI Backend Development
- REST API Development
- JWT Authentication & Authorization
- Password Hashing with bcrypt
- PostgreSQL Database Design
- SQLAlchemy
- Currency API Integration
- Frontend-Backend Communication
- Data Visualization with Chart.js
- Git & GitHub

## Author

Developed by Srushti Sakpal.
