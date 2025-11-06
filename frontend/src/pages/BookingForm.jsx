import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'
import { differenceInDays, parseISO } from 'date-fns'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import offlineStorage from '../services/offlineStorage'
import syncService from '../services/syncService'

const BookingForm = () => {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const { user } = useAuth()
  const isOnline = useOnlineStatus()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    id_or_telephone: '',
    address_location: '',
    age: '',
    room_no: '',
    check_in_date: '',
    check_in_time: '14:00', // Default: 2:00 PM
    check_out_date: '',
    check_out_time: '12:00', // Default: 12:00 PM
    payment_method: 'cash',
    momo_network: '',
    momo_number: '',
    amount_ghs: '',
    cash_amount: '',
    momo_amount: '',
    authorized_by: '',
    is_authorized: false,
  })
  const [availableRooms, setAvailableRooms] = useState([])
  const [loadingRooms, setLoadingRooms] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [calculatedAmount, setCalculatedAmount] = useState(0)
  const [numberOfDays, setNumberOfDays] = useState(0)

  useEffect(() => {
    if (isEdit) {
      fetchBooking()
    }
  }, [id])

  useEffect(() => {
    // Calculate amount when dates or room changes
    if (formData.check_in_date && selectedRoom) {
      let days = 1 // Default to 1 day
      let total = selectedRoom.price_per_night
      
      if (formData.check_out_date) {
        const checkIn = parseISO(formData.check_in_date)
        const checkOut = parseISO(formData.check_out_date)
        days = differenceInDays(checkOut, checkIn)
        days = days > 0 ? days : 1 // Minimum 1 day
        total = days * selectedRoom.price_per_night
      }
      
      setNumberOfDays(days)
      setCalculatedAmount(total)
      
      // Update amount_ghs
      setFormData(prev => {
        const updated = { ...prev, amount_ghs: total.toFixed(2) }
        
        // Auto-set payment amounts based on payment method
        if (prev.payment_method === 'cash') {
          updated.cash_amount = total.toFixed(2)
          updated.momo_amount = '0.00'
        } else if (prev.payment_method === 'momo') {
          updated.cash_amount = '0.00'
          updated.momo_amount = total.toFixed(2)
        } else if (prev.payment_method === 'both') {
          // Only update if amounts are empty or don't match
          const currentTotal = parseFloat(prev.cash_amount || 0) + parseFloat(prev.momo_amount || 0)
          if (Math.abs(currentTotal - parseFloat(prev.amount_ghs || 0)) < 0.01) {
            // Keep existing split
            const ratio = parseFloat(prev.cash_amount || 0) / (parseFloat(prev.amount_ghs || 1) || 1)
            updated.cash_amount = (total * ratio).toFixed(2)
            updated.momo_amount = (total * (1 - ratio)).toFixed(2)
          } else {
            // Split 50/50
            const half = (total / 2).toFixed(2)
            updated.cash_amount = half
            updated.momo_amount = half
          }
        }
        
        return updated
      })
    }
  }, [formData.check_in_date, formData.check_out_date, selectedRoom, formData.payment_method])

  useEffect(() => {
    // Fetch available rooms when check-in date changes
    if (formData.check_in_date) {
      fetchAvailableRooms()
    } else {
      setAvailableRooms([])
      setSelectedRoom(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.check_in_date, formData.check_out_date])

  useEffect(() => {
    // Update selected room when room_no or availableRooms changes
    if (formData.room_no && availableRooms.length > 0) {
      const room = availableRooms.find(r => r.room_number === formData.room_no)
      setSelectedRoom(room || null)
    } else if (!formData.room_no) {
      setSelectedRoom(null)
    }
  }, [formData.room_no, availableRooms])

  const fetchAvailableRooms = async () => {
    if (!formData.check_in_date) {
      setAvailableRooms([])
      return
    }
    
    setLoadingRooms(true)
    try {
      // Ensure date is in YYYY-MM-DD format
      const checkInDate = formData.check_in_date.split('T')[0] // Remove time if present
      let url = `/api/rooms/available/?check_in_date=${checkInDate}`
      
      if (formData.check_out_date) {
        const checkOutDate = formData.check_out_date.split('T')[0] // Remove time if present
        url += `&check_out_date=${checkOutDate}`
      }
      
      console.log('Fetching available rooms from:', url)
      const response = await axios.get(url)
      console.log('Available rooms response:', response.data)
      
      // Handle both array and object responses
      const rooms = Array.isArray(response.data) ? response.data : []
      setAvailableRooms(rooms)
      
      // If current room_no is not in available rooms, clear it
      if (formData.room_no && !rooms.find(r => r.room_number === formData.room_no)) {
        setFormData(prev => ({ ...prev, room_no: '' }))
        setSelectedRoom(null)
      }
    } catch (error) {
      console.error('Error fetching available rooms:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      setAvailableRooms([])
      // Don't show error to user, just log it
    } finally {
      setLoadingRooms(false)
    }
  }

  const fetchBooking = async () => {
    try {
      const response = await axios.get(`/api/bookings/${id}/`)
      const booking = response.data
      setFormData({
        name: booking.name || '',
        id_or_telephone: booking.id_or_telephone || '',
        address_location: booking.address_location || '',
        age: booking.age || '',
        room_no: booking.room_no || '',
        check_in_date: booking.check_in_date || '',
        check_in_time: booking.check_in_time || '14:00',
        check_out_date: booking.check_out_date || '',
        check_out_time: booking.check_out_time || '12:00',
        payment_method: booking.payment_method || 'cash',
        momo_network: booking.momo_network || '',
        momo_number: booking.momo_number || '',
        amount_ghs: booking.amount_ghs || '',
        cash_amount: booking.cash_amount || '0.00',
        momo_amount: booking.momo_amount || '0.00',
        authorized_by: booking.authorized_by || '',
        is_authorized: booking.is_authorized || false,
      })
    } catch (error) {
      console.error('Error fetching booking:', error)
      setError('Failed to load booking')
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    // Remove non-digit characters for phone number fields
    let processedValue = value
    if (name === 'momo_number' || name === 'id_or_telephone') {
      processedValue = value.replace(/\D/g, '') // Remove non-digits
    }
    
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : processedValue,
      }
      
      // Auto-adjust payment amounts when payment method changes
      if (name === 'payment_method') {
        if (value === 'cash') {
          updated.cash_amount = prev.amount_ghs || '0.00'
          updated.momo_amount = '0.00'
          updated.momo_network = ''
          updated.momo_number = ''
        } else if (value === 'momo') {
          updated.cash_amount = '0.00'
          updated.momo_amount = prev.amount_ghs || '0.00'
        } else if (value === 'both') {
          // Keep existing amounts or split 50/50
          if (!prev.cash_amount && !prev.momo_amount && prev.amount_ghs) {
            const half = (parseFloat(prev.amount_ghs) / 2).toFixed(2)
            updated.cash_amount = half
            updated.momo_amount = half
          }
        }
      }
      
      // Auto-calculate remaining amount when one payment is entered
      if (name === 'cash_amount' && updated.payment_method === 'both') {
        const cash = parseFloat(value) || 0
        const total = parseFloat(updated.amount_ghs) || 0
        updated.momo_amount = Math.max(0, total - cash).toFixed(2)
      }
      
      if (name === 'momo_amount' && updated.payment_method === 'both') {
        const momo = parseFloat(value) || 0
        const total = parseFloat(updated.amount_ghs) || 0
        updated.cash_amount = Math.max(0, total - momo).toFixed(2)
      }
      
      return updated
    })
  }

  const validatePhoneNumber = (phone) => {
    // Ghana phone numbers are exactly 10 digits
    const phoneRegex = /^\d{10}$/
    return phoneRegex.test(phone)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validate payment amounts
    const cash = parseFloat(formData.cash_amount) || 0
    const momo = parseFloat(formData.momo_amount) || 0
    const total = parseFloat(formData.amount_ghs) || 0
    const paymentTotal = cash + momo

    if (Math.abs(paymentTotal - total) > 0.01) {
      setError(`Total payments (₵${paymentTotal.toFixed(2)}) must equal amount due (₵${total.toFixed(2)})`)
      setLoading(false)
      return
    }

    // Validate MoMo fields if MoMo payment is used
    if ((formData.payment_method === 'momo' || formData.payment_method === 'both') && momo > 0) {
      if (!formData.momo_network) {
        setError('Please select a Mobile Money network')
        setLoading(false)
        return
      }
      if (!formData.momo_number) {
        setError('Please enter Mobile Money number')
        setLoading(false)
        return
      }
      if (!validatePhoneNumber(formData.momo_number)) {
        setError('Mobile Money number must be exactly 10 digits')
        setLoading(false)
        return
      }
    }

    // Validate ID/Telephone if it's a phone number
    if (formData.id_or_telephone && /^\d+$/.test(formData.id_or_telephone)) {
      if (!validatePhoneNumber(formData.id_or_telephone)) {
        setError('Phone number must be exactly 10 digits')
        setLoading(false)
        return
      }
    }

    try {
      if (isEdit) {
        // Editing requires online connection
        if (!isOnline) {
          setError('Editing bookings requires an internet connection. Please connect to the internet and try again.')
          setLoading(false)
          return
        }
        await axios.put(`/api/bookings/${id}/`, formData)
        navigate('/bookings')
      } else {
        // Creating new booking - can work offline
        if (isOnline) {
          // Try to submit online first
          try {
            await axios.post('/api/bookings/', formData)
            navigate('/bookings')
            return
          } catch (error) {
            // If online submission fails, fall back to offline storage
            console.warn('Online submission failed, saving offline:', error)
          }
        }

        // Save offline
        await offlineStorage.addBooking(formData)
        setSuccess('Booking saved offline! It will be synced automatically when you reconnect to the internet.')
        
        // Try to sync immediately if online (in case online submission failed but we're still online)
        if (isOnline) {
          setTimeout(() => {
            syncService.checkAndSync()
          }, 1000)
        }

        // Clear form after a delay
        setTimeout(() => {
          setFormData({
            name: '',
            id_or_telephone: '',
            address_location: '',
            age: '',
            room_no: '',
            check_in_date: '',
            check_in_time: '14:00',
            check_out_date: '',
            check_out_time: '12:00',
            payment_method: 'cash',
            momo_network: '',
            momo_number: '',
            amount_ghs: '',
            cash_amount: '',
            momo_amount: '',
            authorized_by: '',
            is_authorized: false,
          })
          setSelectedRoom(null)
          setSuccess('')
        }, 3000)
      }
    } catch (error) {
      const errorMsg = error.response?.data
      if (typeof errorMsg === 'object') {
        // Handle field-specific errors
        const errors = Object.entries(errorMsg)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value[0] : value}`)
          .join(', ')
        setError(errors)
      } else {
        setError(
          error.response?.data?.detail ||
            error.response?.data?.message ||
            'Failed to save booking'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const showMoMoFields = formData.payment_method === 'momo' || formData.payment_method === 'both'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-4 sm:py-8 px-2 sm:px-4 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link
            to="/bookings"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-3 sm:mb-4 text-sm sm:text-base font-medium"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back to Bookings</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {isEdit ? 'Edit Booking' : 'New Booking'}
              </h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
                {isEdit ? 'Update booking information' : 'Fill in the details to create a new booking'}
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {error && (
            <div className="mx-4 sm:mx-6 mt-4 sm:mt-6 bg-red-50 border-l-4 border-red-400 p-3 sm:p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-xs sm:text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mx-4 sm:mx-6 mt-4 sm:mt-6 bg-green-50 border-l-4 border-green-400 p-3 sm:p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-xs sm:text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 sm:space-y-8">
            {/* Guest Information Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                Guest Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    placeholder="Enter guest name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ID/Telephone
                  </label>
                  <input
                    type="text"
                    name="id_or_telephone"
                    value={formData.id_or_telephone}
                    onChange={handleChange}
                    maxLength={10}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    placeholder="10-digit phone number or ID"
                  />
                  {formData.id_or_telephone && /^\d+$/.test(formData.id_or_telephone) && (
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.id_or_telephone.length}/10 digits
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Age <span className="text-red-500">*</span>
                    <span className="ml-2 text-xs text-gray-500 font-normal">(Must be 18+)</span>
                  </label>
                  <input
                    type="number"
                    name="age"
                    required
                    min="18"
                    max="120"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    placeholder="Enter guest age"
                  />
                  {formData.age && parseInt(formData.age) < 18 && (
                    <p className="mt-1 text-xs text-red-500">
                      Guest must be at least 18 years old
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address, Location
                  </label>
                  <input
                    type="text"
                    name="address_location"
                    value={formData.address_location}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    placeholder="Enter address or location"
                  />
                </div>
              </div>
            </div>

            {/* House Rules Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-yellow-500 rounded-full mr-3"></span>
                House Rules
              </h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>Check-in time:</strong> 2:00 PM</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>Check-out time:</strong> 12:00 PM</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>Maximum check-in age:</strong> 18 years</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>Check-in:</strong> With front desk</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span><strong>Pets:</strong> Not allowed</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Room & Dates Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-green-600 rounded-full mr-3"></span>
                Room & Dates
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Room Number <span className="text-red-500">*</span>
                    {formData.check_in_date && (
                      <span className="ml-2 text-xs text-gray-500">
                        ({availableRooms.length} available)
                      </span>
                    )}
                  </label>
                  {formData.check_in_date ? (
                    <select
                      name="room_no"
                      required
                      value={formData.room_no}
                      onChange={handleChange}
                      disabled={loadingRooms}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                    >
                      <option value="">Select a room</option>
                      {availableRooms.length === 0 && !loadingRooms ? (
                        <option value="" disabled>No rooms available for selected dates</option>
                      ) : (
                        availableRooms.map((room) => (
                          <option key={room.room_id} value={room.room_number}>
                            {room.room_number} - {room.room_type_display} (₵{room.price_per_night}/night)
                          </option>
                        ))
                      )}
                    </select>
                  ) : (
                    <input
                      type="text"
                      name="room_no"
                      required
                      value={formData.room_no}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      placeholder="Select check-in date first"
                      disabled
                    />
                  )}
                  {loadingRooms && (
                    <p className="mt-1 text-xs text-gray-500">Loading available rooms...</p>
                  )}
                  {formData.check_in_date && availableRooms.length === 0 && !loadingRooms && (
                    <p className="mt-1 text-xs text-red-500">No rooms available for selected dates</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Check-in Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="check_in_date"
                    required
                    value={formData.check_in_date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Check-in Time <span className="text-red-500">*</span>
                    <span className="ml-2 text-xs text-gray-500 font-normal">(Default: 2:00 PM)</span>
                  </label>
                  <input
                    type="time"
                    name="check_in_time"
                    required
                    value={formData.check_in_time}
                    onChange={handleChange}
                    min="14:00"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  />
                  {formData.check_in_time && formData.check_in_time < '14:00' && (
                    <p className="mt-1 text-xs text-red-500">
                      Check-in time is 2:00 PM. Please select 2:00 PM or later.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    name="check_out_date"
                    value={formData.check_out_date}
                    onChange={handleChange}
                    min={formData.check_in_date || undefined}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Check-out Time
                    <span className="ml-2 text-xs text-gray-500 font-normal">(Default: 12:00 PM)</span>
                  </label>
                  <input
                    type="time"
                    name="check_out_time"
                    value={formData.check_out_time}
                    onChange={handleChange}
                    max="12:00"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  />
                  {formData.check_out_time && formData.check_out_time > '12:00' && (
                    <p className="mt-1 text-xs text-red-500">
                      Check-out time is 12:00 PM. Please select 12:00 PM or earlier.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-purple-600 rounded-full mr-3"></span>
                Payment Information
              </h2>
              
              {/* Amount Calculation Display */}
              {selectedRoom && formData.check_in_date && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Room Price:</span>
                    <span className="text-lg font-bold text-gray-900">₵{selectedRoom.price_per_night}/night</span>
                  </div>
                  {numberOfDays > 0 && (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Number of Days:</span>
                        <span className="text-lg font-semibold text-gray-900">{numberOfDays} {numberOfDays === 1 ? 'day' : 'days'}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-blue-300">
                        <span className="text-base font-bold text-gray-900">Total Amount Due:</span>
                        <span className="text-2xl font-bold text-blue-600">₵{calculatedAmount.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="payment_method"
                    required
                    value={formData.payment_method}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                  >
                    <option value="cash">💵 Cash Only</option>
                    <option value="momo">📱 Mobile Money Only</option>
                    <option value="both">💰 Both (Cash + MoMo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Total Amount (GHS) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="amount_ghs"
                    required
                    step="0.01"
                    min="0"
                    value={formData.amount_ghs}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-gray-50"
                    placeholder="0.00"
                    readOnly={selectedRoom && formData.check_in_date}
                  />
                  {selectedRoom && formData.check_in_date && (
                    <p className="mt-1 text-xs text-gray-500">Auto-calculated based on room and dates</p>
                  )}
                </div>

                {/* Cash Amount */}
                {formData.payment_method === 'cash' || formData.payment_method === 'both' ? (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cash Amount (GHS) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="cash_amount"
                      required
                      step="0.01"
                      min="0"
                      value={formData.cash_amount}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                      placeholder="0.00"
                    />
                    {formData.payment_method === 'both' && (
                      <p className="mt-1 text-xs text-gray-500">
                        Remaining: ₵{(parseFloat(formData.amount_ghs || 0) - parseFloat(formData.cash_amount || 0)).toFixed(2)}
                      </p>
                    )}
                  </div>
                ) : null}

                {/* MoMo Amount */}
                {showMoMoFields ? (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        MoMo Amount (GHS) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="momo_amount"
                        required={showMoMoFields}
                        step="0.01"
                        min="0"
                        value={formData.momo_amount}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                        placeholder="0.00"
                      />
                      {formData.payment_method === 'both' && (
                        <p className="mt-1 text-xs text-gray-500">
                          Remaining: ₵{(parseFloat(formData.amount_ghs || 0) - parseFloat(formData.momo_amount || 0)).toFixed(2)}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        MoMo Network <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="momo_network"
                        required={showMoMoFields}
                        value={formData.momo_network}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white"
                      >
                        <option value="">Select Network</option>
                        <option value="MTN">MTN</option>
                        <option value="Vodafone">Vodafone</option>
                        <option value="AT">AT</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        MoMo Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="momo_number"
                        required={showMoMoFields}
                        value={formData.momo_number}
                        onChange={handleChange}
                        maxLength={10}
                        pattern="[0-9]{10}"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        placeholder="0244123456 (10 digits)"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {formData.momo_number ? `${formData.momo_number.length}/10 digits` : 'Enter 10-digit Ghana phone number'}
                      </p>
                    </div>
                  </>
                ) : null}

                {/* Payment Summary */}
                {formData.amount_ghs && (formData.cash_amount || formData.momo_amount) && (
                  <div className="md:col-span-2 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Payment Summary</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cash:</span>
                        <span className="font-medium text-gray-900">₵{parseFloat(formData.cash_amount || 0).toFixed(2)}</span>
                      </div>
                      {parseFloat(formData.momo_amount || 0) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mobile Money:</span>
                          <span className="font-medium text-gray-900">₵{parseFloat(formData.momo_amount || 0).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t border-gray-300">
                        <span className="font-semibold text-gray-900">Total Paid:</span>
                        <span className="font-bold text-gray-900">
                          ₵{(parseFloat(formData.cash_amount || 0) + parseFloat(formData.momo_amount || 0)).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount Due:</span>
                        <span className="font-medium text-gray-900">₵{parseFloat(formData.amount_ghs || 0).toFixed(2)}</span>
                      </div>
                      {Math.abs((parseFloat(formData.cash_amount || 0) + parseFloat(formData.momo_amount || 0)) - parseFloat(formData.amount_ghs || 0)) > 0.01 && (
                        <div className="text-xs text-red-600 font-medium mt-1">
                          ⚠️ Payment amounts don't match total amount due
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Manager Only Section */}
            {user?.role === 'manager' && (
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="w-1 h-6 bg-yellow-600 rounded-full mr-3"></span>
                  Authorization
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Authorized By
                    </label>
                    <input
                      type="text"
                      name="authorized_by"
                      value={formData.authorized_by}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      placeholder="Manager name"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_authorized"
                      checked={formData.is_authorized}
                      onChange={handleChange}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-3 block text-sm font-semibold text-gray-900">
                      Mark as Authorized
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate('/bookings')}
                className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  isEdit ? 'Update Booking' : 'Create Booking'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default BookingForm
