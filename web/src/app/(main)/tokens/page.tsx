"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { web3Service } from "@/lib/web3";

export default function TokensPage() {
    const [tokens, setTokens] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { account } = useWallet();

    useEffect(() => {
        const fetchTokens = async () => {
            if (account) {
                setLoading(true);
                const userTokens = await web3Service.getUserTokens(account);
                setTokens(userTokens);
                setLoading(false);
            }
        };
        fetchTokens();
    }, [account]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">My Tokens</h1>
                <Button asChild>
                    <Link href="/tokens/create">
                        <Plus className="mr-2 h-4 w-4" /> Create Token
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <Card className="col-span-full">
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">Loading tokens...</p>
                        </CardContent>
                    </Card>
                ) : tokens.length === 0 ? (
                    <Card className="col-span-full">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <p className="text-muted-foreground mb-4">You don't have any tokens yet.</p>
                            <Button variant="outline" asChild>
                                <Link href="/tokens/create">Create your first token</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    tokens.map((token: any) => (
                        <Card key={token.id}>
                            <CardHeader>
                                <CardTitle>{token.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm font-medium">Supply: {token.totalSupply.toString()}</div>
                                <div className="text-xs text-muted-foreground mt-2 font-mono">ID: {token.id.toString()}</div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
