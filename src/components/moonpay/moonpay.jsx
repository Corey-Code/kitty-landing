import { MoonPayBuyWidget } from "@moonpay/moonpay-react";

import React, { useState } from "react";
import "./moonpay.css";

const Moonpay = () => {
  const [isMoonpayOpen, setIsMoonpayOpen] = useState(false);

  return (
    <>
      <MoonPayBuyWidget
        variant="overlay"
        baseCurrencyCode="usd"
        baseCurrencyAmount="100"
        defaultCurrencyCode="sol"
        onLogin={() => console.log("Customer logged in!")}
        visible={isMoonpayOpen}
      />
      <div>
        <button
          className="primaryBtn"
          onClick={() => {
            setIsMoonpayOpen(!isMoonpayOpen);
          }}
        >
          Moonpay
        </button>
      </div>
    </>
  );
};

export default Moonpay;
