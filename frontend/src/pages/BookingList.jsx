import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { format } from 'date-fns'

const BookingList = () => {
  const { isManager } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterDate, setFilterDate] = useState('')

  useEffect(() => {
    fetchBookings()
  }, [filterDate])

  const fetchBookings = async () => {
    try {
      let url = '/api/bookings/'
      if (filterDate) {
        url += `?check_in_date=${filterDate}`
      }
      const response = await axios.get(url)
      setBookings(
        Array.isArray(response.data) ? response.data : response.data.results || []
      )
    } catch (error) {
      setError('Failed to load bookings')
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 px-2 sm:px-4 py-4 sm:py-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Bookings
            </h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
              Manage and view all guest bookings
            </p>
          </div>
          <Link
            to="/bookings/new"
            className="mt-4 sm:mt-0 inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm sm:text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">New Booking</span>
            <span className="sm:hidden">New</span>
          </Link>
        </div>
      </div>

      {/* Filter Section */}
      <div className="mb-4 sm:mb-6 bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-0">
            Filter by Check-in Date
          </label>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-sm sm:text-base"
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate('')}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Bookings Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            All Bookings ({bookings.length})
          </h3>
        </div>

        {bookings.length === 0 ? (
          <div className="px-4 sm:px-6 py-12 sm:py-16 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
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
            <h3 className="mt-4 text-lg font-medium text-gray-900">No bookings found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {filterDate ? 'Try adjusting your filter or create a new booking.' : 'Get started by creating a new booking.'}
            </p>
            <div className="mt-6">
              <Link
                to="/bookings/new"
                className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Booking
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="hidden sm:table-cell px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Check-in
                  </th>
                  <th className="hidden md:table-cell px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Check-out
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="hidden lg:table-cell px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Payment
                  </th>
                  {isManager && (
                    <th className="hidden xl:table-cell px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                  )}
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-blue-50 transition-colors duration-150"
                  >
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                          {booking.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-2 sm:ml-4 min-w-0">
                          <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                            {booking.name}
                          </div>
                          {booking.id_or_telephone && (
                            <div className="text-xs text-gray-500 truncate">
                              {booking.id_or_telephone}
                            </div>
                          )}
                          <div className="sm:hidden text-xs text-gray-500 mt-1">
                            {format(new Date(booking.check_in_date), 'MMM dd')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-blue-100 text-blue-800">
                        {booking.room_no}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(booking.check_in_date), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.check_in_time}
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                      {booking.check_out_date ? (
                        <>
                          <div className="text-sm text-gray-900">
                            {format(new Date(booking.check_out_date), 'MMM dd, yyyy')}
                          </div>
                          {booking.check_out_time && (
                            <div className="text-sm text-gray-500">
                              {booking.check_out_time}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm font-bold text-gray-900">
                        ₵{parseFloat(booking.amount_ghs).toFixed(2)}
                      </div>
                      <div className="lg:hidden text-xs text-gray-500 mt-1">
                        {booking.payment_method === 'cash' ? '💵 Cash' : 
                         booking.payment_method === 'momo' ? '📱 MoMo' : 
                         '💰 Both'}
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          booking.payment_method === 'cash'
                            ? 'bg-green-100 text-green-800'
                            : booking.payment_method === 'momo'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.payment_method === 'cash' ? '💵 Cash' :
                           booking.payment_method === 'momo' ? '📱 MoMo' :
                           '💰 Both'}
                        </span>
                        {booking.momo_network && (
                          <span className="text-xs text-gray-500">
                            {booking.momo_network}: {booking.momo_number}
                          </span>
                        )}
                        {(booking.cash_amount || booking.momo_amount) && (
                          <div className="text-xs text-gray-500 space-y-0.5">
                            {parseFloat(booking.cash_amount || 0) > 0 && (
                              <div>Cash: ₵{parseFloat(booking.cash_amount).toFixed(2)}</div>
                            )}
                            {parseFloat(booking.momo_amount || 0) > 0 && (
                              <div>MoMo: ₵{parseFloat(booking.momo_amount).toFixed(2)}</div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    {isManager && (
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        {booking.is_authorized ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            ✓ Authorized
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                            Pending
                          </span>
                        )}
                      </td>
                    )}
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                      <Link
                        to={`/bookings/${booking.id}`}
                        className="text-blue-600 hover:text-blue-900 font-semibold inline-flex items-center"
                      >
                        View
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookingList
