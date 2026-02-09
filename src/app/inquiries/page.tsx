'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { api } from '@/utils/api';

interface Inquiry {
  id: string;
  name: string;
  customerName?: string;
  email: string;
  phone?: string;
  message: string;
  status: 'PENDING' | 'RESPONDED' | 'RESOLVED';
  response?: string;
  createdAt: string;
  itinerary?: { id: string; title: string };
  destination?: { id: string; title: string };
}

function mapApiToInquiry(row: any): Inquiry {
  return {
    id: row.id,
    name: row.customerName || row.name || '',
    email: row.email,
    phone: row.phone,
    message: row.message || '',
    status: 'PENDING',
    createdAt: row.createdAt,
    itinerary: row.destination ? { id: row.destination.id, title: row.destination.title } : undefined,
    destination: row.destination,
  };
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [responseText, setResponseText] = useState('');
  const [isSendingResponse, setIsSendingResponse] = useState(false);
  const [apiError, setApiError] = useState('');
  const router = useRouter();

  const loadEnquiries = useCallback(async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    setApiError('');
    try {
      const data = await api.getEnquiries();
      setInquiries((Array.isArray(data) ? data : []).map(mapApiToInquiry));
    } catch (e: any) {
      setApiError(e?.message || 'Failed to load enquiries');
      setInquiries([]);
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
    loadEnquiries();
  }, [router, loadEnquiries]);

  const handleSendResponse = async () => {
    if (!selectedInquiry || !responseText.trim()) return;
    setIsSendingResponse(true);
    // Backend does not store response text; you could add an endpoint later.
    setInquiries((prev) =>
      prev.map((inquiry) =>
        inquiry.id === selectedInquiry.id
          ? { ...inquiry, status: 'RESPONDED' as const, response: responseText }
          : inquiry
      )
    );
    setSelectedInquiry(null);
    setResponseText('');
    setIsSendingResponse(false);
    alert('Response noted. (Email reply can be done from your mail client.)');
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!confirm('Delete this enquiry?')) return;
    try {
      await api.deleteEnquiry(id);
      await loadEnquiries();
    } catch (e: any) {
      alert(e?.message || 'Failed to delete');
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'RESPONDED':
        return 'status-responded';
      case 'RESOLVED':
        return 'status-resolved';
      default:
        return 'status-default';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-primary min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Customer Inquiries</h1>
          <p className="mt-2 text-secondary">Manage and respond to customer questions</p>
        </div>

        <div className="card">
          <div className="card-body">
            {inquiries.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-primary">No inquiries</h3>
                <p className="mt-1 text-sm text-secondary">Customer inquiries will appear here.</p>
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-secondary">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                        Message
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                        Date
                      </th>
                      <th className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-primary divide-y divide-secondary">
                    {inquiries.map((inquiry) => (
                      <tr key={inquiry.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-primary">{inquiry.name}</div>
                          {inquiry.phone && (
                            <div className="text-sm text-secondary">{inquiry.phone}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-primary">{inquiry.email}</div>
                          {(inquiry.itinerary || inquiry.destination) && (
                            <div className="text-sm text-secondary">
                              Re: {(inquiry.itinerary || inquiry.destination)?.title}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-primary max-w-xs truncate">
                            {inquiry.message}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`badge ${getStatusClass(inquiry.status)}`}>
                            {inquiry.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                          {new Date(inquiry.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <button
                            onClick={() => setSelectedInquiry(inquiry)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {inquiry.status === 'PENDING' ? 'Respond' : 'View'}
                          </button>
                          <button
                            onClick={() => handleDeleteInquiry(inquiry.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Response Modal */}
      {selectedInquiry && (
        <div className="modal-overlay">
          <div className="modal-content m-5">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-primary">Customer Inquiry Details</h3>
                <button
                  onClick={() => {
                    setSelectedInquiry(null);
                    setResponseText('');
                  }}
                  className="text-tertiary hover:text-secondary"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="form-label">Customer Name</label>
                  <p className="text-sm text-primary">{selectedInquiry.name}</p>
                </div>
                
                <div>
                  <label className="form-label">Email</label>
                  <p className="text-sm text-primary">{selectedInquiry.email}</p>
                </div>
                
                {selectedInquiry.phone && (
                  <div>
                    <label className="form-label">Phone</label>
                    <p className="text-sm text-primary">{selectedInquiry.phone}</p>
                  </div>
                )}
                
                <div>
                  <label className="form-label">Message</label>
                  <p className="text-sm text-primary bg-secondary p-3 rounded">{selectedInquiry.message}</p>
                </div>
                
                {selectedInquiry.response && (
                  <div>
                    <label className="form-label">Previous Response</label>
                    <p className="text-sm text-primary bg-blue-50 p-3 rounded">{selectedInquiry.response}</p>
                  </div>
                )}
                
                {selectedInquiry.status === 'PENDING' && (
                  <div>
                    <label className="form-label">Your Response</label>
                    <textarea
                      rows={4}
                      className="form-input"
                      placeholder="Type your response here..."
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                    />
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setSelectedInquiry(null);
                    setResponseText('');
                  }}
                  className="btn btn-secondary"
                >
                  Close
                </button>
                {selectedInquiry.status === 'PENDING' && (
                  <button
                    onClick={handleSendResponse}
                    disabled={isSendingResponse || !responseText.trim()}
                    className="btn btn-primary"
                  >
                    {isSendingResponse ? 'Sending...' : 'Send Response'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
