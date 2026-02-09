'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
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
  totalInquiries: number;
  pendingInquiries: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalDestinations: 0,
    totalCategories: 0,
    totalInquiries: 0,
    pendingInquiries: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  // =================================
  // LOAD DATA FROM API
  // =================================

  const loadData = useCallback(async () => {
    try {
      // Load real data from API
      const [categories, destinations, enquiries] = await Promise.all([
        api.getCategories(),
        api.getDestinations(), 
        api.getEnquiries()
      ]);

      setStats({
        totalDestinations: Array.isArray(destinations) ? destinations.length : 0,
        totalCategories: Array.isArray(categories) ? categories.length : 0,
        totalInquiries: Array.isArray(enquiries) ? enquiries.length : 0,
        pendingInquiries: 0
      });
    } catch (error: any) {
      console.error('Dashboard loading error:', error);
      setStats({
        totalDestinations: 0,
        totalCategories: 0,
        totalInquiries: 0,
        pendingInquiries: 0
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
    <div className="bg-primary min-h-screen">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
          <p className="mt-2 text-secondary">Welcome to your Easy Travels Admin Panel</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-8">
          {/* Destinations Card */}
          <button
            onClick={() => router.push('/destinations')}
            className="bg-white shadow-sm rounded-lg border border-gray-100 hover:shadow-lg transition-all text-left p-0 group w-full max-w-md"
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
            className="bg-white shadow-sm rounded-lg border border-gray-100 hover:shadow-lg transition-all text-left p-0 group w-full max-w-md"
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
      </main>
    </div>
  );
}
