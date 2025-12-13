import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import WsComponent from './components/WsComponent.jsx'

import './index.css';

createRoot(document.getElementById('root')).render(
    <WsComponent />
)
