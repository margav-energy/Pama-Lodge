import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { format } from 'date-fns'

const BookingDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isManager } = useAuth()
  const [booking, setBooking] = useState(null)
  const [versions, setVersions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showVersions, setShowVersions] = useState(false)

  useEffect(() => {
    fetchBooking()
    if (isManager) {
      fetchVersions()
    }
  }, [id, isManager])

  const fetchBooking = async () => {
    try {
      const response = await axios.get(`/api/bookings/${id}/`)
      setBooking(response.data)
    } catch (error) {
      setError('Failed to load booking')
      console.error('Error fetching booking:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchVersions = async () => {
    try {
      const response = await axios.get(`/api/bookings/${id}/versions/`)
      setVersions(response.data)
    } catch (error) {
      console.error('Error fetching versions:', error)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this booking?')) {
      return
    }

    try {
      await axios.delete(`/api/bookings/${id}/`)
      navigate('/bookings')
    } catch (error) {
      setError(
        error.response?.data?.detail || 'Failed to delete booking'
      )
    }
  }

  const handleAuthorize = async () => {
    try {
      await axios.post(`/api/bookings/${id}/authorize/`, {
        authorized_by: user.username,
      })
      fetchBooking()
    } catch (error) {
      setError(
        error.response?.data?.detail || 'Failed to authorize booking'
      )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error && !booking) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    )
  }

  if (!booking) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <div className="mb-4 sm:mb-6">
        <Link
          to="/bookings"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm sm:text-base font-medium mb-3 sm:mb-4"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Back to Bookings</span>
          <span className="sm:hidden">Back</span>
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-3 sm:space-y-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Booking Details
          </h2>
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/bookings/${id}/edit`}
              className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm sm:text-base"
            >
              Edit
            </Link>
            {isManager && (
              <>
                <button
                  onClick={handleDelete}
                  className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm sm:text-base"
                >
                  Delete
                </button>
                {!booking.is_authorized && (
                  <button
                    onClick={handleAuthorize}
                    className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm sm:text-base"
                  >
                    Authorize
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Name
            </label>
            <p className="mt-1 text-sm text-gray-900">{booking.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">
              ID/Telephone
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {booking.id_or_telephone || 'N/A'}
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500">
              Address, Location
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {booking.address_location || 'N/A'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">
              Room No.
            </label>
            <p className="mt-1 text-sm text-gray-900">{booking.room_no}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">
              Payment Method
            </label>
            <div className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                booking.payment_method === 'cash'
                  ? 'bg-green-100 text-green-800'
                  : booking.payment_method === 'momo'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {booking.payment_method === 'cash' ? '💵 Cash' :
                 booking.payment_method === 'momo' ? '📱 Mobile Money' :
                 '💰 Both'}
              </span>
              {booking.momo_network && (
                <div className="mt-2 text-sm text-gray-700">
                  <span className="font-medium">MoMo:</span> {booking.momo_network} - {booking.momo_number}
                </div>
              )}
              {(booking.cash_amount || booking.momo_amount) && (
                <div className="mt-2 space-y-1">
                  {parseFloat(booking.cash_amount || 0) > 0 && (
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">Cash Paid:</span> ₵{parseFloat(booking.cash_amount).toFixed(2)}
                    </div>
                  )}
                  {parseFloat(booking.momo_amount || 0) > 0 && (
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">MoMo Paid:</span> ₵{parseFloat(booking.momo_amount).toFixed(2)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">
              Check-in Date
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {format(new Date(booking.check_in_date), 'MMM dd, yyyy')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">
              Check-in Time
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {booking.check_in_time}
            </p>
          </div>

          {booking.check_out_date && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Check-out Date
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {format(new Date(booking.check_out_date), 'MMM dd, yyyy')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Check-out Time
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {booking.check_out_time}
                </p>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-500">
              Amount (GHS)
            </label>
            <p className="mt-1 text-sm text-gray-900 font-semibold">
              {booking.amount_ghs}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">
              Booked By
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {booking.booked_by_name}
            </p>
          </div>

          {booking.last_edited_by && (
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Last Edited By
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {booking.last_edited_by_name}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-500">
              Created At
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {format(new Date(booking.created_at), 'MMM dd, yyyy HH:mm')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">
              Version
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {booking.version_number}
            </p>
          </div>

          {isManager && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Authorized
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {booking.is_authorized ? (
                    <span className="text-green-600 font-semibold">Yes</span>
                  ) : (
                    <span className="text-red-600 font-semibold">No</span>
                  )}
                </p>
              </div>

              {booking.authorized_by && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Authorized By
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {booking.authorized_by}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {isManager && versions.length > 0 && (
          <div className="mt-8">
            <button
              onClick={() => setShowVersions(!showVersions)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {showVersions ? 'Hide' : 'Show'} Version History ({versions.length})
            </button>

            {showVersions && (
              <div className="mt-4 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Version History
                </h3>
                {versions.map((version, index) => (
                  <div
                    key={version.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Version {versions.length - index}
                      </span>
                      <span className="text-xs text-gray-500">
                        {format(
                          new Date(version.edited_at),
                          'MMM dd, yyyy HH:mm'
                        )}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      Edited by: {version.edited_by_name}
                      {version.is_manager_edit && (
                        <span className="ml-2 text-green-600 font-semibold">
                          (Manager Edit)
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(version.version_data, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default BookingDetail

