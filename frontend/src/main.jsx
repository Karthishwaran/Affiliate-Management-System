import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from "./context/AuthContext"
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'react-toastify/dist/ReactToastify.css'
import './assets/styles/custom.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  
    <BrowserRouter>        {/* Router FIRST */}
      <AuthProvider>       {/* THEN AuthProvider */}
        <App />
      </AuthProvider>
    </BrowserRouter>

)