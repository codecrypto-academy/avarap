import { ethers } from "ethers";
import { CONTRACT_CONFIG } from "@/contracts/config";

export class Web3Service {
    private provider: ethers.BrowserProvider | null = null;
    private contract: ethers.Contract | null = null;
    private signer: ethers.JsonRpcSigner | null = null;

    constructor() {
        if (typeof window !== "undefined" && window.ethereum) {
            this.provider = new ethers.BrowserProvider(window.ethereum);
        }
    }

    async connect(): Promise<string> {
        if (!this.provider) throw new Error("MetaMask not installed");

        const accounts = await this.provider.send("eth_requestAccounts", []);
        this.signer = await this.provider.getSigner();
        this.contract = new ethers.Contract(
            CONTRACT_CONFIG.address,
            CONTRACT_CONFIG.abi,
            this.signer
        );

        return accounts[0];
    }

    async getContract() {
        if (!this.contract && this.provider) {
            this.signer = await this.provider.getSigner();
            this.contract = new ethers.Contract(
                CONTRACT_CONFIG.address,
                CONTRACT_CONFIG.abi,
                this.signer
            );
        }
        return this.contract;
    }

    async getUserInfo(address: string) {
        const contract = await this.getContract();
        if (!contract) return null;
        try {
            return await contract.getUserInfo(address);
        } catch (e) {
            console.error("Error fetching user info:", e);
            return null;
        }
    }

    // Add more methods as needed
}

export const web3Service = new Web3Service();
