import { headers } from 'next/headers'
import JsonLd from './json-ld'

export default async function JsonLdWrapper() {
  const headersList = await headers()
  const hostname = headersList.get('host') || 'localhost:3000'
  
  return <JsonLd hostname={hostname} />
}
