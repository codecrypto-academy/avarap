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
        if (this.provider) {
            this.signer = await this.provider.getSigner();
            // Always create a new contract instance with the current signer
            // This ensures we always use the active MetaMask account
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
                    // Create a new object to include the user's specific balance, as token is array-like
                    tokens.push({
                        ...token, // Spread token properties (id, creator, etc.)
                        id: token.id, // Ensure ID is accessible directly
                        name: token.name,
                        totalSupply: token.totalSupply,
                        userBalance: balance // Add user specific balance
                    });
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

    async changeUserStatus(userAddress: string, status: number) {
        const contract = await this.getContract();
        if (!contract) throw new Error("Contract not initialized");

        try {
            const tx = await contract.changeStatusUser(userAddress, status);
            await tx.wait();
            return true;
        } catch (e) {
            console.error("Error changing user status:", e);
            throw e;
        }
    }

    async getTokenHistory(tokenId: number) {
        const contract = await this.getContract();
        if (!contract) return null;

        try {
            // 1. Get Token Details
            const token = await contract.getToken(tokenId);
            // Verify if token exists (e.g. ID > 0 and ID < nextTokenId)
            // But if it returns data, it likely exists or is empty. 
            // Solidity mapping for non-existent key returns default values.
            if (Number(token.id) === 0) return null;

            // 2. Get All Transfers for this Token
            const nextTransferId = await contract.nextTransferId();
            const history = [];

            for (let i = 1; i < Number(nextTransferId); i++) {
                const transfer = await contract.getTransfer(i);
                if (Number(transfer.tokenId) === tokenId) {
                    history.push(transfer);
                }
            }

            // Sort history by ID (chronological)
            history.sort((a, b) => Number(a.id) - Number(b.id));

            return {
                token,
                history
            };

        } catch (e) {
            console.error("Error fetching token history:", e);
            return null;
        }
    }

    async transferToken(to: string, tokenId: number, amount: number) {
        const contract = await this.getContract();
        if (!contract) throw new Error("Contract not initialized");

        try {
            const tx = await contract.transfer(to, tokenId, amount);
            await tx.wait();
            return true;
        } catch (e) {
            console.error("Error transferring token:", e);
            throw e;
        }
    }

    async acceptTransfer(transferId: number) {
        const contract = await this.getContract();
        if (!contract) throw new Error("Contract not initialized");

        try {
            const tx = await contract.acceptTransfer(transferId);
            await tx.wait();
            return true;
        } catch (e) {
            console.error("Error accepting transfer:", e);
            throw e;
        }
    }

    async rejectTransfer(transferId: number) {
        const contract = await this.getContract();
        if (!contract) throw new Error("Contract not initialized");

        try {
            const tx = await contract.rejectTransfer(transferId);
            await tx.wait();
            return true;
        } catch (e) {
            console.error("Error rejecting transfer:", e);
            throw e;
        }
    }

    async getAllTransfers() {
        const contract = await this.getContract();
        if (!contract) return [];
        try {
            const nextId = await contract.nextTransferId();
            const transfers = [];
            for (let i = 1; i < Number(nextId); i++) {
                const transfer = await contract.getTransfer(i);
                transfers.push(transfer);
            }
            return transfers.reverse(); // Newest first
        } catch (e) {
            console.error("Error fetching all transfers:", e);
            return [];
        }
    }

}


export const web3Service = new Web3Service();
