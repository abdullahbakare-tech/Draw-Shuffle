import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";
import { renderToPipeableStream, renderToStaticMarkup } from "react-dom/server";

const API_BASE = "https://deckofcardsapi.com/api/deck";

function App() {
  const [deckId, setDeckId] = useState(null);
  const [drawncard, setDrawnCard] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [shuffled, setShuffled] = useState(false);
  const [redraw, setRedraw] = useState(false);

  const timerId = useRef(null);

  useEffect(() => {
    async function deck() {
      const res = await fetch(`${API_BASE}/new/shuffle/`);
      const data = await res.json();
      setDeckId(data.deck_id);
      setRemaining(data.remaining);
    }
    deck();
  }, []);

  const drawCard = async () => {
    if (remaining === 0) {
      alert("Error: No Cards reminaing!");
      stopReDraw();
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/${deckId}/draw/?count=1`);
      const data = await res.json();
      if (data.success && data.cards.length > 0) {
        setDrawnCard(data.cards[0]);
        setRemaining(data.remaining);
      } else {
        alert("Error:No cards remianing");
        stopReDraw();
      }
    } catch (err) {
      console.error("Error drawing card: ", err);
    }
  };

  const shuffleDeck = async () => {
    if (!deckId) return;

    stopReDraw();
    setShuffled(true);
    setDrawnCard(null);

    try {
      const res = await fetch(`${API_BASE}/${deckId}/shuffle/`);
      const data = await res.json();

      if (data.success) {
        setRemaining(data.remaining);
        setDrawnCard(null);
      }
    } catch (err) {
      console.error("Error shuffling deck:", err);
    } finally {
      setShuffled(false);
    }
  };

  const startAutoDraw = () => {
    setRedraw(true);
    timerId.current = setInterval(() => {
      drawCard();
    }, 1000);
  };

  const stopReDraw = () => {
    if (timerId.current) {
      clearInterval(timerId.current);
      timerId.current = null;
    }
    setRedraw(false);
  };

  const handleAutoDrawToggle = () => {
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
          disabled={shuffled || redraw}
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
