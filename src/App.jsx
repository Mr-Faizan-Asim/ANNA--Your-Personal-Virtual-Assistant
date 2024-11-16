import { useState } from 'react'
import './App.css'
import BotComponent from './Components/BotComponent/BotComponent'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <BotComponent/>
    </div>  
  )
}

export default App
