import { redirect } from "next/navigation";

export default async function RefPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  redirect(`/register?ref=${encodeURIComponent(code.toUpperCase())}`);
}
