'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { AdminSubNav } from '@/components/admin-sub-nav'
import { formatTimeInTimezone, getRelativeTime, getCompanyTimezone } from '@/lib/timezone'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image?: string
  isAvailable: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

interface MenuCategory {
  id: string
  name: string
  description: string
  sortOrder: number
}

interface ActivityLog {
  id: string
  action: string
  resource: string
  resourceId: string | null
  timestamp: string
  user: {
    id: string
    name: string | null
    email: string
    role: string
  }
  site: {
    id: string
    name: string
    timezone: string
  } | null
  changes: any
  metadata: any
  oldValue?: any
  newValue?: any
}

function SortableCategoryItem({ 
  category, 
  itemCount, 
  onEdit, 
  onDelete 
}: { 
  category: MenuCategory
  itemCount: number
  onEdit: (category: MenuCategory) => void
  onDelete: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <tr ref={setNodeRef} style={style} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        <div className="flex items-center space-x-2">
          <div 
            {...attributes} 
            {...listeners}
            className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </div>
          <span>{category.name}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {category.description}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {itemCount}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
        <button
          onClick={() => onEdit(category)}
          className="text-blue-600 hover:text-blue-900"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(category.id)}
          className="text-red-600 hover:text-red-900"
        >
          Delete
        </button>
      </td>
    </tr>
  )
}

// Sortable Menu Item Component for Preview
function SortableMenuItem({ item, category }: { item: MenuItem, category: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex justify-between items-start bg-white p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
    >
      <div className="flex-1">
        <div className="flex items-center space-x-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab hover:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
            </svg>
          </div>
          {item.image && (
            <img className="h-16 w-16 rounded-lg object-cover" src={item.image} alt={item.name} />
          )}
          <div>
            <h5 className="font-medium text-gray-900">{item.name}</h5>
            <p className="text-sm text-gray-600">{item.description}</p>
          </div>
        </div>
      </div>
      <div className="text-lg font-semibold text-gray-900">
        ${item.price.toFixed(2)}
      </div>
    </div>
  )
}

