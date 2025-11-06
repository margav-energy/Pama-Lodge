import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { format } from 'date-fns'

const Dashboard = () => {
  const { user, isManager } = useAuth()
  const [dailyTotals, setDailyTotals] = useState(null)
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  useEffect(() => {
    fetchDashboardData()
  }, [selectedDate])

  const fetchDashboardData = async () => {
    try {
      const [totalsResponse, bookingsResponse] = await Promise.all([
        axios.get(`/api/bookings/daily_totals/?date=${selectedDate}`),
        axios.get('/api/bookings/'),
      ])
      setDailyTotals(totalsResponse.data)
      const bookings = Array.isArray(bookingsResponse.data) 
        ? bookingsResponse.data 
        : bookingsResponse.data.results || []
      // Get the 10 most recent bookings
      setRecentBookings(bookings.slice(0, 10))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-2 sm:px-4 py-4 sm:py-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="mt-1 sm:mt-2 text-base sm:text-lg text-gray-600">
              Welcome back, <span className="font-semibold text-gray-900">{user?.username}</span>! 👋
            </p>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 capitalize">
              {user?.role} • {format(new Date(selectedDate), 'EEEE, MMMM dd, yyyy')}
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

      {/* Stats Cards */}
      <div className={`grid grid-cols-1 gap-6 mb-8 ${isManager ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
        {/* Bookings Card */}
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border-l-4 border-blue-500">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">
                  Total Bookings
                </p>
                <p className="mt-1 sm:mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                  {dailyTotals?.total_bookings || 0}
                </p>
                <p className="mt-1 sm:mt-2 text-xs text-gray-500">
                  For {format(new Date(selectedDate), 'MMM dd, yyyy')}
                </p>
              </div>
              <div className="ml-2 sm:ml-4 flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full">
                  <svg
                    className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600"
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
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Card - Only visible to managers */}
        {isManager && (
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border-l-4 border-green-500">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">
                    Total Revenue
                  </p>
                  <p className="mt-1 sm:mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                    ₵{dailyTotals?.total_amount_ghs?.toFixed(2) || '0.00'}
                  </p>
                  <p className="mt-1 sm:mt-2 text-xs text-gray-500">
                    Ghana Cedis
                  </p>
                </div>
                <div className="ml-2 sm:ml-4 flex-shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full">
                    <svg
                      className="h-6 w-6 sm:h-8 sm:w-8 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Date Selector Card */}
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border-l-4 border-purple-500">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 w-full sm:w-auto">
                <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide mb-2 sm:mb-0">
                  Select Date
                </p>
                <div className="mt-2">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-sm sm:text-base lg:text-lg font-semibold text-gray-900 transition-all duration-200"
                  />
                </div>
              </div>
              <div className="hidden sm:block ml-4 flex-shrink-0">
                <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full">
                  <svg
                    className="h-8 w-8 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                Recent Bookings
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                Latest booking activities
              </p>
            </div>
            <Link
              to="/bookings"
              className="mt-2 sm:mt-0 text-blue-600 hover:text-blue-800 font-medium text-xs sm:text-sm flex items-center"
            >
              View All
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {recentBookings.length === 0 ? (
            <div className="px-4 sm:px-6 py-12 sm:py-16 text-center">
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
              <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new booking.</p>
              <div className="mt-6">
                <Link
                  to="/bookings/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Booking
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="sm:hidden divide-y divide-gray-200">
                {recentBookings.map((booking) => (
                  <Link
                    key={booking.id}
                    to={`/bookings/${booking.id}`}
                    className="block px-4 py-4 hover:bg-blue-50 transition-colors duration-150"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start flex-1 min-w-0">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                          {booking.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {booking.name}
                            </p>
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex-shrink-0">
                              {booking.room_no}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center space-x-3 text-xs text-gray-500">
                            <span>{format(new Date(booking.check_in_date), 'MMM dd')}</span>
                            <span>•</span>
                            <span className="font-semibold text-gray-900">₵{parseFloat(booking.amount_ghs).toFixed(2)}</span>
                          </div>
                          <div className="mt-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
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
                          </div>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Guest Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Room
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Check-in
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="hidden md:table-cell px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentBookings.map((booking, index) => (
                      <tr 
                        key={booking.id} 
                        className="hover:bg-blue-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                              {booking.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900">
                                {booking.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {booking.room_no}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {format(new Date(booking.check_in_date), 'MMM dd, yyyy')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.check_in_time}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">
                            ₵{parseFloat(booking.amount_ghs).toFixed(2)}
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
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
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            to={`/bookings/${booking.id}`}
                            className="text-blue-600 hover:text-blue-900 font-semibold inline-flex items-center"
                          >
                            View
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard

