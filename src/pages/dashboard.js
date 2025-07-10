import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useFeedback } from '@/context/FeedbackContext';
import { useRouter } from 'next/router';

const AdminListingRow = React.memo(
  ({
    listing,
    isEditing,
    editData,
    onEditChange,
    onStartEdit,
    onCancelEdit,
    onSaveEdit,
    onAction,
  }) => {
    return (
      <tr className="border-t">
        <td className="p-3">
          {isEditing ? (
            <input
              value={editData.title}
              onChange={(e) =>
                onEditChange({ ...editData, title: e.target.value })
              }
              className="border px-2 py-1 rounded w-full"
            />
          ) : (
            listing.title
          )}
        </td>
        <td className="p-3">
          {isEditing ? (
            <input
              value={editData.price}
              onChange={(e) =>
                onEditChange({ ...editData, price: e.target.value })
              }
              className="border px-2 py-1 rounded w-full"
            />
          ) : (
            listing.price
          )}
        </td>
        <td className="p-3 capitalize">{listing.status}</td>
        <td className="p-3 space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={onSaveEdit}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Save
              </button>
              <button
                onClick={onCancelEdit}
                className="bg-gray-300 px-3 py-1 rounded"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onAction(listing.id, 'approve')}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Approve
              </button>
              <button
                onClick={() => onAction(listing.id, 'reject')}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Reject
              </button>
              <button
                onClick={() => onStartEdit(listing)}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
            </>
          )}
        </td>
      </tr>
    );
  }
);

AdminListingRow.displayName = 'AdminListingRow';

export default function DashboardPage({ initialListings }) {
  const { isAuthenticated, user } = useAuth();
  const { showMessage } = useFeedback();
  const router = useRouter();

  const [listings, setListings] = useState(initialListings);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [originalData, setOriginalData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const listingsPerPage = 5;

  useEffect(() => {
    if (!isAuthenticated) router.push('/');
  }, [isAuthenticated, router]);

  const filteredListings = useMemo(() => {
    return listings
      .filter((item) => filter === 'all' || item.status === filter)
      .filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase())
      );
  }, [listings, filter, search]);

  const totalPages = Math.ceil(filteredListings.length / listingsPerPage);
  const paginatedListings = useMemo(() => {
    const start = (currentPage - 1) * listingsPerPage;
    return filteredListings.slice(start, start + listingsPerPage);
  }, [filteredListings, currentPage]);

  const onEditChange = useCallback((data) => setEditData(data), []);

  const onStartEdit = useCallback((listing) => {
    setEditingId(listing.id);
    setEditData({ ...listing });
    setOriginalData({ ...listing });
  }, []);

  const onCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditData({});
    setOriginalData(null);
  }, []);

  const onSaveEdit = async () => {
    if (
      originalData &&
      originalData.title === editData.title.trim() &&
      originalData.price === editData.price.trim()
    ) {
      showMessage('No changes made');
      onCancelEdit();
      return;
    }

    try {
      const res = await fetch('/api/listings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editData,
          performed_by: user?.name || 'Admin',
        }),
      });

      if (!res.ok) throw new Error();
      const updated = await res.json();

      setListings((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      showMessage('Listing updated successfully');
      onCancelEdit();
    } catch {
      showMessage('Failed to save listing');
    }
  };

  const onAction = async (id, action) => {
    try {
      const res = await fetch('/api/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          action,
          performed_by: user?.name || 'Admin',
        }),
      });

      if (!res.ok) throw new Error();
      const updated = await res.json();

      setListings((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
      showMessage(`Listing ${action}d successfully`);
    } catch {
      showMessage('Failed to update listing');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4 items-center">
          <div>
            <label className="mr-2 font-medium">Filter by status:</label>
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="border px-2 py-1 rounded"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by title..."
            className="border px-2 py-1 rounded w-64"
          />
        </div>
        <Link href="/audit-trail" legacyBehavior>
          <a className="text-blue-600 underline">View Audit Trail</a>
        </Link>
      </div>

      <table className="min-w-full bg-white rounded shadow overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-3">Title</th>
            <th className="text-left p-3">Price</th>
            <th className="text-left p-3">Status</th>
            <th className="text-left p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedListings.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center py-6 text-gray-500">
                No listings found.
              </td>
            </tr>
          ) : (
            paginatedListings.map((listing) => (
              <AdminListingRow
                key={listing.id}
                listing={listing}
                isEditing={editingId === listing.id}
                editData={editData}
                onEditChange={onEditChange}
                onStartEdit={onStartEdit}
                onCancelEdit={onCancelEdit}
                onSaveEdit={onSaveEdit}
                onAction={onAction}
              />
            ))
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx + 1)}
              className={`px-3 py-1 border rounded ${
                currentPage === idx + 1 ? 'bg-blue-500 text-white' : ''
              }`}
            >
              {idx + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps() {
  try {
    const res = await fetch('http://localhost:3000/api/listings');
    const data = await res.json();
    return { props: { initialListings: data } };
  } catch (error) {
    console.error('Failed to fetch listings:', error);
    return { props: { initialListings: [] } };
  }
}
