'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { api } from '@/utils/api';

interface Category {
  id: string;
  name: string;
  slug?: string;
  isActive: boolean;
  _count?: {
    destinations?: number;
    itineraries?: number;
  };
}

interface DestinationForCategory {
  id: string;
  title: string;
  categoryId: string;
  [key: string]: any;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [destinationsInModal, setDestinationsInModal] = useState<DestinationForCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showItineraryModal, setShowItineraryModal] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', isActive: true });
  const router = useRouter();

  const loadCategories = useCallback(async () => {
    setApiError('');
    try {
      const data = await api.getCategories();
      const mappedCategories = Array.isArray(data) ? data : [];
      setCategories(mappedCategories);
    } catch (e: any) {
      setApiError(e?.message || 'Failed to load categories');
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
      return;
    }
    loadCategories();
  }, [router, loadCategories]);

  const handleAddCategory = async () => {
    if (!formData.name.trim()) return;
    setApiError('');
    try {
      await api.createCategory({ name: formData.name.trim(), isActive: formData.isActive });
      
      // Emit activity for creation
      window.dispatchEvent(new CustomEvent('storage-updated', {
        detail: { 
          type: 'activity', 
          data: {
            action: 'added',
            type: 'category',
            title: formData.name.trim(),
            description: `Added new category: ${formData.name.trim()}`,
            timestamp: new Date()
          }
        }
      }));
      
      setFormData({ name: '', isActive: true });
      setShowAddModal(false);
      await loadCategories();
    } catch (e: any) {
      setApiError(e?.message || 'Failed to add category');
    }
  };

  const handleEditCategory = async () => {
    if (!selectedCategory || !formData.name.trim()) return;
    setApiError('');
    try {
      await api.updateCategory(selectedCategory.id, { name: formData.name.trim(), isActive: formData.isActive });
      
      // Emit activity for update
      window.dispatchEvent(new CustomEvent('storage-updated', {
        detail: { 
          type: 'activity', 
          data: {
            action: 'updated',
            type: 'category',
            title: formData.name.trim(),
            description: `Updated category: ${formData.name.trim()}`,
            timestamp: new Date()
          }
        }
      }));
      
      setShowEditModal(false);
      setSelectedCategory(null);
      setFormData({ name: '', isActive: true });
      await loadCategories();
    } catch (e: any) {
      setApiError(e?.message || 'Failed to update category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const cat = categories.find((c) => c.id === id);
    const count = cat?._count?.destinations ?? cat?._count?.itineraries ?? 0;
    if (count > 0 && !confirm(`This category has ${count} destinations. Continue deleting?`)) return;
    if (count === 0 && !confirm('Are you sure you want to delete this category?')) return;
    setApiError('');
    try {
      await api.deleteCategory(id);
      
      // Emit activity for deletion
      if (cat) {
        window.dispatchEvent(new CustomEvent('storage-updated', {
          detail: { 
            type: 'activity', 
            data: {
              action: 'deleted',
              type: 'category',
              title: cat.name,
              description: `Deleted category: ${cat.name}`,
              timestamp: new Date()
            }
          }
        }));
      }
      
      await loadCategories();
    } catch (e: any) {
      setApiError(e?.message || 'Failed to delete category');
    }
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setFormData({ name: category.name, isActive: category.isActive });
    setShowEditModal(true);
  };

  const openItineraryModal = async (category: Category) => {
    setSelectedCategory(category);
    setShowItineraryModal(true);
    setDestinationsInModal([]);
    try {
      const dests = await api.getDestinations();
      setDestinationsInModal((dests || []).filter((d: any) => d.categoryId === category.id));
    } catch {
      setDestinationsInModal([]);
    }
  };

  const changeDestinationCategory = async (destination: DestinationForCategory, newCategoryId: string) => {
    if (destination.categoryId === newCategoryId) return;
    try {
      const payload = {
        title: destination.title,
        img: destination.img,
        description: destination.description,
        price: destination.price,
        duration: destination.duration,
        groupSize: destination.groupSize || 'Up to 15',
        about: destination.about || destination.description,
        categoryId: newCategoryId,
        highlights: destination.highlights || [],
        included: destination.included || [],
        notIncluded: destination.notIncluded || [],
        itinerary: (destination.itinerary || []).map((d: any) => ({
          day: d.day,
          title: d.title,
          desc: d.desc,
          image: d.image,
          activities: d.activities || [],
        })),
      };
      await api.updateDestination(destination.id, payload);
      setDestinationsInModal((prev) =>
        prev.map((d) => (d.id === destination.id ? { ...d, categoryId: newCategoryId } : d))
      );
      await loadCategories();
    } catch (e: any) {
      alert(e?.message || 'Failed to update destination category');
    }
  };

  const getCategoryDestinations = (categoryId: string) =>
    destinationsInModal.filter((d) => d.categoryId === categoryId);
  const countLabel = (cat: Category) =>
    (cat._count?.destinations ?? cat._count?.itineraries ?? 0);

  // =================================
  // UI (UNCHANGED — your CSS intact)
  // =================================

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
          <p className="text-secondary animate-pulse">Loading Categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary min-h-screen">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {apiError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {apiError}
          </div>
        )}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary">Manage Categories</h1>
            <p className="mt-2 text-secondary">Organize your travel packages by categories</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary btn-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add New Category
          </button>
        </div>

        <div className="card">
          <div className="px-4 py-5 sm:p-6">
            {categories.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-primary">No categories</h3>
                <p className="mt-1 text-sm text-secondary">Get started by creating a new category.</p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="btn btn-primary"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    New Category
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <div key={category.id} className="card hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-primary">{category.name}</h3>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditModal(category)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit category"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete category"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className={`status-${category.isActive ? 'active' : 'inactive'}`}>
                            {category.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className="text-sm text-secondary">
                            {countLabel(category)} destinations
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => openItineraryModal(category)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        disabled={countLabel(category) === 0}
                      >
                        View destinations
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add New Category</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Adventure Tours"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>
              </form>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({ name: '', isActive: true });
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCategory}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Add Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Edit Category</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="editIsActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="editIsActive" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>
              </form>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setFormData({ name: '', isActive: true });
                    setSelectedCategory(null);
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditCategory}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Update Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Destinations in category modal */}
      {showItineraryModal && selectedCategory && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-5 mx-auto p-5 border max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl leading-6 font-bold text-gray-900">
                  Destinations in &quot;{selectedCategory.name}&quot;
                </h3>
                <button
                  onClick={() => setShowItineraryModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {getCategoryDestinations(selectedCategory.id).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No destinations in this category</p>
                  </div>
                ) : (
                  getCategoryDestinations(selectedCategory.id).map((dest) => (
                    <div key={dest.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{dest.title}</h4>
                          <p className="text-sm text-gray-500">Category: {selectedCategory.name}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <select
                            value={dest.categoryId}
                            onChange={(e) => changeDestinationCategory(dest, e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowItineraryModal(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
