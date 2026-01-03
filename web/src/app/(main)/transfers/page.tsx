"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Need to create Tabs
import { Send, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { web3Service } from "@/lib/web3";

export default function TransfersPage() {
    const [transfers, setTransfers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { account } = useWallet();

    useEffect(() => {
        const fetchTransfers = async () => {
            if (account) {
                setLoading(true);
                const userTransfers = await web3Service.getUserTransfers(account);
                setTransfers(userTransfers);
                setLoading(false);
            }
        };
        fetchTransfers();
    }, [account]);

    const getStatusLabel = (status: number) => {
        const labels = ["Pending", "Accepted", "Rejected"];
        return labels[status] || "Unknown";
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Transfers</h1>

            <div className="flex flex-col space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Transfers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <p className="text-center py-8">Loading transfers...</p>
                        ) : transfers.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">No transfers found.</p>
                        ) : (
                            <div className="space-y-4">
                                {transfers.map((t: any) => (
                                    <div key={t.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-4">
                                            {t.to.toLowerCase() === account?.toLowerCase() ? (
                                                <ArrowDownLeft className="h-8 w-8 text-green-500" />
                                            ) : (
                                                <ArrowUpRight className="h-8 w-8 text-blue-500" />
                                            )}
                                            <div>
                                                <p className="font-medium">Token ID: {t.tokenId.toString()}</p>
                                                <p className="text-sm text-muted-foreground">Amount: {t.amount.toString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${Number(t.status) === 1 ? 'bg-green-100 text-green-700' :
                                                Number(t.status) === 2 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {getStatusLabel(Number(t.status))}
                                            </span>
                                            <p className="text-xs text-muted-foreground mt-1 text-mono">
                                                {t.to.toLowerCase() === account?.toLowerCase() ? `From: ${t.from.slice(0, 6)}...` : `To: ${t.to.slice(0, 6)}...`}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