export default function MenuManagementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState<'items' | 'categories' | 'preview'>('items')
  const [activityLoading, setActivityLoading] = useState(false)

  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([])

  const [showCreateItem, setShowCreateItem] = useState(false)
  const [showCreateCategory, setShowCreateCategory] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null)

  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    isAvailable: true
  })

  const [newCategory, setNewCategory] = useState({
    name: '',
    description: ''
  })

  // Sorting and filtering states
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'price' | 'createdAt'>('category')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'unavailable'>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Process menu items with filtering and sorting
  const processedMenuItems = menuItems
    .filter(item => {
      // Search filter
      if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !item.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      
      // Category filter
      if (filterCategory !== 'all' && item.category !== filterCategory) {
        return false
      }
      
      // Status filter
      if (filterStatus === 'available' && !item.isAvailable) {
        return false
      }
      if (filterStatus === 'unavailable' && item.isAvailable) {
        return false
      }
      
      return true
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'category':
          comparison = a.category.localeCompare(b.category)
          break
        case 'price':
          comparison = a.price - b.price
          break
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
    } else {
      fetchData()
    }
  }, [session, status, router])

  // Initialize active tab from URL parameters
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && ['items', 'categories', 'preview'].includes(tabParam)) {
      setActiveTab(tabParam as 'items' | 'categories' | 'preview')
    }
  }, [searchParams])

  // Update URL when active tab changes
  const handleTabChange = (tab: 'items' | 'categories' | 'preview') => {
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.push(`/admin/menu?${params.toString()}`, { scroll: false })
  }

  const fetchData = async () => {
    try {
      const [itemsRes, categoriesRes] = await Promise.all([
        fetch('/api/admin/menu/items'),
        fetch('/api/admin/menu/categories')
      ])

      if (itemsRes.ok) {
        const itemsData = await itemsRes.json()
        setMenuItems(itemsData.items || [])
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData.categories || [])
      }

      // Fetch menu activity separately
      await fetchMenuActivity()
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMenuActivity = async () => {
    try {
      setActivityLoading(true)
      const response = await fetch('/api/admin/activity?limit=5&filter=all')
      if (response.ok) {
        const data = await response.json()
        setRecentActivity(data.logs)
      }
    } catch (error) {
      console.error('Error fetching company activity:', error)
    } finally {
      setActivityLoading(false)
    }
  }

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const response = await fetch('/api/admin/menu/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newItem,
          price: newItem.price // Send raw price, let backend validate and convert
        })
      })

      if (response.ok) {
        setSuccess('Menu item created successfully!')
        setNewItem({ name: '', description: '', price: '', category: '', image: '', isAvailable: true })
        setShowCreateItem(false)
        fetchData()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to create menu item')
      }
    } catch (error) {
      setError('Failed to create menu item')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return
    
    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/menu/items/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingItem.name,
          description: editingItem.description,
          price: editingItem.price,
          category: editingItem.category,
          image: editingItem.image,
          isAvailable: editingItem.isAvailable
        })
      })

      if (response.ok) {
        setSuccess('Menu item updated successfully!')
        setEditingItem(null)
        fetchData()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to update menu item')
      }
    } catch (error) {
      setError('Failed to update menu item')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return
    
    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/menu/items/${itemId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSuccess('Menu item deleted successfully!')
        fetchData()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to delete menu item')
      }
    } catch (error) {
      setError('Failed to delete menu item')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const response = await fetch('/api/admin/menu/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory)
      })

      if (response.ok) {
        setSuccess('Category created successfully!')
        setNewCategory({ name: '', description: '' })
        setShowCreateCategory(false)
        fetchData()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to create category')
      }
    } catch (error) {
      setError('Failed to create category')
    } finally {
      setSaving(false)
    }
  }

  const handleDragEnd = async (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = categories.findIndex((category) => category.id === active.id)
      const newIndex = categories.findIndex((category) => category.id === over.id)
      
      const movedCategory = categories[oldIndex]
      const reorderedCategories = arrayMove(categories, oldIndex, newIndex)
      setCategories(reorderedCategories)

      // Update sort orders in the database and log the reordering
      try {
        const updates = reorderedCategories.map((category, index) => ({
          id: category.id,
          sortOrder: index + 1
        }))

        // Log the reordering action
        await fetch('/api/admin/menu/categories/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            movedCategoryId: movedCategory.id,
            movedCategoryName: movedCategory.name,
            oldPosition: oldIndex + 1,
            newPosition: newIndex + 1,
            reorderedCategories: updates
          })
        })

        // Update individual category sort orders
        await Promise.all(updates.map(update => 
          fetch(`/api/admin/menu/categories/${update.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sortOrder: update.sortOrder })
          })
        ))
      } catch (error) {
        console.error('Failed to update category order:', error)
        // Revert the local state if the update fails
        fetchData()
      }
    }
  }

  const handleMenuItemDragEnd = async (event: any, categoryName: string) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const categoryItems = menuItems.filter(item => item.category === categoryName && item.isAvailable)
      const oldIndex = categoryItems.findIndex((item) => item.id === active.id)
      const newIndex = categoryItems.findIndex((item) => item.id === over.id)
      
      const movedItem = categoryItems[oldIndex]
      const reorderedItems = arrayMove(categoryItems, oldIndex, newIndex)
      
      // Update local state
      const updatedMenuItems = menuItems.map(item => {
        if (item.category === categoryName) {
          const newItemIndex = reorderedItems.findIndex(ri => ri.id === item.id)
          if (newItemIndex !== -1) {
            return { ...item, sortOrder: newItemIndex + 1 }
          }
        }
        return item
      })
      setMenuItems(updatedMenuItems)

      // Update sort orders in the database and log the reordering
      try {
        const updates = reorderedItems.map((item, index) => ({
          id: item.id,
          sortOrder: index + 1
        }))

        // Log the reordering action
        await fetch('/api/admin/menu/items/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            movedItemId: movedItem.id,
            movedItemName: movedItem.name,
            category: categoryName,
            oldPosition: oldIndex + 1,
            newPosition: newIndex + 1,
            reorderedItems: updates
          })
        })

        // Update individual item sort orders
        await Promise.all(updates.map(update => 
          fetch(`/api/admin/menu/items/${update.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sortOrder: update.sortOrder })
          })
        ))
      } catch (error) {
        console.error('Failed to update menu item order:', error)
        // Revert the local state if the update fails
        fetchData()
      }
    }
  }

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory) return
    
    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/menu/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCategory)
      })

      if (response.ok) {
        setSuccess('Category updated successfully!')
        setEditingCategory(null)
        fetchData()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update category')
      }
    } catch (error) {
      setError('Failed to update category')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return
    }

    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/menu/categories/${categoryId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSuccess('Category deleted successfully!')
        fetchData()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to delete category')
      }
    } catch (error) {
      setError('Failed to delete category')
    } finally {
      setSaving(false)
    }
  }

  const toggleItemAvailability = async (item: MenuItem) => {
    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/menu/items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isAvailable: !item.isAvailable
        })
      })

      if (response.ok) {
        setSuccess(`Menu item ${!item.isAvailable ? 'enabled' : 'disabled'} successfully!`)
        fetchData()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to update menu item availability')
      }
    } catch (error) {
      setError('Failed to update menu item availability')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSubNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-600">Manage your menu items, categories, and preview</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800">{error}</div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-green-800">{success}</div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'items', name: 'Menu Items', count: menuItems.length },
                { id: 'categories', name: 'Categories', count: categories.length },
                { id: 'preview', name: 'Preview', count: null }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                  {tab.count !== null && (
                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      activeTab === tab.id ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Menu Items Tab */}
        {activeTab === 'items' && (
          <div className="space-y-6">
            {/* Create Item Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Menu Items</h2>
              <button
                onClick={() => setShowCreateItem(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Add Menu Item
              </button>
            </div>

            {/* Create Item Form */}
            {showCreateItem && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Menu Item</h3>
                <form onSubmit={handleCreateItem} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Item Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price *
                      </label>
                      <input
                        type="text"
                        required
                        value={newItem.price}
                        onChange={(e) => {
                          // Only allow numbers, commas, and decimals
                          const value = e.target.value.replace(/[^0-9.,]/g, '')
                          setNewItem({ ...newItem, price: value })
                        }}
                        placeholder="10.99"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        required
                        value={newItem.category}
                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500"
                      >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image URL
                      </label>
                      <input
                        type="url"
                        value={newItem.image}
                        onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newItem.isAvailable}
                      onChange={(e) => setNewItem({ ...newItem, isAvailable: e.target.checked })}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <label className="text-sm text-gray-700">Available for ordering</label>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {saving ? 'Creating...' : 'Create Item'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateItem(false)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Edit Item Form */}
            {editingItem && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Menu Item</h3>
                <form onSubmit={handleUpdateItem} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Item Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingItem.name}
                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingItem.price.toString()}
                        onChange={(e) => {
                          // Only allow numbers, commas, and decimals
                          const value = e.target.value.replace(/[^0-9.,]/g, '')
                          setEditingItem({ ...editingItem, price: parseFloat(value) || 0 })
                        }}
                        placeholder="10.99"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        required
                        value={editingItem.category}
                        onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                      >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image URL
                      </label>
                      <input
                        type="url"
                        value={editingItem.image || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editingItem.description}
                      onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editingItem.isAvailable}
                      onChange={(e) => setEditingItem({ ...editingItem, isAvailable: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label className="text-sm text-gray-700">Available for ordering</label>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {saving ? 'Updating...' : 'Update Item'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Menu Items List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">All Menu Items</h3>
                  <div className="text-sm text-gray-500">
                    {processedMenuItems.length} of {menuItems.length} items
                  </div>
                </div>
                
                {/* Filtering and Sorting Controls */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Search */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.name}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as 'all' | 'available' | 'unavailable')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="all">All Status</option>
                      <option value="available">Available</option>
                      <option value="unavailable">Unavailable</option>
                    </select>
                  </div>
                  
                  {/* Sort Controls */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort</label>
                    <div className="flex gap-1">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'name' | 'category' | 'price' | 'createdAt')}
                        className="flex-1 px-2 py-2 border border-gray-300 rounded-l-md text-sm text-gray-900 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="name">Name</option>
                        <option value="category">Category</option>
                        <option value="price">Price</option>
                        <option value="createdAt">Created</option>
                      </select>
                      <button
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="px-2 py-2 border border-gray-300 rounded-r-md text-sm text-gray-900 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-green-500"
                        title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                      >
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {processedMenuItems.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || filterCategory !== 'all' || filterStatus !== 'all' 
                      ? 'No items match your filters' 
                      : 'No menu items found'
                    }
                  </div>
                ) : (
                  processedMenuItems.map((item) => (
                    <div key={item.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          {/* Item Image */}
                          <div className="flex-shrink-0">
                            {item.image ? (
                              <img className="h-12 w-12 rounded-lg object-cover" src={item.image} alt={item.name} />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          {/* Item Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-sm font-medium text-gray-900 truncate">{item.name}</h3>
                              <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                                item.isAvailable 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {item.isAvailable ? 'Available' : 'Unavailable'}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                              <span>{item.category}</span>
                              <span>•</span>
                              <span className="font-medium text-gray-900">${item.price.toFixed(2)}</span>
                            </div>
                            {item.description && (
                              <p className="mt-1 text-sm text-gray-600 truncate">{item.description}</p>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                            title="Edit"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => toggleItemAvailability(item)}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                              item.isAvailable 
                                ? 'text-orange-700 bg-orange-100 hover:bg-orange-200' 
                                : 'text-green-700 bg-green-100 hover:bg-green-200'
                            }`}
                            title={item.isAvailable ? 'Disable' : 'Enable'}
                          >
                            {item.isAvailable ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
                            title="Delete"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Menu Categories</h2>
              <button
                onClick={() => setShowCreateCategory(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Add Category
              </button>
            </div>

            {/* Create Category Form */}
            {showCreateCategory && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Add New Category</h3>
                <form onSubmit={handleCreateCategory} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500"
                    />
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {saving ? 'Creating...' : 'Create Category'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateCategory(false)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Edit Category Form */}
            {editingCategory && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Category</h3>
                <form onSubmit={handleUpdateCategory} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editingCategory.description}
                      onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                    />
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {saving ? 'Updating...' : 'Update Category'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCategory(null)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Categories List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">All Categories</h3>
                <p className="text-sm text-gray-500 mt-1">Drag and drop to reorder categories</p>
              </div>
              <div className="divide-y divide-gray-200">
                {categories.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500">
                    No categories found
                  </div>
                ) : (
                  categories.map((category) => (
                    <div key={category.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          {/* Category Icon */}
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                            </div>
                          </div>
                          
                          {/* Category Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 truncate">{category.name}</h3>
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                              <span>{menuItems.filter(item => item.category === category.name).length} items</span>
                            </div>
                            {category.description && (
                              <p className="mt-1 text-sm text-gray-600 truncate">{category.description}</p>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setEditingCategory(category)}
                            className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                            title="Edit"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
                            title="Delete"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Menu Preview</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 mb-4">This is how your menu will appear to customers. Drag items within each category to reorder them:</p>
              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Menu</h3>
                {categories.map((category) => {
                  const categoryItems = menuItems
                    .filter(item => item.category === category.name && item.isAvailable)
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                  
                  if (categoryItems.length === 0) return null
                  
                  return (
                    <div key={category.id} className="mb-8">
                      <h4 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                        {category.name}
                      </h4>
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(event) => handleMenuItemDragEnd(event, category.name)}
                      >
                        <SortableContext
                          items={categoryItems.map(item => item.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-3">
                            {categoryItems.map((item) => (
                              <SortableMenuItem key={item.id} item={item} category={category.name} />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Company Activity</h2>
              <button 
                onClick={fetchMenuActivity}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
          <div className="p-6">
            {activityLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="animate-pulse bg-gray-200 w-8 h-8 rounded-full"></div>
                    <div className="flex-1">
                      <div className="animate-pulse bg-gray-200 h-4 w-3/4 rounded mb-2"></div>
                      <div className="animate-pulse bg-gray-200 h-3 w-1/2 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((log) => {
                  const timezone = log.site?.timezone || getCompanyTimezone()
                  const relativeTime = getRelativeTime(log.timestamp, timezone)
                  const fullTime = formatTimeInTimezone(log.timestamp, timezone)
                  
                  return (
                    <div key={log.id} className="flex items-center space-x-4 group hover:bg-gray-50 p-3 rounded-lg transition-colors">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      log.resource === 'site_settings' ? 'bg-indigo-100' :
                      log.resource === 'business_hours' ? 'bg-green-100' :
                      log.resource === 'special_day' ? 'bg-yellow-100' :
                      log.resource === 'menu' ? 'bg-blue-100' :
                      log.resource === 'menu_category' ? 'bg-indigo-100' :
                      log.resource === 'specials' ? 'bg-orange-100' :
                      log.resource === 'events' ? 'bg-purple-100' :
                      'bg-gray-100'
                    }`}>
                      <span className={`text-sm ${
                        log.resource === 'site_settings' ? 'text-indigo-600' :
                        log.resource === 'business_hours' ? 'text-green-600' :
                        log.resource === 'special_day' ? 'text-yellow-600' :
                        log.resource === 'menu' ? 'text-blue-600' :
                        log.resource === 'menu_category' ? 'text-indigo-600' :
                        log.resource === 'specials' ? 'text-orange-600' :
                        log.resource === 'events' ? 'text-purple-600' :
                        'text-gray-600'
                      }`}>
                        {log.resource === 'site_settings' ? '⚙️' :
                         log.resource === 'business_hours' ? '🕒' :
                         log.resource === 'special_day' ? '📅' :
                         log.resource === 'menu' ? '📝' :
                         log.resource === 'menu_category' ? '📂' :
                         log.resource === 'specials' ? '🍽️' :
                         log.resource === 'events' ? '🎉' :
                         '📄'}
                      </span>
                    </div>
                  </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{log.user.name || log.user.email}</span>
                          {' '}
                          <span className="lowercase">{log.action.toLowerCase() === 'update' ? 'updated' : log.action.toLowerCase()}</span>
                          {' '}
                            <span className="font-medium capitalize">
                          {log.resource === 'site_settings' ? 'Company Info' : log.resource.replace('_', ' ')}
                        </span>
                        </p>
                        
                        {/* Show specific changes if available */}
                        {log.changes && Object.keys(log.changes).length > 0 && (
                          <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded border">
                            <div className="font-medium text-gray-700 mb-1">Changes:</div>
                            {Object.entries(log.changes).map(([key, value]) => {
                              // Try to show before/after if we have oldValue data
                              const oldValue = log.oldValue && typeof log.oldValue === 'object' ? log.oldValue[key] : null
                              const newValue = value
                              
                          // Skip if values are the same (no actual change)
                          if (oldValue && oldValue === newValue) {
                            return null
                          }
                          
                          // Handle business hours format (single object with all days)
                          if (key === 'businessHours' && typeof value === 'object' && value !== null && !('old' in value) && !('new' in value)) {
                            const oldBusinessHours = log.oldValue && typeof log.oldValue === 'object' && log.oldValue !== null ? log.oldValue[key] : null
                            
                            if (!oldBusinessHours || typeof oldBusinessHours !== 'object') {
                              return null
                            }
                            
                            // Find days that actually changed
                            const changedDays = Object.entries(value).filter(([day, newDayHours]) => {
                              const oldDayHours = (oldBusinessHours as any)[day]
                              return !oldDayHours || JSON.stringify(oldDayHours) !== JSON.stringify(newDayHours)
                            })
                            
                            if (changedDays.length === 0) {
                              return null
                            }
                            
                            return (
                              <div key={key} className="mb-2">
                                <div className="font-medium text-gray-700 mb-1">Business Hours:</div>
                                {changedDays.map(([day, newDayHours]) => {
                                  const oldDayHours = (oldBusinessHours as any)[day]
                                  const dayName = day.charAt(0).toUpperCase() + day.slice(1)
                                  
                                  // Format hours for display
                                  const formatHours = (hours: any) => {
                                    if (!hours || typeof hours !== 'object') return 'No data'
                                    if (hours.closed) return 'Closed'
                                    if (!hours.open || !hours.close) return 'No hours set'
                                    return `${hours.open} - ${hours.close}`
                                  }
                                  
                                  const oldFormatted = formatHours(oldDayHours)
                                  const newFormatted = formatHours(newDayHours)
                                  
                                  return (
                                    <div key={day} className="ml-2 text-gray-600 mb-1">
                                      <span className="font-medium">{dayName}:</span>
                                      <div className="flex items-center space-x-2 ml-2">
                                        <span className="text-red-600 line-through text-xs bg-red-50 px-1 rounded">
                                          {oldFormatted}
                                        </span>
                                        <span className="text-gray-400 text-xs">→</span>
                                        <span className="text-green-600 font-medium text-xs bg-green-50 px-1 rounded">
                                          {newFormatted}
                                        </span>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            )
                          }
                          
                          // Handle menu item formatting
                              if (log.resource === 'menu' && key === 'price') {
                                const oldPrice = oldValue ? `$${oldValue.toFixed(2)}` : 'No price'
                                const newPrice = typeof newValue === 'number' ? `$${newValue.toFixed(2)}` : 'No price'
                                
                                return (
                                  <div key={key} className="flex items-start space-x-2 mb-1">
                                    <span className="font-medium text-gray-700 min-w-0 flex-shrink-0">
                                      Price:
                                    </span>
                                    <div className="text-gray-500 break-words">
                                      <div className="flex items-center space-x-2">
                                        <span className="text-red-600 line-through text-xs bg-red-50 px-1 rounded">
                                          {oldPrice}
                                        </span>
                                        <span className="text-gray-400 text-xs">→</span>
                                        <span className="text-green-600 font-medium text-xs bg-green-50 px-1 rounded">
                                          {newPrice}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )
                              }
                              
                              if (log.resource === 'menu' && key === 'isAvailable') {
                                const oldStatus = oldValue ? 'Available' : 'Unavailable'
                                const newStatus = newValue ? 'Available' : 'Unavailable'
                                
                                return (
                                  <div key={key} className="flex items-start space-x-2 mb-1">
                                    <span className="font-medium text-gray-700 min-w-0 flex-shrink-0">
                                      Status:
                                    </span>
                                    <div className="text-gray-500 break-words">
                                      <div className="flex items-center space-x-2">
                                        <span className={`line-through text-xs px-1 rounded ${
                                          oldValue ? 'text-red-600 bg-red-50' : 'text-gray-600 bg-gray-50'
                                        }`}>
                                          {oldStatus}
                                        </span>
                                        <span className="text-gray-400 text-xs">→</span>
                                        <span className={`font-medium text-xs px-1 rounded ${
                                          newValue ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                                        }`}>
                                          {newStatus}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )
                              }
                              
                              return (
                                <div key={key} className="flex items-start space-x-2 mb-1">
                                  <span className="font-medium text-gray-700 min-w-0 flex-shrink-0">
                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                                  </span>
                                  <div className="text-gray-500 break-words">
                                    {oldValue && oldValue !== newValue ? (
                                      <div className="flex items-center space-x-2">
                                        <span className="text-red-600 line-through text-xs bg-red-50 px-1 rounded">
                                          {String(oldValue)}
                                        </span>
                                        <span className="text-gray-400 text-xs">→</span>
                                        <span className="text-green-600 font-medium text-xs bg-green-50 px-1 rounded">
                                          {String(newValue)}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-xs">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                                    )}
                                  </div>
                                </div>
                              )
                            }).filter(Boolean)}
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                          <span title={`${fullTime} (${timezone})`}>{relativeTime}</span>
                          <span>•</span>
                          <span>{timezone}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="mt-2 text-sm text-gray-500">No company activity found.</p>
                <p className="text-xs text-gray-400">Changes to company settings will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}