
"use client";

import { useWallet } from "@/hooks/useWallet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Send, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { web3Service } from "@/lib/web3";

import { RegisterUser } from "@/components/RegisterUser";

export default function DashboardPage() {
    const { account } = useWallet();
    const [stats, setStats] = useState({ totalTokens: 0, pendingTransfers: 0, role: "Loading..." });

    const fetchStats = async () => {
        if (account) {
            const data = await web3Service.getUserDashboardStats(account);
            setStats(data);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [account]);

    if (stats.role === "Loading...") {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (stats.role === "Not Registered" || stats.role === "Unknown" || stats.role === "Error") {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <RegisterUser onRegistered={fetchStats} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalTokens}</div>
                        <p className="text-xs text-muted-foreground">
                            Owned tokens
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Transfers</CardTitle>
                        <Send className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingTransfers}</div>
                        <p className="text-xs text-muted-foreground">
                            Incoming transfers
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Role</CardTitle>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-muted-foreground"
                        >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.role}</div>
                        <p className="text-xs text-muted-foreground">
                            {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Not connected"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            No recent activity.
                        </p>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {stats.role === "Producer" && (
                            <Button className="w-full justify-start" asChild>
                                <Link href="/tokens/create">
                                    <Plus className="mr-2 h-4 w-4" /> Create Token
                                </Link>
                            </Button>
                        )}
                        <Button className="w-full justify-start" variant="outline" asChild>
                            <Link href="/transfers">
                                <Send className="mr-2 h-4 w-4" /> View Transfers
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
