import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { format } from "date-fns";

const RoomIssues = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [issueTypeFilter, setIssueTypeFilter] = useState("");
  const [formData, setFormData] = useState({
    room: "",
    issue_type: "fault",
    title: "",
    description: "",
    priority: "medium",
  });

  useEffect(() => {
    fetchData();
    fetchRooms();
    fetchSummary();
  }, [statusFilter, issueTypeFilter]);

  const fetchData = async () => {
    try {
      let url = "/api/room-issues/";
      const params = [];

      if (statusFilter) params.push(`status=${statusFilter}`);
      if (issueTypeFilter) params.push(`issue_type=${issueTypeFilter}`);

      if (params.length > 0) url += `?${params.join("&")}`;

      const response = await axios.get(url);
      setIssues(
        Array.isArray(response.data)
          ? response.data
          : response.data.results || []
      );
    } catch (error) {
      console.error("Error fetching issues:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await axios.get("/api/rooms/");
      setRooms(
        Array.isArray(response.data)
          ? response.data
          : response.data.results || []
      );
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await axios.get("/api/room-issues/summary/");
      setSummary(response.data);
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/room-issues/", formData);
      setFormData({
        room: "",
        issue_type: "fault",
        title: "",
        description: "",
        priority: "medium",
      });
      setShowForm(false);
      fetchData();
      fetchSummary();
    } catch (error) {
      console.error("Error creating issue:", error);
      alert("Error creating issue. Please try again.");
    }
  };

  const handleMarkFixed = async (issueId, notes = "") => {
    try {
      await axios.post(`/api/room-issues/${issueId}/mark_fixed/`, {
        resolution_notes: notes || "Issue resolved",
      });
      fetchData();
      fetchSummary();
    } catch (error) {
      console.error("Error marking issue as fixed:", error);
      alert("Error updating issue. Please try again.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "reported":
        return "bg-red-100 text-red-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "fixed":
        return "bg-green-100 text-green-800";
      case "resolved":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading room issues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-4 py-4 sm:py-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Room Issues & Faults
            </h1>
            <p className="mt-1 text-gray-600">
              Track and manage room issues, faults, and missing inventory
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="mt-4 sm:mt-0 inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm sm:text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {showForm ? "Cancel" : "Report Issue"}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600">Total Issues</p>
            <p className="text-2xl font-bold text-gray-900">
              {summary.total_issues}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-red-500">
            <p className="text-sm text-gray-600">Unresolved</p>
            <p className="text-2xl font-bold text-red-600">
              {summary.unresolved}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-green-500">
            <p className="text-sm text-gray-600">Resolved</p>
            <p className="text-2xl font-bold text-green-600">
              {summary.resolved}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-purple-500">
            <p className="text-sm text-gray-600">Missing Inventory</p>
            <p className="text-2xl font-bold text-purple-600">
              {summary.by_type?.missing_inventory?.unresolved || 0}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="reported">Reported</option>
              <option value="in_progress">In Progress</option>
              <option value="fixed">Fixed</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Type
            </label>
            <select
              value={issueTypeFilter}
              onChange={(e) => setIssueTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="missing_inventory">Missing Inventory</option>
              <option value="fault">Fault/Repair</option>
              <option value="maintenance">Maintenance</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setStatusFilter("");
                setIssueTypeFilter("");
              }}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Create Issue Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Report New Issue
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room *
                </label>
                <select
                  required
                  value={formData.room}
                  onChange={(e) =>
                    setFormData({ ...formData, room: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Room</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      Room {room.room_number} - {room.room_type_display}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Type *
                </label>
                <select
                  required
                  value={formData.issue_type}
                  onChange={(e) =>
                    setFormData({ ...formData, issue_type: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="missing_inventory">Missing Inventory</option>
                  <option value="fault">Fault/Repair Needed</option>
                  <option value="maintenance">Maintenance Required</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description of the issue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Detailed description of the issue or missing item"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority *
              </label>
              <select
                required
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Submit Issue
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Issues List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">
            All Issues ({issues.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          {issues.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No issues found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by reporting a new issue.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  className="p-4 sm:p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-lg font-semibold text-gray-900">
                              Room {issue.room_number}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                issue.status
                              )}`}
                            >
                              {issue.status_display}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                                issue.priority
                              )}`}
                            >
                              {issue.priority_display}
                            </span>
                          </div>
                          <h4 className="text-base font-semibold text-gray-900 mb-1">
                            {issue.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {issue.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                            <span>Type: {issue.issue_type_display}</span>
                            <span>•</span>
                            <span>Reported by: {issue.reported_by_name}</span>
                            <span>•</span>
                            <span>
                              {format(
                                new Date(issue.reported_at),
                                "MMM dd, yyyy HH:mm"
                              )}
                            </span>
                            {issue.fixed_at && (
                              <>
                                <span>•</span>
                                <span>Fixed by: {issue.fixed_by_name}</span>
                                <span>•</span>
                                <span>
                                  {format(
                                    new Date(issue.fixed_at),
                                    "MMM dd, yyyy HH:mm"
                                  )}
                                </span>
                              </>
                            )}
                          </div>
                          {issue.resolution_notes && (
                            <div className="mt-2 p-2 bg-green-50 rounded text-sm text-gray-700">
                              <strong>Resolution:</strong>{" "}
                              {issue.resolution_notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {issue.status !== "fixed" &&
                      issue.status !== "resolved" && (
                        <div className="mt-4 sm:mt-0 sm:ml-4">
                          <button
                            onClick={() => {
                              const notes = prompt(
                                "Resolution notes (optional):"
                              );
                              if (notes !== null) {
                                handleMarkFixed(issue.id, notes);
                              }
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                          >
                            Mark as Fixed
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomIssues;
