import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="container">
       <div className="button-container">
         <button className="draw">GIMME A CARD</button>
      </div>

      <section className="card-display">
        
      </section>
     
    </div>
  )
}

export default App
