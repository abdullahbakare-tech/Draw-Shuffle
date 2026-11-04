import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";
import { renderToPipeableStream, renderToStaticMarkup } from "react-dom/server";
//Date - November 4th 2026. 
//Unfortunately, I used google AI for assistance on this code. 
const API_BASE = "https://deckofcardsapi.com/api/deck"; //Source for all the cards

function App() {
  const [deckId, setDeckId] = useState(null); // Each card has a unique identifier to allow for the API to know which deck belongs to me. 
  const [drawncard, setDrawnCard] = useState(null); // Stores the most recently drawn card. 
  const [remaining, setRemaining] = useState(null); // Stores the remaning card in the shuffle. [52] at the start.
  const [shuffled, setShuffled] = useState(false); // Stores if the cards stack/deck is being shuffled or not.
  const [redraw, setRedraw] = useState(false); // Stores if automatic redraw is engaged

  const timerId = useRef(null); // Stores the value that is not reset during re-renders.

  // Run the useEffect() after the component appears on the screen 
  useEffect(() => {
    async function deck() { //create my deck/stack
      const res = await fetch(`${API_BASE}/new/shuffle/`); //grab a new shuffle from the API
      const data = await res.json(); //convert response to JSON
      setDeckId(data.deck_id); // stores the unique deck ID here is extractred from the object
      setRemaining(data.remaining); //  stores the amount of card in the shuffle is shown.
    }
    deck(); //actually run the shuffle by calling the function
  }, []); //the empty dependency array mean that the useEffect() shall only run once and note at every render. 

  const drawCard = async () => { //function to draw only one card.
    if (remaining === 0) { //if there is no card remaning, then 
      alert("Error: No Cards reminaing!");
      stopReDraw(); //no dealing anymore. Likely to be used when using the autoDraw feature. 
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/${deckId}/draw/?count=1`); //call the API for one card from the deck
      const data = await res.json(); // convert the repsonse to JSON
      if (data.success && data.cards.length > 0) {// if the success is true [actual response] && the array has more than 1 card,
        setDrawnCard(data.cards[0]); // Then return the card in the array [Cards]
        setRemaining(data.remaining); // store the remaining card details
      } else {
        alert("Error:No cards remianing");
        stopReDraw(); //stop automatic redraw since there would be nothing to draw.
      }
    } catch (err) {
      console.error("Error drawing card: ", err);
    }
  };

  const shuffleDeck = async () => { //allows the user to reshuffle. 
    if (!deckId) return; //stop the function if we do not have any decks

    stopReDraw(); //whilst shuffling the deck, stop automatic draw
    setShuffled(true); //store shuffled/shuffling as true
    setDrawnCard(null); //We have not drawn any cards. 

    try {
      const res = await fetch(`${API_BASE}/${deckId}/shuffle/`);
      const data = await res.json();

      if (data.success) { //if we are able to draw a deck, 
        setRemaining(data.remaining);//Update the remmaining cards count to show how much is left in the stack
        setDrawnCard(null); //show that we have not yet drawn a card. 
      }
    } catch (err) {
      console.error("Error shuffling deck:", err);
    } finally {
      setShuffled(false);
    }
  };

  const startAutoDraw = () => {
    setRedraw(true); //show that autodraw is engaged. 
    timerId.current = setInterval(() => { // It is important to store the interval so that we know when/where to stop.
      drawCard();
    }, 1000); //draw one card every second forever
  };

  const stopReDraw = () => {
    if (timerId.current) { //if there is a stored running timer, then we can clear the interval 
      clearInterval(timerId.current);
      timerId.current = null;
    }
    setRedraw(false);
  };

  const handleAutoDrawToggle = () => {// For start and stop button
    if (redraw) {
      stopReDraw();
    } else {
      startAutoDraw();
    }
  };

  useEffect(() => {
    return () => {
      if (timerId.current) clearInterval(timerId.current);
    };
  }, []);

  return (
    <div className="container">
      <div className="button-container">
        <button
          className="draw"
          onClick={drawCard}
          disabled={shuffled || redraw}// the button should be disabled when it is shuffling or automatically redrawing
        >
          GIMME A CARD
        </button>

        <button
          className="draw"
          onClick={shuffleDeck}
          disabled={shuffled}
          style={{ margin: "0 10px" }}
        >
          {shuffled ? "Shuffling..." : "Shuffle Deck"}
        </button>

        <button
          className="draw"
          onClick={handleAutoDrawToggle}
          disabled={shuffled}
        >
          {redraw ? "Stop drawing" : "Start drawing"}
        </button>
      </div>

      <section className="card-display">
    

        {drawncard && (
          <div style={{ marginTop: "20px" }}>
            <img
              src={drawncard.image}
              alt={`${drawncard.value} of ${drawncard.suit}`}
            />
          </div>
        )}
      <p>Cards remaining: {remaining !== null ? remaining : "Loading..."}</p>
      </section>
    </div>
  );
}

export default App;
