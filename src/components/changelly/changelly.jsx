import React, { useEffect, useState } from "react";

const Changelly = ({ setIsChangellyOpen }) => {
  return (
    <>
      <div className="darkBG" onClick={() => setIsChangellyOpen(false)} />
      <div className="centered">
        <div className="modal changellyWidgetModal">
          <div className="modalHeader">
            <h5 className="heading">Provided By Changelly</h5>
          </div>
          <div className="changellyWidget">
            <iframe
              className="innerWidget"
              width="100%"
              height="100%"
              frameborder="none"
              allow="camera"
              src="https://widget.changelly.com?from=usd&to=*&amount=150&address=&fromDefault=usd&toDefault=btc&merchant_id=plUficpLVYuJLFrk&payment_id=&v=3&type=no-rev-share&color=5f41ff&headerId=1&logo=visible&buyButtonTextId=1"
            >
              Can't load widget
            </iframe>
          </div>
        </div>
      </div>
    </>
  );
};

export default Changelly;
