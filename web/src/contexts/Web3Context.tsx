"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { web3Service } from "@/lib/web3";

interface Web3ContextType {
    account: string | null;
    connect: () => Promise<void>;
    disconnect: () => void;
    isConnected: boolean;
    chainId: number | null;
}

const Web3Context = createContext<Web3ContextType>({
    account: null,
    connect: async () => { },
    disconnect: () => { },
    isConnected: false,
    chainId: null,
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
    const [account, setAccount] = useState<string | null>(null);
    const [chainId, setChainId] = useState<number | null>(null);

    useEffect(() => {
        // Check localStorage
        const savedAccount = localStorage.getItem("account");
        if (savedAccount) {
            setAccount(savedAccount);
        }

        if (typeof window !== "undefined" && window.ethereum) {
            // Initial Chain ID fetch
            window.ethereum.request({ method: "eth_chainId" })
                .then((chainId: string) => setChainId(parseInt(chainId, 16)))
                .catch((err: any) => console.error("Error fetching chainId:", err));

            window.ethereum.on("accountsChanged", (accounts: string[]) => {
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                    localStorage.setItem("account", accounts[0]);
                } else {
                    disconnect();
                }
            });

            window.ethereum.on("chainChanged", (chainId: string) => {
                setChainId(parseInt(chainId, 16));
            });
        }
    }, []);

    const connect = async () => {
        try {
            const account = await web3Service.connect();
            setAccount(account);
            localStorage.setItem("account", account);

            if (window.ethereum) {
                const chainId = await window.ethereum.request({ method: "eth_chainId" });
                setChainId(parseInt(chainId, 16));
            }
        } catch (error) {
            console.error("Failed to connect:", error);
        }
    };

    const disconnect = () => {
        setAccount(null);
        localStorage.removeItem("account");
    };

    return (
        <Web3Context.Provider value={{ account, connect, disconnect, isConnected: !!account, chainId }}>
            {children}
        </Web3Context.Provider>
    );
}

export const useWeb3 = () => useContext(Web3Context);
