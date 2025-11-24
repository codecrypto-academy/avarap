import { useWeb3 } from "@/contexts/Web3Context";

export function useWallet() {
    const context = useWeb3();
    if (!context) {
        throw new Error("useWallet must be used within a Web3Provider");
    }
    return context;
}
