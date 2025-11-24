"use client";

import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Wallet } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { web3Service } from "@/lib/web3";

export default function Home() {
  const { isConnected, connect, account } = useWallet();
  const [userStatus, setUserStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkUser() {
      if (isConnected && account) {
        setLoading(true);
        // Mock check for now since contract might not be deployed
        // const info = await web3Service.getUserInfo(account);
        // setUserStatus(info ? info.status : "Unregistered");

        // For demo purposes, let's assume unregistered if no info
        setUserStatus("Unregistered");
        setLoading(false);
      }
    }
    checkUser();
  }, [isConnected, account]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Supply Chain Tracker
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          {isConnected ? (
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-xs text-muted-foreground">{account?.slice(0, 6)}...{account?.slice(-4)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500"></div>
              <span className="text-xs text-muted-foreground">Not Connected</span>
            </div>
          )}
        </div>
      </div>

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-to-br before:from-transparent before:to-blue-700 before:opacity-10 before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-to-t after:from-sky-900 after:via-[#0141ff] after:opacity-40 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
          Track Your Supply Chain
        </h1>
      </div>

      <div className="mt-12 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-1 lg:text-left">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Connect your wallet to access the decentralized supply chain network.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {!isConnected ? (
              <Button size="lg" className="w-full" onClick={connect}>
                <Wallet className="mr-2 h-4 w-4" />
                Connect MetaMask
              </Button>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-sm font-medium">Status: {loading ? "Checking..." : userStatus}</p>
                </div>

                {userStatus === "Unregistered" && (
                  <Button asChild className="w-full">
                    <Link href="/dashboard">
                      Register Now <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}

                {userStatus === "Approved" && (
                  <Button asChild className="w-full">
                    <Link href="/dashboard">
                      Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}

                {/* Fallback for demo */}
                <Button asChild variant="secondary" className="w-full">
                  <Link href="/dashboard">
                    Go to Dashboard (Demo)
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
