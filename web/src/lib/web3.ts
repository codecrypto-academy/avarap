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
        } catch (e: any) {
            // Ignore "User not found" revert as it's expected for Admin or unregistered users
            if (e.message && (e.message.includes("User not found") || e.info?.error?.message?.includes("User not found"))) {
                return null;
            }
            console.error("Error fetching user info:", e);
            return null;
        }
    }

    async getAllUsers() {
        const contract = await this.getContract();
        if (!contract) return [];
        try {
            const nextId = await contract.nextUserId();
            const users = [];
            // Loop start from 1 to nextId - 1
            for (let i = 1; i < Number(nextId); i++) {
                const user = await contract.users(i);
                users.push(user);
            }
            return users;
        } catch (e) {
            console.error("Error fetching all users:", e);
            return [];
        }
    }

    async getUserTokens(address: string) {
        const contract = await this.getContract();
        if (!contract) return [];
        try {
            const nextId = await contract.nextTokenId();
            const tokens = [];
            for (let i = 1; i < Number(nextId); i++) {
                // Get token details to check balance/ownership
                // balance mapping is nested, so we use getTokenBalance
                const balance = await contract.getTokenBalance(i, address);
                if (Number(balance) > 0) {
                    const token = await contract.getToken(i);
                    tokens.push(token);
                }
            }
            return tokens;
        } catch (e) {
            console.error("Error fetching user tokens:", e);
            return [];
        }
    }

    async getUserTransfers(address: string) {
        const contract = await this.getContract();
        if (!contract) return [];
        try {
            const nextId = await contract.nextTransferId();
            const transfers = [];
            for (let i = 1; i < Number(nextId); i++) {
                const transfer = await contract.getTransfer(i);
                // Check if user is sender or receiver
                if (transfer[1].toLowerCase() === address.toLowerCase() ||
                    transfer[2].toLowerCase() === address.toLowerCase()) {
                    transfers.push(transfer);
                }
            }
            return transfers;
        } catch (e) {
            console.error("Error fetching user transfers:", e);
            return [];
        }
    }

    async getUserDashboardStats(address: string) {
        const contract = await this.getContract();
        if (!contract) return { totalTokens: 0, pendingTransfers: 0, role: "Unknown" };

        try {
            // 1. Get Role
            const userInfo = await this.getUserInfo(address);
            const role = userInfo ? userInfo[2] : "Not Registered";

            // 2. Get Total Tokens (Balance > 0)
            const cryptoTokens = await this.getUserTokens(address);
            const totalTokens = cryptoTokens.length;

            // 3. Get Pending Transfers (To user, Status = Pending)
            const allTransfers = await this.getUserTransfers(address);
            const pendingTransfers = allTransfers.filter((t: any) =>
                t[2].toLowerCase() === address.toLowerCase() && Number(t[6]) === 0
            ).length;

            return {
                totalTokens,
                pendingTransfers,
                role
            };

        } catch (e) {
            console.error("Error fetching dashboard stats:", e);
            return { totalTokens: 0, pendingTransfers: 0, role: "Error" };
        }
    }

    // Add more methods as needed
}

export const web3Service = new Web3Service();
