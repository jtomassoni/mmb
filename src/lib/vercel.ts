const API = 'https://api.vercel.com';

export interface VercelDomainResponse {
  id: string
  name: string
  projectId: string
  verified: boolean
  verification?: {
    type: string
    domain: string
    value: string
  }[]
  createdAt: number
  updatedAt: number
}

export interface VercelDomainStatus {
  id: string
  name: string
  verified: boolean
  verification?: {
    type: string
    domain: string
    value: string
  }[]
}

export async function addProjectDomain({projectId, token, hostname}:{projectId:string; token:string; hostname:string}): Promise<VercelDomainResponse> {
  const res = await fetch(`${API}/v10/projects/${projectId}/domains`, {
    method:'POST', 
    headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
    body: JSON.stringify({ name: hostname })
  });
  if (!res.ok) throw new Error(await res.text()); 
  return res.json();
}

export async function getDomainStatus({token, hostname}:{token:string; hostname:string}): Promise<VercelDomainStatus> {
  const res = await fetch(`${API}/v6/domains/${hostname}`, { 
    headers:{Authorization:`Bearer ${token}`} 
  });
  if (!res.ok) throw new Error(await res.text()); 
  return res.json();
}

export async function getProjectDomains({projectId, token}:{projectId:string; token:string}): Promise<VercelDomainResponse[]> {
  const res = await fetch(`${API}/v10/projects/${projectId}/domains`, {
    headers:{Authorization:`Bearer ${token}`}
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.domains || [];
}

export async function removeProjectDomain({projectId, token, domainId}:{projectId:string; token:string; domainId:string}): Promise<void> {
  const res = await fetch(`${API}/v10/projects/${projectId}/domains/${domainId}`, {
    method: 'DELETE',
    headers:{Authorization:`Bearer ${token}`}
  });
  if (!res.ok) throw new Error(await res.text());
}
