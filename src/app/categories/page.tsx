'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/utils/api';

interface Category {
  id: string;
  name: string;
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
  isActive: boolean;
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
    try {
      setIsLoading(true);
      let cats: Category[] = [];
      let dests: DestinationForCategory[] = [];
      let apiCallFailed = false;

      // 1. Fetch Data
      try {
        const [catsRes, destsRes] = await Promise.all([
          api.getCategories(),
          api.getDestinations()
        ]);
        cats = Array.isArray(catsRes) ? catsRes : [];
        dests = Array.isArray(destsRes) ? destsRes : [];
        console.log('✅ API Raw Categories:', cats);
        console.log('✅ API Raw Destinations:', dests);
      } catch (err) {
        console.error('❌ API Failed:', err);
        apiCallFailed = true;
      }

      // 2. Fallback to cache if API failed
      if (apiCallFailed || (cats.length === 0 && dests.length === 0)) {
        const cachedCats = localStorage.getItem('cachedCategories');
        const cachedDests = localStorage.getItem('cachedDestinations');
        if (cachedCats) cats = JSON.parse(cachedCats);
        if (cachedDests) dests = JSON.parse(cachedDests);
      }

      // 3. Process Counts with Strict Type Normalization
      const processedCategories = cats.map(category => {
        // Filter destinations belonging to this category
        const matchingDestinations = dests.filter(dest => {
          if (!dest.categoryId || !category.id) return false;
          
          // Normalize IDs: convert to string, trim whitespace, and lowercase
          const dId = String(dest.categoryId).trim().toLowerCase();
          const cId = String(category.id).trim().toLowerCase();
          
          return dId === cId;
        });

        console.log(`Matching: Category "${category.name}" [${category.id}] found ${matchingDestinations.length} destinations.`);

        return {
          ...category,
          _count: {
            destinations: matchingDestinations.length
          }
        };
      });

      setCategories(processedCategories);
      setApiError(apiCallFailed ? 'Connection error. Showing cached data.' : '');
    } catch (e: any) {
      setApiError('Critical error: ' + e.message);
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

  // Actions
  const handleAddCategory = async () => {
    if (!formData.name.trim()) return;
    try {
      await api.createCategory(formData);
      setShowAddModal(false);
      setFormData({ name: '', isActive: true });
      loadCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to create');
    }
  };

  const handleEditCategory = async () => {
    if (!selectedCategory) return;
    try {
      await api.updateCategory(selectedCategory.id, formData);
      setShowEditModal(false);
      loadCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to update');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api.deleteCategory(id);
      loadCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
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
    const allDests = await api.getDestinations();
    const filtered = allDests.filter((d: any) => 
      String(d.categoryId).trim().toLowerCase() === String(category.id).trim().toLowerCase()
    );
    setDestinationsInModal(filtered);
  };

  const changeDestinationCategory = async (dest: DestinationForCategory, newCategoryId: string) => {
    try {
      await api.updateDestination(dest.id, { ...dest, categoryId: newCategoryId });
      const allDests = await api.getDestinations();
      setDestinationsInModal(allDests.filter((d: any) => 
        String(d.categoryId).trim().toLowerCase() === String(selectedCategory?.id).trim().toLowerCase()
      ));
      loadCategories();
    } catch (e) {
      alert("Update failed");
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500">Manage your travel destination types</p>
        </div>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm flex items-center gap-2" 
          onClick={() => setShowAddModal(true)}
        >
          <span>+</span> Add Category
        </button>
      </div>

      {apiError && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
          <p><strong>Status:</strong> {apiError}</p>
          <button onClick={loadCategories} className="underline font-medium">Retry</button>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500">Syncing destinations...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${category.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">{category.name}</h3>
              
              <div className="flex items-center text-gray-500 mb-8 bg-gray-50 p-3 rounded-lg">
                <span className="text-xl mr-2">📍</span>
                <span className="font-medium text-gray-700">{category._count?.destinations || 0}</span>
                <span className="ml-1 text-sm">Destinations linked</span>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t pt-4">
                <button onClick={() => openEditModal(category)} className="btn-edit-category">Edit</button>
                <button onClick={() => openItineraryModal(category)} className="btn-view-category">View</button>
                <button onClick={() => handleDeleteCategory(category.id)} className="btn-delete-category">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- MODALS --- */}

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">New Category</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category Name</label>
                <input
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Luxury Travel"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer p-2">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                  checked={formData.isActive} 
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} 
                />
                <span className="text-gray-700 font-medium">Visible on website</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setShowAddModal(false)} className="px-5 py-2.5 text-gray-500 font-semibold hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
              <button onClick={handleAddCategory} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-md transition-all">Create Category</button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW DESTINATIONS MODAL */}
      {showItineraryModal && selectedCategory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{selectedCategory.name}</h2>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                {destinationsInModal.length} Total
              </span>
            </div>
            
            <div className="overflow-y-auto flex-1 pr-2">
              {destinationsInModal.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-400">No destinations found in this category.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {destinationsInModal.map((dest) => (
                    <div key={dest.id} className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-xl hover:border-blue-200 transition-colors shadow-sm">
                      <span className="font-bold text-gray-700">{dest.title}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 font-semibold uppercase">Move to:</span>
                        <select
                          value={dest.categoryId}
                          onChange={(e) => changeDestinationCategory(dest, e.target.value)}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button 
              onClick={() => setShowItineraryModal(false)} 
              className="mt-8 w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedCategory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Edit Category</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category Name</label>
                <input
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer p-2">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded border-gray-300 text-blue-600" 
                  checked={formData.isActive} 
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} 
                />
                <span className="text-gray-700 font-medium">Category Active</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setShowEditModal(false)} className="px-5 py-2.5 text-gray-500 font-semibold">Cancel</button>
              <button onClick={handleEditCategory} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}