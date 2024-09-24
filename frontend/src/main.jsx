import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ReactDOM from "react-dom/client"
import App from './App.jsx'
import './index.css'
import { BrowserRouter as Router } from 'react-router-dom'
import {Provider} from "react-redux"
import store from './store/index.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Provider store={store}>
      <App />
      </Provider>
    
    </Router>
    
  </StrictMode>,
)
