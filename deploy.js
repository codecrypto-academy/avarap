
const { ethers } = require("./web/node_modules/ethers");

const rpcUrl = "http://localhost:8545";
const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const artifact = require("./sc/out/SupplyChain.sol/SupplyChain.json");

async function deploy() {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log("Deploying from:", wallet.address);
    const balance = await provider.getBalance(wallet.address);
    console.log("Balance:", balance.toString());

    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode.object, wallet);
    const contract = await factory.deploy();

    console.log("Tx Hash:", contract.deploymentTransaction().hash);

    await contract.deploymentTransaction().wait();

    const address = await contract.getAddress();
    console.log("Deployed to:", address);
}

deploy().catch(console.error);
