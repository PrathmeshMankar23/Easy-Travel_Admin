'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: ''
  });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('adminUser');
    
    if (!token) {
      router.push('/login');
      return;
    }

    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({
        name: parsedUser.name || '',
        email: parsedUser.email || '',
        phone: parsedUser.phone || '+91 98765 43210',
        role: parsedUser.role || 'Administrator',
        department: parsedUser.department || 'Travel Management'
      });
    }
    
    setIsLoading(false);
  }, [router]);

  const handleSaveProfile = () => {
    const updatedUser = {
      ...user,
      ...formData
    };
    
    localStorage.setItem('adminUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setEditMode(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
          <p className="text-secondary animate-pulse">Loading Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary min-h-screen">
      <Navigation />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Profile</h1>
          <p className="mt-2 text-secondary">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="p-6 text-center">
                <div className="mx-auto h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <svg className="h-12 w-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-primary">{user?.name}</h3>
                <p className="text-sm text-secondary">{user?.email}</p>
                <div className="mt-4">
                  <span className="status-active">
                    {formData.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="card mt-6">
              <div className="p-6">
                <h4 className="text-sm font-medium text-primary mb-4">Account Activity</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-secondary">Member Since</span>
                    <span className="text-sm font-medium text-primary">Jan 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-secondary">Last Login</span>
                    <span className="text-sm font-medium text-primary">Today</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-secondary">Status</span>
                    <span className="text-sm font-medium text-green-600">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-header">
                <div className="flex justify-between items-center w-full">
                  <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
                  {!editMode && (
                    <button
                      onClick={() => setEditMode(true)}
                      className="btn btn-primary btn-sm"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
              <div className="card-body">
                {editMode ? (
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="form-label">Full Name</label>
                        <input
                          type="text"
                          className="form-input"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="form-label">Email Address</label>
                        <input
                          type="email"
                          className="form-input"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="form-label">Phone Number</label>
                        <input
                          type="tel"
                          className="form-input"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="form-label">Role</label>
                        <select
                          className="form-input"
                          value={formData.role}
                          onChange={(e) => setFormData({...formData, role: e.target.value})}
                        >
                          <option value="Administrator">Administrator</option>
                          <option value="Manager">Manager</option>
                          <option value="Editor">Editor</option>
                          <option value="Viewer">Viewer</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="form-label">Department</label>
                        <input
                          type="text"
                          className="form-input"
                          value={formData.department}
                          onChange={(e) => setFormData({...formData, department: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                      <button
                        type="button"
                        onClick={handleSaveProfile}
                        className="btn btn-primary"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Full Name</h4>
                        <p className="mt-1 text-sm text-gray-900">{formData.name}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Email Address</h4>
                        <p className="mt-1 text-sm text-gray-900">{formData.email}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Phone Number</h4>
                        <p className="mt-1 text-sm text-gray-900">{formData.phone}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Role</h4>
                        <p className="mt-1 text-sm text-gray-900">{formData.role}</p>
                      </div>
                      <div className="md:col-span-2">
                        <h4 className="text-sm font-medium text-gray-500">Department</h4>
                        <p className="mt-1 text-sm text-gray-900">{formData.department}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
