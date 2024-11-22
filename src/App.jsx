import gsap from "gsap";
import React, {useEffect, useRef, useState} from "react";

import {
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import InputModal from "./components/inputmodal/inputmodal"

const App = () => {
    const [hasCopied, setHasCopied] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const cat = useRef();

    const handleCopy = () => {
        navigator.clipboard.writeText(
            "gjghk4jujtroxznzwfpfhhugditvxxwmio1a5qxnzjpf"
        );
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 3000);
    };

    useEffect(() => {
        const slideItems = document.querySelectorAll(".slide-item");

        gsap.fromTo(
            cat.current,
            {scale: 0, opacity: 0},
            {scale: 1, opacity: 1, ease: "power2.out", duration: 0.75, delay: 1}
        );

        gsap.fromTo(
            slideItems,
            {opacity: 0, yPercent: 80},
            {
                opacity: 1,
                yPercent: 0,
                stagger: 0.25,
                ease: "power2.out",
            }
        );
    }, []);


    return (
        <div className="flex flex-col md:flex-row gap-8 md:justify-between items-center min-h-screen pt-10 md:pt-0">
            <div
                className="w-full pr-10 md:pr-0 pl-10 lg:pl-16 xl:pl-24 2xl:pl-32 flex flex-col gap-9 text-center md:text-start items-center md:items-stretch">
                <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl lg;text-5xl xl:text-6xl 2xl:text-7xl font-semibold leading-[1] slide-item">
                        KITTY on Solana
                    </h1>
                    <p className="text-lg sm:text-xl xl:text-2xl slide-item">
                        Official Meme coin of Vidulum App
                    </p>
                    <WalletMultiButton/>
                    <div>
                        <button className="primaryBtn" onClick={() => setIsOpen(true)}>
                            Bridge
                        </button>
                        {isOpen && <InputModal setIsOpen={setIsOpen}/>}
                    </div>
                </div>

                <div className="xl:text-lg flex flex-col gap-2 -z-10">
                    <div className="break-all slide-item">
                        <p className="inline">
                            <span className="text-[#b3b3b3]">Contract Address: </span>
                            gjghk4jujtroxznzwfpfhhugditvxxwmio1a5qxnzjpf
                        </p>

                        {hasCopied ? (
                            <img src="/check.svg" alt="check" className="inline ml-1.5 w-5"/>
                        ) : (
                            <button
                                onClick={handleCopy}
                                className="inline ml-1.5 translate-y-1"
                            >
                                <img src="/clipboard.svg" alt="copy" className="w-5"/>
                            </button>
                        )}
                    </div>

                    <p className="slide-item mb-2">
                        <span className="text-[#b3b3b3]">Max Supply: </span>1 Billion
                    </p>

                    <p className="slide-item">
                        KITTY is deflationary asset so supply will only go down
                    </p>

                    <p className="slide-item">
                        Fair launch, doxxed dev, KITTY is the KOL, presales, just fair launch
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <p className="xl:text-lg slide-item">Available on:</p>

                    <div className="flex gap-3 slide-item">
                        <a
                            href="https://dexscreener.com/solana/gjghk4jujtroxznzwfpfhhugditvxxwmio1a5qxnzjpf"
                            target="_blank"
                            className="size-14 p-1.5 bg-[#111116] rounded-xl overflow-hidden"
                        >
                            <img
                                src="/dexscreener.png"
                                alt="dex screener"
                                className="size-full"
                            />
                        </a>

                        <a
                            href="https://photon-sol.tinyastro.io/en/lp/8hah9PBQcpLueTHYWuyUt1s48MivGPfxrNRgh5zMspE7?handle=822099e7b8f306d36517d"
                            target="_blank"
                            className="size-14 rounded-xl overflow-hidden"
                        >
                            <img src="/photon.jpeg" alt="photon sol" className="size-full"/>
                        </a>
                    </div>
                </div>
            </div>

            <img
                ref={cat}
                src="/cat.jpeg"
                alt="cat"
                className="md:h-[80vh] lg:h-[100vh] md:max-w-[50%] object-contain self-end md:self-auto origin-right -z-10"
            />
        </div>
    );
};

export default App;
