# 📑 Gemini AI Document Manager

A **MERN + Gemini AI** full-stack application for managing documents with **AI-powered summarization** and **intelligent tagging**.  
- Frontend → React (Vite + TailwindCSS)  
- Backend → Express + MongoDB Atlas  
- AI → Google Gemini API  

---

## ✨ Features

- 🔑 **Authentication (Firebase Auth)**
- 👥 **Role-Based Access** → Users can only manage their docs; Admins can manage all
- 📝 **CRUD** → Create, Read, Update, Delete documents
- 🤖 **AI Integration** → Auto-generate summaries & tags using Gemini
- 🔍 **Search & Filter** → Semantic search & tag filtering
- 📱 **Responsive UI** with TailwindCSS
- 🚀 **Deployment** → Backend (Render), Frontend (Vercel), Database (MongoDB Atlas)


🚀 Project Setup 
1) Clone repo
git clone https://github.com/your-username/gemini-docs.git
cd gemini-code

2) Frontend (client)
npm create vite@latest client
cd client
npm install

VITE_API_URL=http://localhost:5000

Run:

npm run dev

3) Backend (server)
cd server
npm init -y
npm install express mongoose cors dotenv @google/generative-ai


Add server/.env:

PORT=5000
MONGO_URL=your_mongo_url
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret
