
const { ethers } = require("./web/node_modules/ethers");

const rpcUrl = "http://localhost:8545";

// Contract Address (from previous steps)
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const artifact = require("./sc/out/SupplyChain.sol/SupplyChain.json");

// Accounts
// Admin: 0xf39...(Account #0)
const adminPrivateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

// User: 0x7099... (Account #1 - The one usually connected in MetaMask for Anvil demos)
const userPrivateKey = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

async function setupUser() {
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // Wallets
    const adminWallet = new ethers.Wallet(adminPrivateKey, provider);
    const userWallet = new ethers.Wallet(userPrivateKey, provider);

    // Contract instances
    const adminContract = new ethers.Contract(contractAddress, artifact.abi, adminWallet);
    const userContract = new ethers.Contract(contractAddress, artifact.abi, userWallet);

    console.log("Setting up user:", userWallet.address);

    try {
        // 1. Check if already registered
        const userInfo = await adminContract.getUserInfo(userWallet.address).catch(() => null);

        if (userInfo && userInfo.id > 0) {
            console.log("User already registered. Status:", userInfo.status);
            if (userInfo.status === 1n) { // 1 = Approved
                console.log("User is already APPROVED.");
                return;
            }
        } else {
            // 2. Request Role
            console.log("Requesting 'Producer' role...");
            const tx1 = await userContract.requestUserRole("Producer");
            await tx1.wait();
            console.log("Role requested.");
        }

        // 3. Admin Approves
        console.log("Admin approving user...");
        // Status 1 = Approved (enum: Pending, Approved, Rejected, Canceled)
        const tx2 = await adminContract.changeStatusUser(userWallet.address, 1);
        await tx2.wait();
        console.log("User APPROVED successfully!");

    } catch (error) {
        console.error("Error setting up user:", error);
    }
}

setupUser();
