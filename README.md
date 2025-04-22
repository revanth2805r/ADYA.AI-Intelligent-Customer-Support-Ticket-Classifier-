

# 🧠 Intelligent Customer Support Ticket Classifier

An AI-powered MERN stack web application designed to help support teams efficiently manage, classify, and prioritize customer tickets. This platform includes role-based access, real-time communication, automated ticket categorization using ML, and insightful dashboards. It automatically assigns tickets, detects sentiment and urgency, and ensures timely responses. The system empowers admins, agents, and customers with a seamless support experience.

---

## 🔧 File Structure

### Client (Frontend)
```
client/
├── node_modules/
├── src/
│   ├── components/     # Reusable UI components
│   ├── context/        # React Context API for global state (e.g., auth)
│   ├── features/       # Redux Toolkit slices
│   ├── pages/          # Page components for different routes
│   ├── routes/         # App routes and route guards
│   ├── utils/          # Utility functions 
│   ├── App.jsx         # App root component
│   ├── App.css
│   ├── index.js
│   ├── index.css
│   ├── main.jsx        # Vite entry point
│   ├── store.js        # Redux store configuration
├── .gitignore
├── index.html
```

### Server (Backend)
```
server/
├── ml/                        # Machine Learning model and encoders
├── node_modules/
├── src/
│   ├── config/                # Environment and DB config
│   ├── controllers/           # Route logic handlers
│   ├── middlewares/           # Auth and error middlewares
│   ├── models/                # Mongoose schemas
│   ├── routes/                # API route definitions
│   ├── services/              # ML integration and ticket logic
│   ├── utils/                 # Utility helpers
│   └── app.js                 # Entry point for Express app
├── .env
```

---

## 📦 API Endpoints

### Authentication

- `POST /api/users/register` — Register a new user (Customer, Agent, Admin)
- `POST /api/users/login` — Login and receive JWT token

### Tickets

- `POST /api/tickets/` — Create a new ticket (Customer only)
- `GET /api/tickets/` — Fetch tickets (Role-based access)
- `PUT /api/tickets/:ticketId` — Update ticket details (Admin & Support)
- `PUT /api/tickets/:ticketId/assign` — Assign ticket to agent (Admin & Support)
- `POST /api/tickets/:ticketId/messages` — Add a message to the ticket chat
- `PUT /api/tickets/:ticketId/rating` — Submit ticket rating (Customer only)

---

## 🚀 Features

### Authentication
- Secure login/signup for Customers, Support Agents, and Admins  
- Role-based JWT authentication  

### Ticket Management
- Create, view, update, and assign tickets  
- Real-time chat on tickets  
- Filter tickets by status, type, and priority  

### Dashboard
- Track tickets by category, urgency, and resolution status 
- View customer satisfaction ratings  

### AI Classification
- Auto-label tickets for priority and category  
- Assign tickets to available support agents  

### Role Access
- **Customer**: Create/view own tickets, chat, submit reviews  
- **Agent**: View assigned tickets, update status, chat  
- **Admin**: View all tickets, assign/update, chat with users  

---

## 🤖 AI Model Overview

- **Embedding**: Uses `SentenceTransformer (all-MiniLM-L6-v2)` for ticket text
- **Classifier**: `XGBoost` multi-output model for:
  - Queue (type)
  - Priority
  - Sentiment

```python
embedding = model.encode([text])
pred_encoded = multi_output_model.predict(embedding)[0]
predictions = {
    'queue': label_encoders['queue'].inverse_transform([pred_encoded[0]])[0],
    'priority': label_encoders['priority'].inverse_transform([pred_encoded[1]])[0],
    'sentiment': label_encoders['sentiment'].inverse_transform([pred_encoded[2]])[0]
}
```

---

## 🛠️ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/revanth2805r/ADYA.AI-Intelligent-Customer-Support-Ticket-Classifier-.git
cd ADYA.AI-Intelligent-Customer-Support-Ticket-Classifier-
```

### 2. Backend Setup
```bash
cd server
npm install
pip install joblib numpy sentence-transformers xgboost
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```

---

## 📽️ Demo

A demo video walkthrough showcasing:
- User registration and login  
- Ticket submission and AI classification  
- Role-based access and views  
- Real-time messaging on tickets  
- Dashboard analytics

📺 [Watch the Demo Video](https://drive.google.com/file/d/1t6RV9b5Bw30K3eWr0NhmXAFf82pIFPhz/view)
