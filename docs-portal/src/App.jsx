import { useState, useEffect } from 'react'
import { Search, Book, Server, Code, ChevronDown, ChevronRight, Copy, Check, Activity, Tag, Plus, Link, Trash2, RefreshCw, Zap, Globe } from 'lucide-react'

const METHOD_BADGES = {
  get: 'bg-green-500',
  post: 'bg-blue-500',
  put: 'bg-yellow-500',
  patch: 'bg-orange-500',
  delete: 'bg-red-500',
}

function App() {
  const [services, setServices] = useState([])
  const [activeService, setActiveService] = useState(null)
  const [spec, setSpec] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState(null)
  const [expandedEndpoints, setExpandedEndpoints] = useState({})
  const [copiedId, setCopiedId] = useState(null)
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [connectForm, setConnectForm] = useState({ name: '', apiDocsUrl: '', description: '' })
  const [connectError, setConnectError] = useState('')
  const [view, setView] = useState('portal') // 'portal' | 'registry'

  useEffect(() => {
    loadServices()
  }, [])

  useEffect(() => {
    if (activeService) {
      fetchSpecForService(activeService.apiDocsUrl)
    }
  }, [activeService])

  const loadServices = async () => {
    try {
      const res = await fetch('/api/v1/registry/services')
      if (res.ok) {
        const data = await res.json()
        setServices(data)
        if (data.length > 0) {
          setActiveService(data[0])
        }
      }
    } catch (err) {
      // Fallback: use local service directly
      const fallback = [{ name: 'Local Service', apiDocsUrl: '/api-docs', status: 'CONNECTED' }]
      setServices(fallback)
      setActiveService(fallback[0])
    }
  }

  const fetchSpecForService = async (url) => {
    setLoading(true)
    setError(null)
    try {
      // Use proxy for external URLs, direct for local
      const fetchUrl = url.startsWith('/') ? url : `/api/v1/registry/spec?url=${encodeURIComponent(url)}`
      const res = await fetch(fetchUrl)
      if (!res.ok) throw new Error('Failed to fetch API spec')
      const text = await res.text()
      const data = JSON.parse(text)
      setSpec(data)
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const connectService = async () => {
    setConnectError('')
    if (!connectForm.name || !connectForm.apiDocsUrl) {
      setConnectError('Service name and API Docs URL are required')
      return
    }
    try {
      const res = await fetch('/api/v1/registry/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(connectForm)
      })
      const data = await res.json()
      if (!res.ok) {
        setConnectError(data.error || 'Failed to connect')
        return
      }
      setShowConnectModal(false)
      setConnectForm({ name: '', apiDocsUrl: '', description: '' })
      loadServices()
    } catch (err) {
      setConnectError('Connection failed: ' + err.message)
    }
  }

  const getEndpoints = () => {
    if (!spec || !spec.paths) return []
    const endpoints = []
    Object.entries(spec.paths).forEach(([path, methods]) => {
      Object.entries(methods).forEach(([method, details]) => {
        if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
          endpoints.push({ path, method, ...details })
        }
      })
    })
    return endpoints
  }

  const getTags = () => {
    if (!spec || !spec.tags) return []
    return spec.tags
  }

  const filterEndpoints = (endpoints) => {
    return endpoints.filter(ep => {
      const matchesSearch = searchQuery === '' ||
        ep.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ep.summary && ep.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (ep.description && ep.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        ep.method.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesTag = !selectedTag || (ep.tags && ep.tags.includes(selectedTag))

      return matchesSearch && matchesTag
    })
  }

  const toggleEndpoint = (id) => {
    setExpandedEndpoints(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getSchema = (schemaRef) => {
    if (!schemaRef || !spec) return null
    if (schemaRef.$ref) {
      const parts = schemaRef.$ref.split('/')
      const schemaName = parts[parts.length - 1]
      return { name: schemaName, schema: spec.components?.schemas?.[schemaName] }
    }
    if (schemaRef.items && schemaRef.items.$ref) {
      const parts = schemaRef.items.$ref.split('/')
      const schemaName = parts[parts.length - 1]
      return { name: `Array<${schemaName}>`, schema: spec.components?.schemas?.[schemaName] }
    }
    return null
  }

  const renderSchemaProperties = (schema) => {
    if (!schema || !schema.properties) return null
    return (
      <div className="space-y-1">
        {Object.entries(schema.properties).map(([propName, propDetails]) => (
          <div key={propName} className="flex items-start gap-2 text-sm">
            <code className="text-purple-600 font-medium min-w-[140px]">{propName}</code>
            <span className="text-gray-500">{propDetails.type || 'object'}</span>
            {propDetails.description && (
              <span className="text-gray-600 text-xs">— {propDetails.description}</span>
            )}
            {propDetails.example !== undefined && (
              <span className="text-xs bg-gray-100 px-1 rounded ml-auto">ex: {JSON.stringify(propDetails.example)}</span>
            )}
          </div>
        ))}
      </div>
    )
  }

  const getRequestBodyExample = (endpoint) => {
    const content = endpoint.requestBody?.content?.['application/json']
    if (!content) return null
    if (content.examples) {
      const firstExample = Object.values(content.examples)[0]
      return firstExample?.value
    }
    if (content.example) return content.example
    return null
  }

  const getResponseSchema = (endpoint) => {
    const response200 = endpoint.responses?.['200'] || endpoint.responses?.['201']
    if (!response200) return null
    const content = response200.content?.['application/json'] || response200.content?.['*/*']
    if (!content || !content.schema) return null
    return getSchema(content.schema)
  }

  const endpoints = getEndpoints()
  const filteredEndpoints = filterEndpoints(endpoints)
  const tags = getTags()

  // Inline modal and registry JSX (not as sub-components, to avoid focus loss)
  const connectModalJSX = showConnectModal ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Zap className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">One-Click Integration</h2>
            <p className="text-sm text-gray-500">Connect any service with a Swagger/OpenAPI endpoint</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Name *</label>
            <input
              type="text"
              placeholder="e.g. User Service, Payment API"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={connectForm.name}
              onChange={(e) => setConnectForm(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Docs URL *</label>
            <input
              type="text"
              placeholder="e.g. http://your-service:8080/v3/api-docs"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={connectForm.apiDocsUrl}
              onChange={(e) => setConnectForm(prev => ({ ...prev, apiDocsUrl: e.target.value }))}
            />
            <p className="text-xs text-gray-400 mt-1">The URL where your service exposes its OpenAPI/Swagger JSON spec</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <input
              type="text"
              placeholder="Brief description of the service"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={connectForm.description}
              onChange={(e) => setConnectForm(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          {connectError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {connectError}
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-600 mb-2">How it works:</p>
            <ol className="text-xs text-gray-500 space-y-1 list-decimal list-inside">
              <li>Add SpringDoc/Swagger to your Spring Boot service (if not already)</li>
              <li>Paste your service's <code className="bg-gray-200 px-1 rounded">/api-docs</code> URL above</li>
              <li>Click Connect - documentation appears instantly!</li>
            </ol>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => { setShowConnectModal(false); setConnectError('') }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={connectService}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
          >
            <Link className="h-4 w-4" />
            Connect Service
          </button>
        </div>
      </div>
    </div>
  ) : null

  const registryJSX = (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Service Registry</h2>
          <p className="text-gray-500">All connected API services in your organization</p>
        </div>
        <button
          onClick={() => setShowConnectModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Connect Service
        </button>
      </div>

      <div className="grid gap-4">
        {services.map((service, idx) => (
          <div key={idx} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Server className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{service.name}</h3>
                  <p className="text-sm text-gray-500">{service.description || service.apiDocsUrl}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  {service.status}
                </span>
                <button
                  onClick={() => { setActiveService(service); setView('portal') }}
                  className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 text-sm font-medium"
                >
                  View Docs
                </button>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
              <span><Globe className="h-3 w-3 inline mr-1" />{service.apiDocsUrl}</span>
              {service.registeredAt && <span>Registered: {service.registeredAt}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Integration Guide */}
      <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-6">
        <h3 className="text-lg font-bold text-indigo-900 mb-3 flex items-center gap-2">
          <Zap className="h-5 w-5" />
          One-Click Integration Guide
        </h3>
        <p className="text-sm text-indigo-700 mb-4">
          Already have Swagger/SpringDoc in your service? Connect it to this portal in seconds:
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-indigo-100">
            <div className="text-2xl font-bold text-indigo-600 mb-2">1</div>
            <h4 className="font-medium text-gray-800 text-sm">Add Dependency</h4>
            <p className="text-xs text-gray-500 mt-1">If not already present, add <code className="bg-gray-100 px-1 rounded">springdoc-openapi-starter-webmvc-ui</code> to your pom.xml</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-indigo-100">
            <div className="text-2xl font-bold text-indigo-600 mb-2">2</div>
            <h4 className="font-medium text-gray-800 text-sm">Ensure /api-docs is accessible</h4>
            <p className="text-xs text-gray-500 mt-1">SpringDoc auto-exposes this. Verify at <code className="bg-gray-100 px-1 rounded">http://your-service/api-docs</code></p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-indigo-100">
            <div className="text-2xl font-bold text-indigo-600 mb-2">3</div>
            <h4 className="font-medium text-gray-800 text-sm">Click "Connect Service"</h4>
            <p className="text-xs text-gray-500 mt-1">Paste your URL above and your docs appear instantly in this portal!</p>
          </div>
        </div>
        <div className="mt-4 bg-white rounded-lg p-4 border border-indigo-100">
          <h4 className="font-medium text-gray-800 text-sm mb-2">Enrich with Business Context (Optional)</h4>
          <p className="text-xs text-gray-500">Add <code className="bg-gray-100 px-1 rounded">@Operation(description = "Business Rule: ...")</code> annotations to your controllers for richer documentation.</p>
          <pre className="mt-2 bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">{`@Operation(
    summary = "Create Order",
    description = "Business Rule: Stock is deducted on creation. Cannot exceed available inventory."
)
@PostMapping("/orders")
public ResponseEntity<Order> createOrder(@RequestBody Order order) { ... }`}</pre>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Book className="h-7 w-7 text-indigo-600" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">API Documentation Portal</h1>
                <p className="text-xs text-gray-500">Auto-Generated | Searchable | One-Click Integration</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView('portal')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${view === 'portal' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Code className="h-4 w-4 inline mr-1" />
                Docs
              </button>
              <button
                onClick={() => setView('registry')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${view === 'registry' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Server className="h-4 w-4 inline mr-1" />
                Services ({services.length})
              </button>
              <button
                onClick={() => setShowConnectModal(true)}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Connect
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Connect Modal */}
      {connectModalJSX}

      {/* Registry View */}
      {view === 'registry' && registryJSX}

      {/* Portal/Docs View */}
      {view === 'portal' && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Service Switcher */}
          {services.length > 1 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {services.map((service, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveService(service)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                    activeService?.name === service.name
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Server className="h-3 w-3 inline mr-1" />
                  {service.name}
                </button>
              ))}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-3 text-gray-500 text-sm">Loading documentation...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-white p-6 rounded-lg border border-red-200 text-center">
              <Server className="h-10 w-10 text-red-400 mx-auto mb-3" />
              <p className="text-gray-700 font-medium">Could not load documentation</p>
              <p className="text-sm text-gray-500 mt-1">{error}</p>
              <button onClick={() => activeService && fetchSpecForService(activeService.apiDocsUrl)} className="mt-3 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
                Retry
              </button>
            </div>
          )}

          {!loading && !error && spec && (
            <>
              {/* Service Info */}
              {spec?.info?.description && (
                <div className="bg-white rounded-lg border border-gray-200 p-5 mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                      <Server className="h-4 w-4 text-indigo-500" />
                      {spec.info.title} <span className="text-xs font-normal text-gray-400">v{spec.info.version}</span>
                    </h2>
                    <span className="text-xs text-gray-400">{endpoints.length} endpoints</span>
                  </div>
                  <div className="text-gray-600 text-sm whitespace-pre-line">{spec.info.description}</div>
                </div>
              )}

              {/* Search & Filter */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-5">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search endpoints, descriptions, business rules..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setSelectedTag(null)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition ${!selectedTag ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      All
                    </button>
                    {tags.map(tag => (
                      <button
                        key={tag.name}
                        onClick={() => setSelectedTag(tag.name)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition ${selectedTag === tag.name ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  Showing {filteredEndpoints.length} of {endpoints.length} endpoints
                </div>
              </div>

              {/* Selected Tag Info */}
              {selectedTag && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-5">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-indigo-600" />
                    <span className="font-medium text-indigo-800 text-sm">{selectedTag}</span>
                  </div>
                  <p className="text-xs text-indigo-700 mt-1">
                    {tags.find(t => t.name === selectedTag)?.description}
                  </p>
                </div>
              )}

              {/* Endpoints */}
              <div className="space-y-3">
                {filteredEndpoints.map((endpoint, idx) => {
                  const endpointId = `${endpoint.method}-${endpoint.path}-${idx}`
                  const isExpanded = expandedEndpoints[endpointId]
                  const requestExample = getRequestBodyExample(endpoint)
                  const responseSchema = getResponseSchema(endpoint)

                  return (
                    <div key={endpointId} className={`bg-white rounded-lg border ${isExpanded ? 'border-indigo-300 shadow-md' : 'border-gray-200'} overflow-hidden`}>
                      <div
                        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleEndpoint(endpointId)}
                      >
                        {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${METHOD_BADGES[endpoint.method]} text-white min-w-[55px] text-center`}>
                          {endpoint.method}
                        </span>
                        <code className="text-sm font-mono text-gray-800">{endpoint.path}</code>
                        <span className="text-xs text-gray-500 ml-auto hidden md:block">{endpoint.summary}</span>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
                          <div>
                            <h3 className="font-semibold text-gray-800">{endpoint.summary}</h3>
                            {endpoint.description && (
                              <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{endpoint.description}</p>
                            )}
                          </div>

                          {endpoint.parameters && endpoint.parameters.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">Parameters</h4>
                              <div className="bg-white rounded border p-3">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="text-left text-gray-500 border-b">
                                      <th className="pb-2 pr-4">Name</th>
                                      <th className="pb-2 pr-4">In</th>
                                      <th className="pb-2 pr-4">Type</th>
                                      <th className="pb-2">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {endpoint.parameters.map((param, pidx) => (
                                      <tr key={pidx} className="border-b last:border-0">
                                        <td className="py-2 pr-4"><code className="text-purple-600">{param.name}</code></td>
                                        <td className="py-2 pr-4 text-gray-500">{param.in}</td>
                                        <td className="py-2 pr-4 text-gray-500">{param.schema?.type || 'string'}</td>
                                        <td className="py-2 text-gray-600">{param.description}
                                          {param.schema?.example && <span className="ml-2 text-xs bg-gray-100 px-1 rounded">ex: {param.schema.example}</span>}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {requestExample && (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-semibold text-gray-700">Request Body Example</h4>
                                <button
                                  onClick={() => copyToClipboard(JSON.stringify(requestExample, null, 2), `req-${endpointId}`)}
                                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600"
                                >
                                  {copiedId === `req-${endpointId}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                  {copiedId === `req-${endpointId}` ? 'Copied!' : 'Copy'}
                                </button>
                              </div>
                              <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
                                {JSON.stringify(requestExample, null, 2)}
                              </pre>
                            </div>
                          )}

                          {responseSchema && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                Response Schema: <code className="text-indigo-600">{responseSchema.name}</code>
                              </h4>
                              <div className="bg-white rounded border p-3">
                                {renderSchemaProperties(responseSchema.schema)}
                              </div>
                            </div>
                          )}

                          {endpoint.responses && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">Response Codes</h4>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(endpoint.responses).map(([code, details]) => (
                                  <span key={code} className={`px-2 py-1 rounded text-xs font-medium ${
                                    code.startsWith('2') ? 'bg-green-100 text-green-700' :
                                    code.startsWith('4') ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {code}: {details.description}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-semibold text-gray-700">cURL Example</h4>
                              <button
                                onClick={() => {
                                  const baseUrl = spec?.servers?.[0]?.url || 'http://localhost:8080'
                                  const curl = `curl -X ${endpoint.method.toUpperCase()} ${baseUrl}${endpoint.path}${requestExample ? ` \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(requestExample)}'` : ''}`
                                  copyToClipboard(curl, `curl-${endpointId}`)
                                }}
                                className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600"
                              >
                                {copiedId === `curl-${endpointId}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                {copiedId === `curl-${endpointId}` ? 'Copied!' : 'Copy'}
                              </button>
                            </div>
                            <pre className="bg-gray-900 text-gray-300 p-3 rounded text-xs overflow-x-auto">
                              <span className="text-yellow-400">curl</span> -X <span className="text-green-400">{endpoint.method.toUpperCase()}</span> <span className="text-blue-400">{spec?.servers?.[0]?.url || 'http://localhost:8080'}{endpoint.path}</span>
                              {requestExample && (
                                <>{'\n'}  -H <span className="text-yellow-300">"Content-Type: application/json"</span>{'\n'}  -d <span className="text-green-300">'{JSON.stringify(requestExample, null, 2)}'</span></>
                              )}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Schemas */}
              {spec?.components?.schemas && (
                <div className="mt-8">
                  <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Code className="h-5 w-5 text-indigo-500" />
                    Data Schemas
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(spec.components.schemas).map(([name, schema]) => (
                      <div key={name} className="bg-white rounded-lg border border-gray-200 p-4">
                        <h3 className="font-semibold text-indigo-700 mb-1 text-sm">{name}</h3>
                        {schema.description && <p className="text-xs text-gray-500 mb-3">{schema.description}</p>}
                        {renderSchemaProperties(schema)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <footer className="mt-10 pb-6 text-center text-xs text-gray-400">
                <p>Auto-generated from OpenAPI 3.0 specification | {spec?.servers?.[0]?.url}</p>
              </footer>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default App
