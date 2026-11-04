import React, { useState, useEffect, useRef } from 'react';

const API_BASE_URL = 'https://deckofcardsapi.com/api/deck';

function Deck() {
  const [deckId, setDeckId] = useState(null);
  const [drawnCard, setDrawnCard] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isAutoDrawing, setIsAutoDrawing] = useState(false);

  // useRef to keep track of the setInterval ID
  const timerId = useRef(null);

  // 1. When the page loads, create and shuffle a new deck
  useEffect(() => {
    async function initDeck() {
      const res = await fetch(`${API_BASE_URL}/new/shuffle/`);
      const data = await res.json();
      setDeckId(data.deck_id);
      setRemaining(data.remaining);
    }
    initDeck();
  }, []);

  // Helper function to draw a single card
  const drawCard = async () => {
    if (remaining === 0) {
      alert('Error: no cards remaining!');
      stopAutoDraw();
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/${deckId}/draw/?count=1`);
      const data = await res.json();

      if (data.success && data.cards.length > 0) {
        setDrawnCard(data.cards[0]);
        setRemaining(data.remaining);
      } else {
        alert('Error: no cards remaining!');
        stopAutoDraw();
      }
    } catch (err) {
      console.error('Error drawing card:', err);
    }
  };

  // 2. Shuffle the deck
  const shuffleDeck = async () => {
    if (!deckId) return;

    // Stop auto-draw if active and remove cards from screen
    stopAutoDraw();
    setIsShuffling(true);
    setDrawnCard(null);

    try {
      const res = await fetch(`${API_BASE_URL}/${deckId}/shuffle/`);
      const data = await res.json();
      if (data.success) {
        setRemaining(data.remaining);
        setDrawnCard(null);
      }
    } catch (err) {
      console.error('Error shuffling deck:', err);
    } finally {
      setIsShuffling(false);
    }
  };

  // 3. Auto-draw toggle (Further Study)
  const startAutoDraw = () => {
    setIsAutoDrawing(true);
    timerId.current = setInterval(() => {
      drawCard();
    }, 1000);
  };

  const stopAutoDraw = () => {
    if (timerId.current) {
      clearInterval(timerId.current);
      timerId.current = null;
    }
    setIsAutoDrawing(false);
  };

  const handleAutoDrawToggle = () => {
    if (isAutoDrawing) {
      stopAutoDraw();
    } else {
      startAutoDraw();
    }
  };

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (timerId.current) clearInterval(timerId.current);
    };
  }, []);

  return (
    <div>
      <h1>Card Dealer App</h1>

      <div style={{ margin: '10px 0' }}>
        <button onClick={drawCard} disabled={isShuffling || isAutoDrawing}>
          Draw a Card
        </button>

        <button 
          onClick={shuffleDeck} 
          disabled={isShuffling} 
          style={{ margin: '0 10px' }}
        >
          {isShuffling ? 'Shuffling...' : 'Shuffle Deck'}
        </button>

        <button onClick={handleAutoDrawToggle} disabled={isShuffling}>
          {isAutoDrawing ? 'Stop drawing' : 'Start drawing'}
        </button>
      </div>

      <p>Cards remaining: {remaining !== null ? remaining : 'Loading...'}</p>

      {drawnCard && (
        <div style={{ marginTop: '20px' }}>
          <img
            src={drawnCard.image}
            alt={`${drawnCard.value} of ${drawnCard.suit}`}
          />
        </div>
      )}
    </div>
  );
}

export default Deck;
