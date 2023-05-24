CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    last_login TIMESTAMP
);

CREATE TABLE calculator (
    id SERIAL PRIMARY KEY,
    num1 INTEGER,
    num2 INTEGER,
    operator VARCHAR(1),
    result INTEGER,
    user_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)