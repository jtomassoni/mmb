'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Domain {
  id: string
  hostname: string
  status: 'PENDING' | 'ACTIVE' | 'ERROR'
  provider: string
  verifiedAt: string | null
  createdAt: string
  site: {
    id: string
    name: string
  }
}

export default function DomainManagementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [domains, setDomains] = useState<Domain[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newDomain, setNewDomain] = useState({ siteId: '', hostname: '' })
  const [sites, setSites] = useState<Array<{id: string, name: string}>>([])

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchDomains()
      fetchSites()
    }
  }, [session])

  const fetchDomains = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/superadmin/domains')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setDomains(data.domains)
    } catch (error) {
      console.error('Failed to fetch domains:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch domains')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSites = async () => {
    try {
      const response = await fetch('/api/superadmin/sites')
      if (response.ok) {
        const data = await response.json()
        setSites(data.sites)
      }
    } catch (error) {
      console.error('Failed to fetch sites:', error)
    }
  }

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/superadmin/domains/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDomain)
      })

      if (!response.ok) {
        throw new Error('Failed to add domain')
      }

      const data = await response.json()
      setDomains([...domains, data.domain])
      setShowAddForm(false)
      setNewDomain({ siteId: '', hostname: '' })
    } catch (error) {
      console.error('Failed to add domain:', error)
      alert('Failed to add domain')
    }
  }

  const handleVerifyDomain = async (domainId: string) => {
    try {
      const response = await fetch('/api/superadmin/domains/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domainId })
      })

      if (!response.ok) {
        throw new Error('Failed to verify domain')
      }

      const data = await response.json()
      setDomains(domains.map(d => d.id === domainId ? data.domain : d))
    } catch (error) {
      console.error('Failed to verify domain:', error)
      alert('Failed to verify domain')
    }
  }

  if (status === 'loading') {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-lg">Loading...</div>
    </div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Domain Management</h1>
              <p className="mt-2 text-gray-600">Manage restaurant domains and DNS settings</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Domain
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Add New Domain</h2>
            <form onSubmit={handleAddDomain}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site
                  </label>
                  <select
                    value={newDomain.siteId}
                    onChange={(e) => setNewDomain({...newDomain, siteId: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a site</option>
                    {sites.map(site => (
                      <option key={site.id} value={site.id}>{site.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Domain
                  </label>
                  <input
                    type="text"
                    value={newDomain.hostname}
                    onChange={(e) => setNewDomain({...newDomain, hostname: e.target.value})}
                    placeholder="example.com"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Domain
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="bg-white p-8 rounded-lg shadow">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchDomains}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Domain
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Site
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verified
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {domains.map((domain) => (
                  <tr key={domain.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{domain.hostname}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{domain.site.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        domain.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800'
                          : domain.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {domain.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {domain.provider}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {domain.verifiedAt ? new Date(domain.verifiedAt).toLocaleDateString() : 'Not verified'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {domain.status === 'PENDING' && (
                        <button
                          onClick={() => handleVerifyDomain(domain.id)}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          Verify
                        </button>
                      )}
                      <a
                        href={`https://${domain.hostname}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Visit Site
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
