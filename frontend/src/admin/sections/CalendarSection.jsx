import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCalendar, FiChevronLeft, FiChevronRight, 
  FiPlus, FiX, FiClock, FiMapPin, FiUser,
  FiMail, FiPhone, FiEdit2, FiTrash2,
  FiSun, FiMoon, FiCloud
} from 'react-icons/fi';
import { Toaster, toast } from 'react-hot-toast';

const CalendarSection = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [view, setView] = useState('month'); // 'month', 'week', 'day'
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    endTime: '',
    location: '',
    attendees: '',
    color: 'blue'
  });

  // Get month name
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get days in month
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of month (0-6, where 0 is Sunday)
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Previous month days
    const prevMonthDays = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        month: 'prev',
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthDays - i)
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month: 'current',
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i),
        isToday: isToday(new Date(currentDate.getFullYear(), currentDate.getMonth(), i))
      });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 rows * 7 days = 42
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        month: 'next',
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i)
      });
    }

    return days;
  };

  // Check if date is today
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Check if date is selected
  const isSelected = (date) => {
    return selectedDate &&
           date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  // Get events for a specific date
  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
  };

  // Handle date click
  const handleDateClick = (date) => {
    setSelectedDate(date);
    setEventForm({
      ...eventForm,
      date: date.toISOString().split('T')[0]
    });
    setShowEventModal(true);
  };

  // Handle event click
  const handleEventClick = (event, e) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle add event
  const handleAddEvent = () => {
    if (!eventForm.title || !eventForm.date) {
      toast.error('Please fill in required fields');
      return;
    }

    const newEvent = {
      id: Date.now(),
      ...eventForm,
      attendees: eventForm.attendees.split(',').map(a => a.trim()).filter(a => a)
    };

    setEvents([...events, newEvent]);
    setShowEventModal(false);
    setEventForm({
      title: '',
      description: '',
      date: '',
      time: '',
      endTime: '',
      location: '',
      attendees: '',
      color: 'blue'
    });
    
    toast.success('Event added successfully!');
  };

  // Handle delete event
  const handleDeleteEvent = (eventId) => {
    setEvents(events.filter(e => e.id !== eventId));
    setShowEventDetails(false);
    toast.success('Event deleted successfully!');
  };

  // Handle edit event
  const handleEditEvent = () => {
    setEventForm({
      title: selectedEvent.title,
      description: selectedEvent.description || '',
      date: selectedEvent.date,
      time: selectedEvent.time || '',
      endTime: selectedEvent.endTime || '',
      location: selectedEvent.location || '',
      attendees: selectedEvent.attendees ? selectedEvent.attendees.join(', ') : '',
      color: selectedEvent.color || 'blue'
    });
    setShowEventDetails(false);
    setShowEventModal(true);
  };

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Color classes for events
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500'
  };

  const calendarDays = generateCalendarDays();

  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { fontSize: '14px' } }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-3 sm:p-4 md:p-6 min-h-screen bg-gray-50"
      >
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FiCalendar className="text-blue-600" />
            Calendar
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">
            Manage your events and schedule
          </p>
        </div>

        {/* Calendar Controls */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiChevronLeft size={20} />
              </button>
              <h2 className="text-base sm:text-lg font-semibold flex-1 text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiChevronRight size={20} />
              </button>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={goToToday}
                className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                Today
              </button>
              
              <select
                value={view}
                onChange={(e) => setView(e.target.value)}
                className="flex-1 sm:flex-none px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm border-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="month">Month</option>
                <option value="week">Week</option>
                <option value="day">Day</option>
              </select>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-xl shadow-lg p-2 sm:p-4 mb-4 overflow-x-auto">
          {/* Day Names */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs sm:text-sm font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map((day, index) => {
              const dayEvents = getEventsForDate(day.date);
              
              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleDateClick(day.date)}
                  className={`
                    aspect-square p-1 sm:p-2 rounded-lg cursor-pointer transition-all
                    ${day.month === 'current' ? 'bg-white' : 'bg-gray-50'}
                    ${isToday(day.date) ? 'ring-2 ring-blue-500' : ''}
                    ${isSelected(day.date) ? 'ring-2 ring-purple-500' : ''}
                    hover:shadow-md
                  `}
                >
                  <div className="flex flex-col h-full">
                    <span className={`
                      text-xs sm:text-sm font-medium mb-1
                      ${day.month === 'current' ? 'text-gray-900' : 'text-gray-400'}
                      ${isToday(day.date) ? 'text-blue-600 font-bold' : ''}
                    `}>
                      {day.day}
                    </span>
                    
                    {/* Event Indicators */}
                    <div className="flex-1 space-y-1 overflow-hidden">
                      {dayEvents.slice(0, 3).map(event => (
                        <div
                          key={event.id}
                          onClick={(e) => handleEventClick(event, e)}
                          className={`
                            text-[8px] sm:text-xs px-1 py-0.5 rounded truncate text-white cursor-pointer
                            ${colorClasses[event.color] || 'bg-blue-500'}
                          `}
                        >
                          {event.time ? `${event.time} ` : ''}{event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-[8px] sm:text-xs text-gray-500 px-1">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl shadow-lg p-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
            Upcoming Events
          </h3>
          
          {events.length === 0 ? (
            <div className="text-center py-6">
              <FiCalendar className="text-3xl text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No upcoming events</p>
              <p className="text-xs text-gray-400 mt-1">Click on a date to add an event</p>
            </div>
          ) : (
            <div className="space-y-2">
              {events
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(0, 5)
                .map(event => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={(e) => handleEventClick(event, e)}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <div className={`w-1 h-10 rounded-full ${colorClasses[event.color] || 'bg-blue-500'}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{event.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.date).toLocaleDateString()} {event.time && `at ${event.time}`}
                      </p>
                    </div>
                    {event.location && (
                      <FiMapPin className="text-gray-400" size={14} />
                    )}
                  </motion.div>
                ))}
            </div>
          )}
        </div>

        {/* Add Event Modal */}
        <AnimatePresence>
          {showEventModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowEventModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                      {selectedEvent ? 'Edit Event' : 'Add Event'}
                    </h2>
                    <button
                      onClick={() => {
                        setShowEventModal(false);
                        setSelectedEvent(null);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FiX size={20} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={eventForm.title}
                        onChange={handleInputChange}
                        placeholder="Enter event title"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Date */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={eventForm.date}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Time */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Start Time
                        </label>
                        <input
                          type="time"
                          name="time"
                          value={eventForm.time}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          End Time
                        </label>
                        <input
                          type="time"
                          name="endTime"
                          value={eventForm.endTime}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={eventForm.location}
                        onChange={handleInputChange}
                        placeholder="Enter location"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={eventForm.description}
                        onChange={handleInputChange}
                        placeholder="Enter description"
                        rows="3"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Attendees */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Attendees (comma separated)
                      </label>
                      <input
                        type="text"
                        name="attendees"
                        value={eventForm.attendees}
                        onChange={handleInputChange}
                        placeholder="john@example.com, jane@example.com"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Color */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Color
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {Object.keys(colorClasses).map(color => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setEventForm({...eventForm, color})}
                            className={`w-8 h-8 rounded-full ${colorClasses[color]} ${
                              eventForm.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={selectedEvent ? handleEditEvent : handleAddEvent}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        {selectedEvent ? 'Update Event' : 'Add Event'}
                      </button>
                      <button
                        onClick={() => {
                          setShowEventModal(false);
                          setSelectedEvent(null);
                        }}
                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Event Details Modal */}
        <AnimatePresence>
          {showEventDetails && selectedEvent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowEventDetails(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">Event Details</h2>
                    <button
                      onClick={() => setShowEventDetails(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FiX size={20} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Event Header */}
                    <div className={`h-2 rounded-t-xl ${colorClasses[selectedEvent.color] || 'bg-blue-500'}`} />
                    
                    {/* Title */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{selectedEvent.title}</h3>
                    </div>

                    {/* Date & Time */}
                    <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <FiCalendar className="text-gray-500" size={16} />
                        <span>{new Date(selectedEvent.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      
                      {selectedEvent.time && (
                        <div className="flex items-center gap-2 text-sm">
                          <FiClock className="text-gray-500" size={16} />
                          <span>
                            {selectedEvent.time} 
                            {selectedEvent.endTime && ` - ${selectedEvent.endTime}`}
                          </span>
                        </div>
                      )}

                      {selectedEvent.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <FiMapPin className="text-gray-500" size={16} />
                          <span>{selectedEvent.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {selectedEvent.description && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Description</p>
                        <p className="text-sm text-gray-700">{selectedEvent.description}</p>
                      </div>
                    )}

                    {/* Attendees */}
                    {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-2">Attendees ({selectedEvent.attendees.length})</p>
                        <div className="space-y-2">
                          {selectedEvent.attendees.map((attendee, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <FiUser className="text-gray-400" size={14} />
                              <span>{attendee}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleEditEvent}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <FiEdit2 size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(selectedEvent.id)}
                        className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <FiTrash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default CalendarSection;