/**
 * Example: How to integrate the Dynamic Content Type API with the admin UI
 *
 * This shows how to replace mockApi calls with the new dynamic API
 */

import { api } from '~/routes/api'

// Example: Updated Content Entries component using the new API
export function useContentEntries(contentTypeSlug: string) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load entries using the new API
  const loadEntries = async (params = {}) => {
    setLoading(true)
    try {
      const response = await api.listEntries(contentTypeSlug, params)
      if (response.success) {
        setEntries(response.data.entries)
        setError(null)
      } else {
        setError(response.error)
      }
    } catch (err) {
      setError('Failed to load entries')
    } finally {
      setLoading(false)
    }
  }

  // Create entry using the new API
  const createEntry = async formData => {
    const response = await api.createEntry(contentTypeSlug, {
      slug: formData.slug,
      fieldValues: formData.fieldValues,
    })

    if (response.success) {
      await loadEntries() // Refresh the list
      return response.data.entry
    } else {
      throw new Error(response.error)
    }
  }

  // Update entry using the new API
  const updateEntry = async (entryId, formData) => {
    const response = await api.updateEntry(contentTypeSlug, entryId, {
      slug: formData.slug,
      fieldValues: formData.fieldValues,
    })

    if (response.success) {
      await loadEntries() // Refresh the list
      return response.data.entry
    } else {
      throw new Error(response.error)
    }
  }

  // Delete entry using the new API
  const deleteEntry = async entryId => {
    const response = await api.deleteEntry(contentTypeSlug, entryId)

    if (response.success) {
      await loadEntries() // Refresh the list
      return true
    } else {
      throw new Error(response.error)
    }
  }

  return {
    entries,
    loading,
    error,
    loadEntries,
    createEntry,
    updateEntry,
    deleteEntry,
  }
}

// Example: Updated Content Entries Page component
export default function ContentEntriesPageWithAPI() {
  const contentTypeSlug = getContentTypeSlugFromUrl()
  const { entries, loading, error, loadEntries, createEntry, updateEntry, deleteEntry } =
    useContentEntries(contentTypeSlug)

  // Search functionality
  const [searchTerm, setSearchTerm] = useState('')
  const handleSearch = term => {
    setSearchTerm(term)
    loadEntries({ search: term })
  }

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const handlePageChange = page => {
    setCurrentPage(page)
    loadEntries({ page, search: searchTerm })
  }

  // Load initial data
  useEffect(() => {
    loadEntries()
  }, [contentTypeSlug])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />

  return (
    <AdminLayout>
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <h1>Content Entries</h1>
          <button onClick={() => setShowCreateForm(true)}>Add New Entry</button>
        </div>

        {/* Search */}
        <SearchInput value={searchTerm} onChange={handleSearch} placeholder='Search entries...' />

        {/* Entries Table */}
        <EntriesTable
          entries={entries}
          onEdit={entry => handleEdit(entry)}
          onDelete={entry => deleteEntry(entry.id)}
        />

        {/* Pagination */}
        <Pagination currentPage={currentPage} onPageChange={handlePageChange} />
      </div>
    </AdminLayout>
  )
}

// Example: Form submission with new API
export function ContentEntryForm({ entry, contentType, onSubmit }) {
  const [formData, setFormData] = useState({
    slug: entry?.slug || '',
    fieldValues: entry?.fieldValues || [],
  })

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      if (entry) {
        // Update existing entry
        await onSubmit(entry.id, formData)
      } else {
        // Create new entry
        await onSubmit(formData)
      }
      // Success feedback
      alert('Entry saved successfully!')
    } catch (error) {
      // Error feedback
      alert(`Error: ${error.message}`)
    }
  }

  return <form onSubmit={handleSubmit}>{/* Form fields here */}</form>
}

// Example: Migration guide for existing components
/*
MIGRATION STEPS:

1. Replace mockApi imports:
   // OLD
   import { mockApi } from '~/lib/mock-api'
   
   // NEW
   import { api } from '~/routes/api'

2. Update function calls:
   // OLD
   const entries = await mockApi.getContentEntries(contentTypeId)
   
   // NEW
   const response = await api.listEntries(contentTypeSlug)
   const entries = response.success ? response.data.entries : []

3. Handle responses:
   // OLD
   const entry = await mockApi.createContentEntry(data)
   
   // NEW
   const response = await api.createEntry(contentTypeSlug, data)
   if (response.success) {
     const entry = response.data.entry
   } else {
     console.error(response.error)
   }

4. Update error handling:
   // NEW - All API calls return { success, data?, error?, details? }
   if (!response.success) {
     console.error('API Error:', response.error)
     console.error('Details:', response.details)
   }
*/
