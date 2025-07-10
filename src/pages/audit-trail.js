import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import React from 'react';

const AuditRow = React.memo(function AuditRow({ log }) {
  return (
    <tr className="border-t">
      <td className="p-3">{log.listing_title}</td>
      <td className="p-3 capitalize">{log.action}</td>
      <td className="p-3 text-sm">{log.details || '-'}</td>
      <td className="p-3">{log.performed_by || 'Unknown'}</td>
      <td className="p-3 text-sm text-gray-600">
        {new Date(log.timestamp + 'Z').toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })}
      </td>
    </tr>
  );
});
AuditRow.displayName = 'AuditRow';

export default function AuditTrailPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [logs, setLogs] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 5;

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/audit');
        const data = await res.json();
        setLogs(data);
      } catch (err) {
        console.error('Failed to load audit logs', err);
      } finally {
        setDataLoading(false);
      }
    };

    if (!loading && isAuthenticated) {
      fetchLogs();
    }
  }, [loading, isAuthenticated]);

  const totalPages = Math.ceil(logs.length / logsPerPage);

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * logsPerPage;
    return logs.slice(start, start + logsPerPage);
  }, [logs, currentPage]);

  if (loading || dataLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Audit Trail</h1>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-blue-600 underline"
        >
          ← Back to Dashboard
        </button>
      </div>

      {logs.length === 0 ? (
        <p>No audit logs found.</p>
      ) : (
        <>
          <table className="min-w-full bg-white rounded shadow overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-3">Listing Title</th>
                <th className="text-left p-3">Action</th>
                <th className="text-left p-3">Details</th>
                <th className="text-left p-3">Performed By</th>
                <th className="text-left p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.map((log) => (
                <AuditRow key={log.id} log={log} />
              ))}
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
        </>
      )}
    </div>
  );
}
