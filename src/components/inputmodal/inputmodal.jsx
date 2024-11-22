import React from "react";
import "./inputmodal.css";
import {RiCloseLine} from "react-icons/ri";
import {useConnection, useWallet} from "@solana/wallet-adapter-react";

const InputModal = ({setIsOpen}) => {
    const {connection} = useConnection();
    const {publicKey} = useWallet();
    return (
        <>
            <div className="darkBG" onClick={() => setIsOpen(false)}/>
            <div className="centered">
                <div className="modal">
                    <div className="modalHeader">
                        <h5 className="heading">Bridge</h5>
                    </div>
                    <button className="closeBtn" onClick={() => setIsOpen(false)}>
                        <RiCloseLine style={{marginBottom: "0px"}}/>
                    </button>
                    <div className="modalContent">
                        {(connection && publicKey) ?
                            <label>
                                Amount:
                                <input name="amount" style={{border: "1px solid", marginLeft: "3px"}}/>
                            </label> :
                            <div>
                                You should connect wallet first
                            </div>
                        }

                    </div>
                    <div className="modalActions">
                        <div className="actionsContainer">
                            <button className="deleteBtn" onClick={() => setIsOpen(false)}
                                    disabled={!(connection && publicKey)}>
                                Bridge
                            </button>
                            <button
                                className="cancelBtn"
                                onClick={() => setIsOpen(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default InputModal;