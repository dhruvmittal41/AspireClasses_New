"use client";
import { useActionState } from "react";
import { adminAction } from "@/app/admin/actions";
export function AdminForm({
  action,
  children,
  label = "Save changes",
  className = "form-grid",
}: {
  action: string;
  children: React.ReactNode;
  label?: string;
  className?: string;
}) {
  const [state, submit, pending] = useActionState(adminAction, {
    ok: false,
    message: "",
  });
  return (
    <form action={submit} className={className}>
      <input type="hidden" name="action" value={action} />
      {children}
      <div className="form-bottom">
        <button className="button" disabled={pending}>
          {pending ? "Saving…" : label}
        </button>
        {state.message && (
          <p
            role={state.ok ? "status" : "alert"}
            className={state.ok ? "success-message" : "error-message"}
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
