
const ethers = require("ethers");
const fs = require("fs");

// Config parameters
const RPC_URL = "http://localhost:8545";
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const USER_ADDRESS = "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc"; // User from screenshot
const ADMIN_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // Account #0

// ABI
const ABI = require("./web/src/contracts/config.ts").CONTRACT_ABI || [
    "function users(address) view returns (string role, bool isActive, uint256 profileId, uint8 status)",
    "function changeStatusUser(address _user, uint8 _status) external"
];

async function main() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);

    // We need the compiled JSON to be sure about the ABI if the simple one fails, 
    // but for now let's try reading the users struct directly if possible, or use the compiled artifact if available.
    // It's safer to use the compiled artifact since we have it.

    let artifact;
    try {
        artifact = JSON.parse(fs.readFileSync("./sc/out/SupplyChain.sol/SupplyChain.json", "utf8"));
    } catch (e) {
        console.log("Could not read artifact, using minimal ABI");
    }

    const contractABI = artifact ? artifact.abi : ABI;
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, adminWallet);

    console.log(`Checking status for user: ${USER_ADDRESS}`);

    try {
        const user = await contract.users(USER_ADDRESS);
        console.log("User Data:", user);
        console.log(`Role: ${user.role}`);
        console.log(`Status: ${user.status} (0=Pending, 1=Approved, 2=Rejected)`);

        if (user.role === "") {
            console.log("User is NOT registered (Result is empty).");
        } else if (user.status == 0) {
            console.log("User is PENDING. Approving now...");
            const tx = await contract.changeStatusUser(USER_ADDRESS, 1);
            console.log("Transaction sent:", tx.hash);
            await tx.wait();
            console.log("User APPROVED successfully!");
        } else if (user.status == 1) {
            console.log("User is ALREADY APPROVED.");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

main();
