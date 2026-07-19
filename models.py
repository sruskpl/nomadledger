from sqlalchemy import (
    MetaData,
    Table,
    Column,
    Integer,
    String,
    Float
)

metadata = MetaData()

budgets = Table(
    "budgets",
    metadata,

    Column("id", Integer, primary_key=True),
    Column("country", String),
    Column("departure_date", String),
    Column("return_date", String),
    Column("original_budget", Float),
    Column("original_currency", String),
    Column("country_currency", String),
    Column("converted_budget", Float),
    Column("user_id", Integer)
)

expenses = Table(
    "expenses",
    metadata,

    Column("id", Integer, primary_key=True),
    Column("country", String),
    Column("city", String),
    Column("category", String),
    Column("amount", Float),
    Column("expense_date", String),
    Column("user_id", Integer)
)

users = Table(
    "users",
    metadata,

    Column("id", Integer, primary_key=True),
    Column("username", String, unique=True),
    Column("email", String, unique=True),
    Column("password_hash", String)
)