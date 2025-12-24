# Expense Sharing Application (Backend)

This project is a simplified backend implementation of an expense sharing application similar to Splitwise.

# Tech Stack
- Node.js
- Express.js
- JavaScript

# Features Implemented
- Create users
- Create groups
- Add expenses with:
  - Equal split
  - Exact amount split
  - Percentage split
- Track balances (who owes whom)
- Settle dues

# How to Run the Project

1. Clone the repository / extract the zip
2. Navigate to the project directory
3. Install dependencies:
4. Start the server:
5. Server runs at:http://localhost:3000


# API Endpoints

# Create User
POST /users

# Create Group
POST /groups

# Add Expense
POST /expenses

Supported split types:
- EQUAL
- EXACT
- PERCENT

# View User Balances
GET /users/:userId/balances

# Settle Dues
POST /settle

---

# Design Notes & Assumptions
- Data is stored in-memory for simplicity.
- Restarting the server clears all data.
- Balances are tracked using user IDs to ensure consistency.
- Input validations are performed to handle invalid splits and users.

---

# Future Improvements
- Persist data using a database (MongoDB)
- Authentication and authorization
- Balance simplification to minimize transactions
- Frontend UI integration
- Multi-currency support


# Author
Yash Simar
