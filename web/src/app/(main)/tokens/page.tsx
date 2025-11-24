"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function TokensPage() {
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
                {/* Placeholder for token list */}
                <Card className="col-span-full">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-muted-foreground mb-4">You don't have any tokens yet.</p>
                        <Button variant="outline" asChild>
                            <Link href="/tokens/create">Create your first token</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
