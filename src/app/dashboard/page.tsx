'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/utils/api';

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
}

interface RecentActivity {
  id: string;
  type: 'destination' | 'category';
  action: 'created' | 'updated' | 'deleted';
  title: string;
  timestamp: string;
  user?: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalDestinations: 0,
    totalCategories: 0
  });

  const [isLoading, setIsLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  const router = useRouter();

  // Helper function to format time ago
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return past.toLocaleDateString();
  };

  // =================================
  // LOAD DATA FROM API
  // =================================

  const loadData = useCallback(async () => {
    try {
      // Load real data from API
      const [categories, destinations] = await Promise.all([
        api.getCategories(),
        api.getDestinations()
      ]);

      // Try to get enquiries separately, but don't fail if it doesn't work
      let enquiries = [];
      try {
        enquiries = await api.getEnquiries();
      } catch (enquiryError) {
        console.warn('Enquiries endpoint not available:', enquiryError);
        enquiries = [];
      }

      setStats({
        totalDestinations: Array.isArray(destinations) ? destinations.length : 0,
        totalCategories: Array.isArray(categories) ? categories.length : 0
      });

      // Load real activities from localStorage
      const storedActivities = localStorage.getItem('recentActivities');
      console.log('Stored activities from localStorage:', storedActivities);
      const activities = storedActivities ? JSON.parse(storedActivities) : [];
      console.log('Parsed activities:', activities);
      setRecentActivities(activities);
    } catch (error: any) {
      console.error('Dashboard loading error:', error);
      setStats({
        totalDestinations: 0,
        totalCategories: 0
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // =================================
  // INIT
  // =================================

  useEffect(() => {
    const token = localStorage.getItem('adminToken');

    if (!token) {
      router.push('/login');
      return;
    }

    loadData();
  }, [loadData, router]);

  // =================================
  // UI (UNCHANGED)
  // =================================

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
          <p className="text-secondary animate-pulse">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome to your Easy Travels Admin Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Destinations Card */}
        <button
          onClick={() => router.push('/destinations')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 text-left p-6 group"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Destinations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDestinations}</p>
            </div>
          </div>
        </button>

        {/* Categories Card */}
        <button
          onClick={() => router.push('/categories')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 text-left p-6 group"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center group-hover:bg-green-600 transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCategories}</p>
            </div>
          </div>
        </button>

        {/* Quick Actions Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/destinations')}
              className="flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Destination
            </button>
            <button
              onClick={() => router.push('/categories')}
              className="flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Category
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        
        {recentActivities.length > 0 ? (
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.action === 'created' ? 'bg-green-500' :
                    activity.action === 'updated' ? 'bg-blue-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {activity.action === 'created' ? 'Created' :
                         activity.action === 'updated' ? 'Updated' : 'Deleted'}{' '}
                        {activity.type === 'destination' ? 'Destination' : 'Category'}
                      </span>
                      <span className="text-sm text-gray-600">"{activity.title}"</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {activity.user} • {formatTimeAgo(activity.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No recent activity found</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
