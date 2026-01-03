"use client";

import { useWallet } from "@/hooks/useWallet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Shield, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { web3Service } from "@/lib/web3";

export default function ProfilePage() {
    const { account, chainId } = useWallet();
    const [userInfo, setUserInfo] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            if (account) {
                setLoading(true);

                // Admin check override
                const contract = await web3Service.getContract();
                const adminAddress = await contract?.admin();

                if (adminAddress && account.toLowerCase() === adminAddress.toLowerCase()) {
                    setUserInfo({
                        2: "Admin", // Role
                        3: 1        // Approved status (simulated)
                    });
                } else {
                    const info = await web3Service.getUserInfo(account);
                    setUserInfo(info);
                }
                setLoading(false);
            }
        };
        fetchUser();
    }, [account]);

    const getStatusBadge = (status: number) => {
        const styles = {
            0: "bg-yellow-100 text-yellow-800", // Pending
            1: "bg-green-100 text-green-800",   // Approved
            2: "bg-red-100 text-red-800",       // Rejected
            3: "bg-gray-100 text-gray-800"      // Canceled
        };
        const labels = ["Pending", "Approved", "Rejected", "Canceled"];
        return (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status as keyof typeof styles] || "bg-gray-100"}`}>
                {labels[status] || "Unknown"}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Wallet Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Address</p>
                            <p className="text-sm font-mono break-all">{account || "Not connected"}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Chain ID</p>
                            <p className="text-sm font-mono">{chainId || "Unknown"}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            User Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {account ? (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Role</p>
                                    <p className="text-lg font-bold">
                                        {loading ? "Loading..." : (userInfo && userInfo[2] ? userInfo[2] : "Not Registered")}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                                    <div className="mt-1">
                                        {loading ? "..." : (userInfo ? getStatusBadge(Number(userInfo[3])) : "-")}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted-foreground">Connect wallet to view status</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
