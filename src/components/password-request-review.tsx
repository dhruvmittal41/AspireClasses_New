"use client";
import { useActionState } from "react";
import { reviewPasswordRequest } from "@/app/admin/password-requests/actions";

export function PasswordRequestReview({ id }: { id: string }) {
  const [state, action, pending] = useActionState(reviewPasswordRequest, { message: "" });
  return <form action={action}>
    <input type="hidden" name="id" value={id} />
    <p>Verify the student using your existing enrollment records or a previously known contact. The phone number supplied in this request is not proof of identity.</p>
    <label><input type="checkbox" name="verified" disabled={pending} /> I verified the student independently.</label>
    <label>Replacement password<input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={72} disabled={pending} /></label>
    <button className="button" name="action" value="reset" disabled={pending}>Set password and resolve</button>{" "}
    <button className="button secondary" name="action" value="reject" formNoValidate disabled={pending}>Reject request</button>
    {state.message && <p role="status">{state.message}</p>}
  </form>;
}
