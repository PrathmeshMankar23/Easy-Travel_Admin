const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export const api = {
  // Auth endpoints
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    
    return response.json();
  },

  // Categories endpoints
  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || err.message || "Failed to fetch categories");
    }
    return response.json();
  },

  createCategory: async (categoryData: any) => {
    const token = localStorage.getItem("adminToken");
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(categoryData),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || err.message || "Failed to create category");
    }
    return response.json();
  },

  updateCategory: async (id: string, categoryData: any) => {
    const token = localStorage.getItem("adminToken");
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(categoryData),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || err.message || "Failed to update category");
    }
    return response.json();
  },

  deleteCategory: async (id: string) => {
    const token = localStorage.getItem("adminToken");
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || err.message || "Failed to delete category");
    }
    return response.json();
  },

  // Destinations endpoints
  getDestinations: async () => {
    const response = await fetch(`${API_BASE_URL}/destinations`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || err.message || "Failed to fetch destinations");
    }
    return response.json();
  },

  createDestination: async (destinationData: any) => {
    const token = localStorage.getItem("adminToken");
    const response = await fetch(`${API_BASE_URL}/destinations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(destinationData),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || err.message || "Failed to create destination");
    }
    return response.json();
  },

  updateDestination: async (id: string, destinationData: any) => {
    const token = localStorage.getItem("adminToken");
    const response = await fetch(`${API_BASE_URL}/destinations/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(destinationData),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || err.message || "Failed to update destination");
    }
    return response.json();
  },

  deleteDestination: async (id: string) => {
    const token = localStorage.getItem("adminToken");
    const response = await fetch(`${API_BASE_URL}/destinations/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || err.message || "Failed to delete destination");
    }
    return response.json();
  },

  // Enquiries endpoints
  getEnquiries: async () => {
    const token = localStorage.getItem("adminToken");
    const response = await fetch(`${API_BASE_URL}/enquiry`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || err.message || "Failed to fetch enquiries");
    }
    return response.json();
  },

  deleteEnquiry: async (id: string) => {
    const token = localStorage.getItem("adminToken");
    const response = await fetch(`${API_BASE_URL}/enquiry/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || err.message || "Failed to delete enquiry");
    }
    return response.json();
  },
};