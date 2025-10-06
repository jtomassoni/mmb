import { getSiteData } from '@/lib/site-data'
import { HeaderClient } from './header-client'

export async function Header() {
  const siteData = await getSiteData()
  
  return <HeaderClient siteName={siteData?.name} />
}
