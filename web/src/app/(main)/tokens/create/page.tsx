"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { web3Service } from "@/lib/web3";

export default function CreateTokenPage() {
    const router = useRouter();
    const { isConnected, account } = useWallet();

    // Form state
    const [name, setName] = useState("");
    const [totalSupply, setTotalSupply] = useState("");
    const [features, setFeatures] = useState("");
    const [parentId, setParentId] = useState("0");

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        // Validation
        if (!name.trim()) {
            setError("Please enter a token name");
            return;
        }

        if (!totalSupply || parseInt(totalSupply) <= 0) {
            setError("Please enter a valid total supply");
            return;
        }

        if (!isConnected) {
            setError("Please connect your wallet first");
            return;
        }

        try {
            setLoading(true);

            // Get contract instance
            const contract = await web3Service.getContract();

            if (!contract) {
                throw new Error("Contract not available. Please check configuration.");
            }

            // Prepare features JSON
            const featuresJson = features.trim() || "{}";

            // Call smart contract
            console.log("Creating token:", { name, totalSupply, features: featuresJson, parentId });

            const tx = await contract.createToken(
                name,
                parseInt(totalSupply),
                featuresJson,
                parseInt(parentId)
            );

            console.log("Transaction sent:", tx.hash);
            setSuccess(true);

            // Wait for confirmation
            await tx.wait();

            console.log("Token created successfully!");

            // Redirect to tokens page after 2 seconds
            setTimeout(() => {
                router.push("/tokens");
            }, 2000);

        } catch (err: any) {
            console.error("Error creating token:", err);

            // Handle different error types
            if (err.code === "ACTION_REJECTED") {
                setError("Transaction rejected by user");
            } else if (err.message?.includes("User not approved")) {
                setError("Your account is not approved. Please contact the administrator.");
            } else if (err.message?.includes("User not registered")) {
                setError("Please register your account first");
            } else {
                setError(err.message || "Failed to create token. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/tokens">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Create Token</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Token Details</CardTitle>
                    <CardDescription>
                        Create a new token to represent a product or raw material in the supply chain.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Name *
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="e.g., Organic Cotton, T-Shirt, etc."
                                disabled={loading}
                                required
                            />
                        </div>

                        {/* Total Supply Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Total Supply *
                            </label>
                            <input
                                type="number"
                                value={totalSupply}
                                onChange={(e) => setTotalSupply(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="e.g., 1000"
                                min="1"
                                disabled={loading}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Total number of units to create
                            </p>
                        </div>

                        {/* Features Field (Optional) */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Features (JSON)
                            </label>
                            <textarea
                                value={features}
                                onChange={(e) => setFeatures(e.target.value)}
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder='{"origin":"Argentina","quality":"Premium"}'
                                disabled={loading}
                            />
                            <p className="text-xs text-muted-foreground">
                                Optional metadata in JSON format
                            </p>
                        </div>

                        {/* Parent ID Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Parent Token ID
                            </label>
                            <input
                                type="number"
                                value={parentId}
                                onChange={(e) => setParentId(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="0"
                                min="0"
                                disabled={loading}
                            />
                            <p className="text-xs text-muted-foreground">
                                0 for raw materials, or ID of parent token for derived products
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                                <p className="text-sm text-destructive">{error}</p>
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20">
                                <p className="text-sm text-green-600 dark:text-green-400">
                                    ✓ Token created successfully! Redirecting...
                                </p>
                            </div>
                        )}

                        {/* Connection Warning */}
                        {!isConnected && (
                            <div className="p-3 rounded-md bg-yellow-500/10 border border-yellow-500/20">
                                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                    ⚠ Please connect your wallet to create tokens
                                </p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading || !isConnected}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating Token...
                                </>
                            ) : (
                                "Create Token"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
