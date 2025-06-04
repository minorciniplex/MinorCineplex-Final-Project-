import React, { createContext, useContext, useState } from 'react';

const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
  const [cardFormRef, setCardFormRef] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [userId, setUserId] = useState(null);
  
  return (
    <PaymentContext.Provider value={{ 
      cardFormRef, 
      setCardFormRef, 
      bookingData, 
      setBookingData,
      userId, 
      setUserId 
    }}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
}; 