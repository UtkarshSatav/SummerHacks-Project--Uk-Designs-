import { redirect } from "next/navigation";

async function getProfile() {
  try {
    const res = await fetch("http://localhost:8000/profile", { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.id ? data : null;
  } catch {
    return null;
  }
}

export default async function RootPage() {
  const profile = await getProfile();
  if (profile) redirect("/dashboard");
  redirect("/onboarding");
}
