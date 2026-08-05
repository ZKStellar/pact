import type { Metadata } from "next";
import { ApiDocs } from "@/components/app/api-docs";

export const metadata: Metadata = {
  title: "API Reference",
};

export default function ApiDocsPage() {
  return <ApiDocs />;
}
