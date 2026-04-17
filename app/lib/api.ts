const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
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
export const getClients = () => req("/clients");
export const addClient = (body: object) =>
  req("/clients", { method: "POST", body: JSON.stringify(body) });
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
