import type { Metadata } from "next";
import { Wallet } from "@/components/app/wallet";

export const metadata: Metadata = {
  title: "Wallet",
};

export default function WalletPage() {
  return <Wallet />;
}
