'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { categoryStorage, itineraryStorage, initializeStorage } from '@/utils/storage';

interface Itinerary {
  id: string;
  title: string;
  description: string;
  duration: number;
  nights?: number;
  price: number;
  image?: string;
  isActive: boolean;
  category: {
    id: string;
    name: string;
  };
  highlights?: string[];
  included?: string[];
  notIncluded?: string[];
  days?: {
    title: string;
    image: string;
    description: string;
    activities: string[];
  }[];
}

interface DashboardStats {
  totalDestinations: number;
  totalCategories: number;
  totalInquiries: number;
  pendingInquiries: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalDestinations: 0,
    totalCategories: 0,
    totalInquiries: 0,
    pendingInquiries: 0,
  });
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Memoize loadStats so it can be used safely in multiple useEffects
  const loadStats = useCallback(() => {
    try {
      const itineraries = itineraryStorage.getItineraries() || [];
      const categories = categoryStorage.getCategories() || [];
      
      setStats(prev => ({
        ...prev,
        totalDestinations: itineraries.length,
        totalCategories: categories.length,
        // Inquiries are currently mocked as per your original code
      }));
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // 1. Auth Check
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/login');
      return;
    }

    // 2. Initialize Data
    initializeStorage();
    loadStats();

    // 3. Set up event listener for cross-tab or same-page updates
    const handleStorageChange = () => {
      loadStats();
    };

    window.addEventListener('storage-updated', handleStorageChange);
    // Also listen for standard storage events (for changes from other tabs)
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage-updated', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [router, loadStats]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
          <p className="text-secondary animate-pulse">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary min-h-screen">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
          <p className="mt-2 text-secondary">Welcome to your Easy Travels Admin Panel</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-8 justify-items-center">
          {/* Destinations Card */}
          <button
            onClick={() => router.push('/destinations')}
            className="card bg-white shadow-sm rounded-lg border border-gray-100 hover:shadow-lg transition-all text-left p-0 group transform scale-110 w-full max-w-md"
          >
            <div className="flex items-center p-8">
              <div className="shrink-0">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="ml-6">
                <p className="text-base font-medium text-secondary truncate">Total Destinations</p>
                <p className="text-3xl font-bold text-primary">{stats.totalDestinations}</p>
              </div>
            </div>
            <div className="px-8 pb-6">
              <p className="text-sm text-secondary group-hover:text-blue-600 transition-colors">Click to manage all destinations →</p>
            </div>
          </button>

          {/* Categories Card */}
          <button
            onClick={() => router.push('/categories')}
            className="card bg-white shadow-sm rounded-lg border border-gray-100 hover:shadow-lg transition-all text-left p-0 group transform scale-110 w-full max-w-md"
          >
            <div className="flex items-center p-8">
              <div className="shrink-0">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center group-hover:bg-green-600 transition-colors">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
              </div>
              <div className="ml-6">
                <p className="text-base font-medium text-secondary truncate">Destination Categories</p>
                <p className="text-3xl font-bold text-primary">{stats.totalCategories}</p>
              </div>
            </div>
            <div className="px-8 pb-6">
              <p className="text-sm text-secondary group-hover:text-green-600 transition-colors">Click to manage all categories →</p>
            </div>
          </button>
        </div>

        {/* Recent Itineraries */}
        <div className="card bg-white shadow-sm rounded-lg border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-primary">Recent Itineraries</h3>
          </div>
          <div className="p-6">
            {itineraries.slice(0, 6).map((itinerary) => (
              <div key={itinerary.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex flex-col md:flex-row md:items-start md:space-x-6 space-y-4 md:space-y-0">
                  {/* Itinerary Image */}
                  <div className="shrink-0">
                    {itinerary.image ? (
                      <img 
                        src={itinerary.image} 
                        alt={itinerary.title}
                        className="w-full md:w-32 h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full md:w-32 h-48 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                        <svg className="w-16 h-16 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2-2V6a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Itinerary Content */}
                  <div className="flex-1 md:ml-6">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="text-lg font-bold text-primary">{itinerary.title}</h4>
                        <div className="flex items-center space-x-2 text-sm text-secondary">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                            {itinerary.category?.name}
                          </span>
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {itinerary.duration} days / {itinerary.nights?.toString() || 9} nights
                          </span>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-primary">₹{itinerary.price}</div>
                    </div>

                    {/* Itinerary Description */}
                    <p className="text-sm text-secondary leading-relaxed line-clamp-2">
                      {itinerary.description}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={() => router.push(`/itineraries?view=${itinerary.id}`)}
                        className="btn btn-secondary flex-1 py-3"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        View
                      </button>
                      <button
                        onClick={() => router.push(`/itineraries?edit=${itinerary.id}`)}
                        className="btn btn-primary flex-1 py-3"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 0L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card bg-white shadow-sm rounded-lg border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-primary">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mr-4"></div>
                <div>
                  <p className="text-sm font-semibold text-primary">New itinerary added</p>
                  <p className="text-sm text-secondary">Switzerland Adventure package created</p>
                </div>
              </div>
              <span className="text-xs font-medium text-secondary">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full mr-4"></div>
                <div>
                  <p className="text-sm font-semibold text-primary">Category updated</p>
                  <p className="text-sm text-secondary">Adventure Tours category modified</p>
                </div>
              </div>
              <span className="text-xs font-medium text-secondary">5 hours ago</span>
            </div>
            <div className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <div className="w-2.5 h-2.5 bg-purple-500 rounded-full mr-4"></div>
                <div>
                  <p className="text-sm font-semibold text-primary">Profile settings updated</p>
                  <p className="text-sm text-secondary">Admin contact information changed</p>
                </div>
              </div>
              <span className="text-xs font-medium text-secondary">1 day ago</span>
            </div>
            <div className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full mr-4"></div>
                <div>
                  <p className="text-sm font-semibold text-primary">New category created</p>
                  <p className="text-sm text-secondary">Romantic Getaways category added</p>
                </div>
              </div>
              <span className="text-xs font-medium text-secondary">2 days ago</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}