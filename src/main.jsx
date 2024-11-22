import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import Web3PhantomProvider from './provider'

createRoot(document.getElementById('root')).render(
    <Web3PhantomProvider>
        <StrictMode>
            <App/>
        </StrictMode>,
    </Web3PhantomProvider>
)
