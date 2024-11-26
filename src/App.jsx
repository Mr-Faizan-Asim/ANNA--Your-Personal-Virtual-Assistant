import { useState } from 'react'
import './App.css'
import BotComponent from './Components/BotComponent/BotComponent'
import GmailBot from './Components/AutoEmail/GmailBot'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <GmailBot/>
    </div>  
  )
}

export default App
