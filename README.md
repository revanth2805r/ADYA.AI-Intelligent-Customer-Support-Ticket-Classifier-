# 🧠 Intelligent Customer Support Ticket Classifier

An **AI-powered MERN stack web application** designed to help support teams efficiently manage, classify, and prioritize customer tickets. This platform includes **role-based access**, **real-time communication**, **automated ticket categorization using ML**, and **insightful dashboards**.

---

## 🚀 Features

### 🔐 Authentication
- Secure **Login & Signup** for Customers, Support Agents, and Admins  
- Role assignment during registration  
- **JWT-based authentication**

### 🧾 Ticket Management
- **Create Tickets** (Customer only)  
- **View & Update Tickets** (Support Agents & Admins)  
- **Real-time chat** within tickets  
- **Search & Filter Tickets** by:
  - Status: `Open`, `In Progress`, `Resolved`, `Closed`
  - Type: `Technical`, `Billing`, etc.
  - Priority: `Low`, `Medium`, `High`

### 📊 Dashboard
- 🔍 **Advanced search & filtering**  
- 📌 **Tickets by category**  
- 🚨 **Most urgent unresolved tickets**  
- 😊 **Customer satisfaction ratings**

### 🤖 AI-Powered Classification
- On ticket submission:
  - Ticket is **analysed by a machine learning model**
  - Automatically detects:
    - **Priority**
    - **Sentiment**
    - **Type**
  - Ticket is then **randomly assigned** to an available support agent

### 🧑‍💻 Role-Based Access

#### 👤 Customer
- Create new tickets  
- Chat with support and admins  
- View **own tickets only**  
- Leave a **review** after ticket closure

#### 🛠️ Support Agent
- Cannot create tickets  
- Can **view assigned tickets**  
- Chat with customers  
- **Update ticket status**

#### 🧑‍⚖️ Admin
- Cannot create tickets  
- Can **view all tickets**  
- Chat with customers  
- **Update ticket status**

---

## 🤖 AI Model Overview

**Machine Learning Pipeline:**
- **SentenceTransformer**:  
  Uses `all-MiniLM-L6-v2` to embed ticket text
- **XGBoost**:  
  Multi-output classifier predicts:
  - `queue` (type)
  - `priority`
  - `sentiment`

```python
# Get the text embedding using the SentenceTransformer
embedding = model.encode([text])
        
# Predict using the multi-output classifier
pred_encoded = multi_output_model.predict(embedding)[0]

# Prediction decoding example
predictions = {
    'queue': label_encoders['queue'].inverse_transform([pred_encoded[0]])[0],
    'priority': label_encoders['priority'].inverse_transform([pred_encoded[1]])[0],
    'sentiment': label_encoders['sentiment'].inverse_transform([pred_encoded[2]])[0]
}
```

---

## 🧠 Technologies Used

### 💻 Frontend
- React (Vite)  
- Tailwind CSS  
- Material UI  
- Redux Toolkit  

### 🖥️ Backend
- Node.js + Express  
- MongoDB + Mongoose  
- JWT Authentication  
- RESTful APIs  

### 🤖 Machine Learning
- SentenceTransformers  
- XGBoost  
- Joblib  


---

## 🛠️ Setup Instructions

### 🔐 Environment Variables
Create a `.env` file in the `server/` directory:
```env
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
PORT=your_port
```

### 📦 Backend Setup
```bash
cd server
pip install joblib numpy sentence-transformers xgboost
npm install
npm run dev
```

### 🖥️ Frontend Setup
```bash
cd client
npm install
npm run dev
```

---

## 📽️ Demo Video

🎥 A video walkthrough showing:
- User registration and login  
- Ticket submission and AI classification  
- Role-based ticket views  
- Real-time chat  
- Dashboard visualizations

📺 [Watch the Demo Video](https://drive.google.com/file/d/1t6RV9b5Bw30K3eWr0NhmXAFf82pIFPhz/view)

---

### 🛠️ AI Development Tools
- Claude
- GitHub Copilot
