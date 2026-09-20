import Image from "next/image";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { payment } from "@/lib/payment";
export const metadata = {
  title: "Payment QR",
  robots: { index: false, follow: false },
};
export default async function Payment({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const { db } = await requireUser("/payment/bundle/" + id);
  const { data, error } = await db
    .from("bundles")
    .select("id")
    .eq("id", Number(id))
    .eq("published", true)
    .maybeSingle();
  if (error) throw error;
  if (!data) notFound();
  return (
    <main id="main" className="container section">
      <div className="panel qr-card">
        <Image
          src={payment.qrImage}
          width={320}
          height={320}
          alt={`UPI payment QR code for ${payment.upiId}`}
          unoptimized
        />
        <strong>{payment.upiId}</strong>
      </div>
    </main>
  );
}

export const dynamic = "force-dynamic";
