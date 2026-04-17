import { redirect } from "next/navigation";

// Ghost's /login route redirects to ghost-1's real Supabase auth page at /auth
export default function LoginPage() {
  redirect("/auth");
}
