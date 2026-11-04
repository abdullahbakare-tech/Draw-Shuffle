import axios from 'axios'
import { useState, useEffect } from "react";

export default function DrawShuffle(){
     const [count, setCount] = useState(0);
  const [card, setCard] = useState([]);

  let deck_count;

  const increment = () => {
    setCount((prev) => prev + 1);
  };

  useEffect(() => {
    //api to call
    deck_count = increment;
    //   fetch(
    //     `https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=${deck_count}`,
    //   )
    //     .then((res) => res.json())
    //     .then((data) => setCard(data))
    //     .catch((err) => console.log(err));
   axios.get(`https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=${deck_count}`)
   .then(res =>{setCard(res.card.image)})
   .catch((err)=> console.log(err))}, []); //empty dependency array = component will only run one time every time it mounts
}