const API = 'https://api.vercel.com';
export async function addProjectDomain({projectId, token, hostname}:{projectId:string; token:string; hostname:string}) {
  const res = await fetch(`${API}/v10/projects/${projectId}/domains`, {
    method:'POST', headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
    body: JSON.stringify({ name: hostname })
  });
  if (!res.ok) throw new Error(await res.text()); return res.json();
}
export async function getDomainStatus({token, hostname}:{token:string; hostname:string}) {
  const res = await fetch(`${API}/v6/domains/${hostname}`, { headers:{Authorization:`Bearer ${token}`} });
  if (!res.ok) throw new Error(await res.text()); return res.json();
}
