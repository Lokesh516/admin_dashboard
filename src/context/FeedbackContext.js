import React, { createContext, useContext, useState } from 'react';

const FeedbackContext = createContext();

export function FeedbackProvider({ children }) {
  const [message, setMessage] = useState(null);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <FeedbackContext.Provider value={{ message, showMessage }}>
      {children}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  return useContext(FeedbackContext);
}