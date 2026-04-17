import { supabase } from "./supabase";

export const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function getHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (data.session?.user?.id) {
    headers["X-User-ID"] = data.session.user.id;
  }
  return headers;
}

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = await getHeaders();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...headers, ...(options?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

/** Drop-in replacement for fetch() that auto-injects X-User-ID. Use this everywhere instead of raw fetch(). */
export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const headers = await getHeaders();
  return fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...headers, ...(options?.headers ?? {}) },
  });
}

// Profile
export const getProfile = () => req("/profile/");
export const createProfile = (body: object) =>
  req("/profile/", { method: "POST", body: JSON.stringify(body) });

// Leads
export const getLeads = () => req("/leads/");
export const triggerScan = () => req("/leads/scan", { method: "POST" });
export const getLead = (id: string) => req(`/leads/${id}`);
export const updateLeadStatus = (id: string, status: string) =>
  req(`/leads/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });

// Clients
export const getClients = () => req("/clients/");
export const addClient = (body: object) =>
  req("/clients/", { method: "POST", body: JSON.stringify(body) });
export const updateClient = (id: string, body: object) =>
  req(`/clients/${id}`, { method: "PUT", body: JSON.stringify(body) });

// Proposals
export const draftProposal = (body: {
  lead_id?: string;
  client_id?: string;
  context?: string;
}) => req("/proposals/draft", { method: "POST", body: JSON.stringify(body) });

// Pricing
export const analysePrice = (body: {
  project_description: string;
  client_type: string;
}) => req("/pricing/analyse", { method: "POST", body: JSON.stringify(body) });

// Daily Brief
export const getDailyBrief = () => req("/brief/daily");

// Seed demo data
export const seedDemo = () => req("/seed/demo", { method: "POST" });
