"use client";
import { startTransition, useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { adminAction } from "@/app/admin/actions";
export function AdminForm({
  action,
  children,
  label = "Save changes",
  className = "form-grid",
  resetOnSuccess = false,
}: {
  action: string;
  children: React.ReactNode;
  label?: string;
  className?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, submit, pending] = useActionState(adminAction, {
    ok: false,
    message: "",
  });
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok && resetOnSuccess) formRef.current?.reset();
  }, [state, resetOnSuccess]);
  return (
    <form ref={formRef} className={className} aria-busy={pending} onSubmit={(event) => {
      event.preventDefault();
      if (pending) return;
      const data = new FormData(event.currentTarget);
      startTransition(() => submit(data));
    }}>
      <input type="hidden" name="action" value={action} />
      <fieldset className="admin-form-fields" disabled={pending}>{children}</fieldset>
      <div className="form-bottom">
        <button className="button" disabled={pending}>
          {pending ? "Saving…" : label}
        </button>
        {state.message && (
          <p
            role={state.ok ? "status" : "alert"}
            className={state.ok ? "success-message" : "error-message"}
          >
            {state.message}{state.href && <> <Link className="text-link" href={state.href}>Add questions →</Link></>}
          </p>
        )}
      </div>
    </form>
  );
}
