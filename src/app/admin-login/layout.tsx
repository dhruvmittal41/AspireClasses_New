import { Brand } from "@/components/brand";
import { ShieldAlert } from "lucide-react";

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-layout">
      <aside className="auth-aside">
        <Brand />
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <ShieldAlert size={32} style={{ color: "var(--color-primary)" }} />
            <span className="eyebrow">RESTRICTED ACCESS</span>
          </div>
          <h2>
            Administrator
            <br />
            Portal
            <br />
            <em>Secure Login</em>
          </h2>
          <p>
            This area is reserved for
            <br />
            authorized administrators only.
          </p>
        </div>
        <span>Aspire Classes Admin · Protected Area</span>
      </aside>
      <main id="main" className="auth-main">
        {children}
      </main>
    </div>
  );
}
