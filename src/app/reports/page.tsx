'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/utils/api';

interface ReportStats {
  totalDestinations: number;
  totalCategories: number;
  activeDestinations: number;
  inactiveDestinations: number;
  activeCategories: number;
  inactiveCategories: number;
  destinationsByCategory: { categoryName: string; count: number }[];
}

export default function ReportsPage() {
  const [stats, setStats] = useState<ReportStats>({
    totalDestinations: 0,
    totalCategories: 0,
    activeDestinations: 0,
    inactiveDestinations: 0,
    activeCategories: 0,
    inactiveCategories: 0,
    destinationsByCategory: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadReportData = useCallback(async () => {
    try {
      const [destinations, categories] = await Promise.all([
        api.getDestinations(),
        api.getCategories()
      ]);

      const activeDests = destinations.filter((d: any) => d.isActive).length;
      const inactiveDests = destinations.filter((d: any) => !d.isActive).length;
      const activeCats = categories.filter((c: any) => c.isActive).length;
      const inactiveCats = categories.filter((c: any) => !c.isActive).length;

      // Count destinations by category
      const categoryCounts: { [key: string]: number } = {};
      destinations.forEach((dest: any) => {
        if (dest.category && dest.category.name) {
          categoryCounts[dest.category.name] = (categoryCounts[dest.category.name] || 0) + 1;
        }
      });

      const destinationsByCategory = Object.entries(categoryCounts).map(([name, count]) => ({
        categoryName: name,
        count
      }));

      setStats({
        totalDestinations: destinations.length,
        totalCategories: categories.length,
        activeDestinations: activeDests,
        inactiveDestinations: inactiveDests,
        activeCategories: activeCats,
        inactiveCategories: inactiveCats,
        destinationsByCategory
      });
    } catch (error: any) {
      console.error('Reports loading error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <div className="text-lg text-gray-600">Loading reports...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Business Reports</h1>
        <p className="text-gray-600 mt-2">Analytics and insights for your travel business</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Destinations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDestinations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Categories</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCategories}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Items</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeDestinations + stats.activeCategories}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inactive Items</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inactiveDestinations + stats.inactiveCategories}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Destinations Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Destinations Status</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Active Destinations</span>
              <span className="text-sm font-bold text-green-600">{stats.activeDestinations}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Inactive Destinations</span>
              <span className="text-sm font-bold text-red-600">{stats.inactiveDestinations}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${stats.totalDestinations > 0 ? (stats.activeDestinations / stats.totalDestinations) * 100 : 0}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 text-center">
              {stats.totalDestinations > 0 ? Math.round((stats.activeDestinations / stats.totalDestinations) * 100) : 0}% of destinations are active
            </p>
          </div>
        </div>

        {/* Categories Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories Status</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Active Categories</span>
              <span className="text-sm font-bold text-green-600">{stats.activeCategories}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Inactive Categories</span>
              <span className="text-sm font-bold text-red-600">{stats.inactiveCategories}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${stats.totalCategories > 0 ? (stats.activeCategories / stats.totalCategories) * 100 : 0}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 text-center">
              {stats.totalCategories > 0 ? Math.round((stats.activeCategories / stats.totalCategories) * 100) : 0}% of categories are active
            </p>
          </div>
        </div>

        {/* Destinations by Category */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Destinations by Category</h2>
          {stats.destinationsByCategory.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.destinationsByCategory.map((category, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">{category.categoryName}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Destinations:</span>
                    <span className="text-sm font-bold text-blue-600">{category.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                    <div 
                      className="bg-blue-500 h-1 rounded-full" 
                      style={{ width: `${Math.min((category.count / Math.max(...stats.destinationsByCategory.map(c => c.count))) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No destinations found in categories</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/destinations')}
            className="flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Manage Destinations
          </button>
          <button
            onClick={() => router.push('/categories')}
            className="flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Manage Categories
          </button>
          <button
            onClick={loadReportData}
            className="flex items-center justify-center px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Reports
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
