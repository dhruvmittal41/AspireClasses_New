import QRCode from "qrcode";
import { writeFile } from "node:fs/promises";
// Existing payment destination from the legacy PaymentPage. Update together with src/lib/payment.ts.
const upiId = "mittaldhruv41@okhdfcbank";
const payload =
  "upi://pay?" +
  new URLSearchParams({ pa: upiId, pn: "Aspire Classes", cu: "INR" });
const svg = await QRCode.toString(payload, {
  type: "svg",
  errorCorrectionLevel: "M",
  margin: 4,
  width: 320,
});
await writeFile(new URL("../public/payment-qr.svg", import.meta.url), svg);
