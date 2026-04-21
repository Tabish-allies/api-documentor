import { useState, useEffect } from 'react'
import { Search, Book, Server, Code, ChevronDown, ChevronRight, Copy, Check, Activity, Tag } from 'lucide-react'

const METHOD_COLORS = {
  get: 'bg-green-100 text-green-800 border-green-300',
  post: 'bg-blue-100 text-blue-800 border-blue-300',
  put: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  patch: 'bg-orange-100 text-orange-800 border-orange-300',
  delete: 'bg-red-100 text-red-800 border-red-300',
}

const METHOD_BADGES = {
  get: 'bg-green-500',
  post: 'bg-blue-500',
  put: 'bg-yellow-500',
  patch: 'bg-orange-500',
  delete: 'bg-red-500',
}

function App() {
  const [spec, setSpec] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState(null)
  const [expandedEndpoints, setExpandedEndpoints] = useState({})
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    fetchSpec()
  }, [])

  const fetchSpec = async () => {
    try {
      const res = await fetch('/api-docs')
      if (!res.ok) throw new Error('Failed to fetch API spec')
      const data = await res.json()
      setSpec(data)
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading API Documentation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <Server className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">Could not connect to the API server. Make sure the Spring Boot application is running on port 8080.</p>
          <code className="text-sm bg-gray-100 p-2 rounded block">{error}</code>
          <button onClick={fetchSpec} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
            Retry
          </button>
        </div>
      </div>
    )
  }

  const endpoints = getEndpoints()
  const filteredEndpoints = filterEndpoints(endpoints)
  const tags = getTags()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Book className="h-8 w-8 text-indigo-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">{spec?.info?.title || 'API Documentation'}</h1>
                <p className="text-sm text-gray-500">v{spec?.info?.version} — Auto-Generated Documentation Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                <Activity className="h-4 w-4 inline mr-1 text-green-500" />
                {endpoints.length} endpoints
              </span>
              <a href="/swagger-ui.html" target="_blank" className="text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 text-gray-700">
                Swagger UI
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Service Description */}
        {spec?.info?.description && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Server className="h-5 w-5 text-indigo-500" />
              Service Overview
            </h2>
            <div className="text-gray-600 text-sm whitespace-pre-line">{spec.info.description}</div>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search endpoints, descriptions, business rules..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${!selectedTag ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                All
              </button>
              {tags.map(tag => (
                <button
                  key={tag.name}
                  onClick={() => setSelectedTag(tag.name)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition ${selectedTag === tag.name ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Showing {filteredEndpoints.length} of {endpoints.length} endpoints
          </div>
        </div>

        {/* Tag Descriptions */}
        {selectedTag && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-indigo-600" />
              <span className="font-medium text-indigo-800">{selectedTag}</span>
            </div>
            <p className="text-sm text-indigo-700 mt-1">
              {tags.find(t => t.name === selectedTag)?.description}
            </p>
          </div>
        )}

        {/* Endpoints List */}
        <div className="space-y-3">
          {filteredEndpoints.map((endpoint, idx) => {
            const endpointId = `${endpoint.method}-${endpoint.path}-${idx}`
            const isExpanded = expandedEndpoints[endpointId]
            const requestExample = getRequestBodyExample(endpoint)
            const responseSchema = getResponseSchema(endpoint)

            return (
              <div key={endpointId} className={`bg-white rounded-lg border ${isExpanded ? 'border-indigo-300 shadow-md' : 'border-gray-200'} overflow-hidden`}>
                {/* Endpoint Header */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleEndpoint(endpointId)}
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${METHOD_BADGES[endpoint.method]} text-white min-w-[60px] text-center`}>
                    {endpoint.method}
                  </span>
                  <code className="text-sm font-mono text-gray-800">{endpoint.path}</code>
                  <span className="text-sm text-gray-500 ml-auto hidden md:block">{endpoint.summary}</span>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
                    {/* Summary & Description */}
                    <div>
                      <h3 className="font-semibold text-gray-800">{endpoint.summary}</h3>
                      {endpoint.description && (
                        <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{endpoint.description}</p>
                      )}
                    </div>

                    {/* Parameters */}
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

                    {/* Request Body Example */}
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
                        <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto">
                          {JSON.stringify(requestExample, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Response Schema */}
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

                    {/* Response Codes */}
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

                    {/* cURL Example */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-700">cURL Example</h4>
                        <button
                          onClick={() => {
                            const curl = `curl -X ${endpoint.method.toUpperCase()} http://localhost:8080${endpoint.path}${requestExample ? ` \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(requestExample)}'` : ''}`
                            copyToClipboard(curl, `curl-${endpointId}`)
                          }}
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600"
                        >
                          {copiedId === `curl-${endpointId}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          {copiedId === `curl-${endpointId}` ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <pre className="bg-gray-900 text-gray-300 p-4 rounded text-sm overflow-x-auto">
                        <span className="text-yellow-400">curl</span> -X <span className="text-green-400">{endpoint.method.toUpperCase()}</span> <span className="text-blue-400">http://localhost:8080{endpoint.path}</span>
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

        {/* Schemas Section */}
        {spec?.components?.schemas && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Code className="h-5 w-5 text-indigo-500" />
              Data Schemas
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(spec.components.schemas).map(([name, schema]) => (
                <div key={name} className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="font-semibold text-indigo-700 mb-1">{name}</h3>
                  {schema.description && <p className="text-xs text-gray-500 mb-3">{schema.description}</p>}
                  {renderSchemaProperties(schema)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 pb-8 text-center text-sm text-gray-500">
          <p>Auto-generated from OpenAPI 3.0 specification</p>
          <p className="mt-1">Server: {spec?.servers?.[0]?.url} ({spec?.servers?.[0]?.description})</p>
        </footer>
      </div>
    </div>
  )
}

export default App
