import { requireUser } from "@/lib/auth";
import { ProfileForm } from "@/components/profile-form";
export const metadata = { title: "My profile" };
export default async function Profile() {
  const { profile, user } = await requireUser();
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">A LITTLE ABOUT YOU</span>
        <h1>Your profile.</h1>
        <p>Keep your details up to date so we can support your preparation.</p>
      </div>
      <ProfileForm profile={profile} email={user.email || ""} />
    </>
  );
}
