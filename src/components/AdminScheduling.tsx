import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { ScheduleManagementService, type TimeSlot, type Team, type Holiday, type OperatingHours, type ScheduleSettings } from '../services/scheduleManagement';
import { AdminDataService, type Booking } from '../services/adminAuth';

interface AdminSchedulingProps {
  adminId: string;
}

// Service areas in Niagara region with coordinates for route optimization
const NIAGARA_SERVICE_AREAS = [
  { name: 'St. Catharines', lat: 43.1594, lng: -79.2469, color: '#3B82F6' },
  { name: 'Niagara Falls', lat: 43.0896, lng: -79.0849, color: '#10B981' },
  { name: 'Niagara-on-the-Lake', lat: 43.2557, lng: -79.0715, color: '#F59E0B' },
  { name: 'Welland', lat: 42.9834, lng: -79.2482, color: '#EF4444' },
  { name: 'Fort Erie', lat: 42.9097, lng: -78.9332, color: '#8B5CF6' },
  { name: 'Thorold', lat: 43.1230, lng: -79.1998, color: '#06B6D4' },
  { name: 'Lincoln', lat: 43.1439, lng: -79.4183, color: '#84CC16' },
  { name: 'Pelham', lat: 43.0359, lng: -79.3436, color: '#F97316' },
  { name: 'Grimsby', lat: 43.1939, lng: -79.5648, color: '#EC4899' },
  { name: 'Port Colborne', lat: 42.8858, lng: -79.2517, color: '#6366F1' }
];

const AdminScheduling: React.FC<AdminSchedulingProps> = ({ adminId }) => {
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('week');

  // Services
  const scheduleService = ScheduleManagementService.getInstance();
  const adminDataService = new AdminDataService();

  // State
  const [teams, setTeams] = useState<Team[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<TimeSlot[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [operatingHours, setOperatingHours] = useState<OperatingHours[]>([]);
  const [scheduleSettings, setScheduleSettings] = useState<ScheduleSettings | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Team management state
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [newTeam, setNewTeam] = useState<Partial<Team>>({
    name: '',
    members: [],
    color: '#3B82F6',
    serviceAreas: [],
    isActive: true,
    workingHours: {}
  });

  // Date blocking state
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockType, setBlockType] = useState<'single' | 'range' | 'recurring'>('single');
  const [blockData, setBlockData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    teamId: '',
    time: '09:00',
    duration: 480
  });

  // Holiday management state
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [newHoliday, setNewHoliday] = useState({
    name: '',
    date: '',
    isRecurring: false,
    affectedTeams: []
  });

  // Load initial data
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [teamsData, blockedSlotsData, holidaysData, operatingHoursData, settingsData, bookingsData] = await Promise.all([
        Promise.resolve(scheduleService.getTeams()),
        Promise.resolve(scheduleService.getBlockedTimeSlots()),
        Promise.resolve(scheduleService.getHolidays()),
        Promise.resolve(scheduleService.getOperatingHours()),
        Promise.resolve(scheduleService.getScheduleSettings()),
        adminDataService.getBookings()
      ]);

      setTeams(teamsData);
      setBlockedSlots(blockedSlotsData);
      setHolidays(holidaysData);
      setOperatingHours(operatingHoursData);
      setScheduleSettings(settingsData);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading schedule data:', error);
    }
    setIsLoading(false);
  };

  // Calendar generation
  const generateCalendarDays = useCallback(() => {
    const date = new Date(selectedDate);
    const days = [];

    if (viewMode === 'month') {
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - firstDay.getDay());

      for (let i = 0; i < 42; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        days.push(currentDate.toISOString().split('T')[0]);
      }
    } else if (viewMode === 'week') {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());

      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startOfWeek);
        currentDate.setDate(startOfWeek.getDate() + i);
        days.push(currentDate.toISOString().split('T')[0]);
      }
    } else {
      days.push(selectedDate);
    }

    return days;
  }, [selectedDate, viewMode]);

  // Team management functions
  const handleSaveTeam = () => {
    if (!newTeam.name) return;

    const teamToSave: Team = {
      id: editingTeam?.id || `team_${Date.now()}`,
      name: newTeam.name,
      members: newTeam.members || [],
      color: newTeam.color || '#3B82F6',
      serviceAreas: newTeam.serviceAreas || [],
      isActive: newTeam.isActive ?? true,
      workingHours: newTeam.workingHours || {}
    };

    const updatedTeams = editingTeam
      ? teams.map(team => team.id === editingTeam.id ? teamToSave : team)
      : [...teams, teamToSave];

    setTeams(updatedTeams);
    scheduleService.updateTeams(updatedTeams);
    setShowTeamModal(false);
    setEditingTeam(null);
    setNewTeam({
      name: '',
      members: [],
      color: '#3B82F6',
      serviceAreas: [],
      isActive: true,
      workingHours: {}
    });
  };

  // Date blocking functions
  const handleBlockDate = () => {
    if (!blockData.startDate || !blockData.reason) return;

    if (blockType === 'range' && blockData.endDate) {
      scheduleService.blockDateRange(
        blockData.startDate,
        blockData.endDate,
        blockData.reason,
        blockData.teamId || undefined,
        adminId
      );
    } else {
      scheduleService.blockTimeSlot({
        date: blockData.startDate,
        time: blockData.time,
        duration: blockData.duration,
        isBlocked: true,
        reason: blockData.reason,
        teamId: blockData.teamId || undefined,
        createdBy: adminId
      });
    }

    setBlockedSlots(scheduleService.getBlockedTimeSlots());
    setShowBlockModal(false);
    setBlockData({
      startDate: '',
      endDate: '',
      reason: '',
      teamId: '',
      time: '09:00',
      duration: 480
    });
  };

  // Holiday management functions
  const handleAddHoliday = () => {
    if (!newHoliday.name || !newHoliday.date) return;

    scheduleService.addHoliday({
      name: newHoliday.name,
      date: newHoliday.date,
      isRecurring: newHoliday.isRecurring,
      affectedTeams: newHoliday.affectedTeams,
      createdBy: adminId
    });

    setHolidays(scheduleService.getHolidays());
    setShowHolidayModal(false);
    setNewHoliday({
      name: '',
      date: '',
      isRecurring: false,
      affectedTeams: []
    });
  };

  // Route optimization
  const optimizeRoutes = (date: string) => {
    const dayBookings = bookings.filter(booking =>
      booking.serviceDate === date && booking.status === 'scheduled'
    );

    // Group bookings by service area
    const areaGroups = dayBookings.reduce((acc, booking) => {
      const area = booking.serviceArea;
      if (!acc[area]) acc[area] = [];
      acc[area].push(booking);
      return acc;
    }, {} as Record<string, Booking[]>);

    // Calculate route efficiency
    const routeEfficiency = Object.entries(areaGroups).map(([area, bookings]) => {
      const totalBookings = bookings.length;
      const assignedTeams = [...new Set(bookings.map(b => b.assignedTeam).filter(Boolean))];
      const efficiency = assignedTeams.length > 0 ? totalBookings / assignedTeams.length : 0;

      return {
        area,
        bookings: totalBookings,
        teams: assignedTeams.length,
        efficiency: efficiency.toFixed(1),
        avgTravelTime: calculateAverageTravelTime(area, bookings)
      };
    });

    return routeEfficiency;
  };

  const calculateAverageTravelTime = (area: string, bookings: Booking[]) => {
    // Simplified travel time calculation
    const baseTime = 15; // minutes base travel time
    const bookingCount = bookings.length;
    return Math.round(baseTime + (bookingCount * 5)); // 5 min per additional booking
  };

  // Get bookings for a specific date and team
  const getBookingsForDateAndTeam = (date: string, teamId?: string) => {
    return bookings.filter(booking =>
      booking.serviceDate === date &&
      (teamId ? booking.assignedTeam === teamId : true) &&
      booking.status === 'scheduled'
    );
  };

  // Check if date is blocked
  const isDateBlocked = (date: string, teamId?: string) => {
    return blockedSlots.some(slot =>
      slot.date === date &&
      slot.isBlocked &&
      (teamId ? slot.teamId === teamId || !slot.teamId : true)
    );
  };

  // Check if date is a holiday
  const isHoliday = (date: string) => {
    return holidays.some(holiday =>
      holiday.date === date ||
      (holiday.isRecurring && holiday.date.slice(5) === date.slice(5))
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Schedule Management</h2>
          <p className="text-gray-600">Manage teams, bookings, and optimize routes across Niagara region</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowTeamModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Team
          </button>
          <button
            onClick={() => setShowBlockModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            🚫 Block Time
          </button>
          <button
            onClick={() => setShowHolidayModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            🎄 Add Holiday
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'calendar', label: 'Calendar View', icon: '📅' },
            { id: 'teams', label: 'Team Management', icon: '👥' },
            { id: 'routes', label: 'Route Optimization', icon: '🗺️' },
            { id: 'analytics', label: 'Schedule Analytics', icon: '📊' },
            { id: 'settings', label: 'Settings', icon: '⚙️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Calendar View */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          {/* Calendar Controls */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex bg-gray-100 rounded-lg p-1">
                {['month', 'week', 'day'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode as 'month' | 'week' | 'day')}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      viewMode === mode
                        ? 'bg-white text-blue-600 shadow'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Calendar Header */}
            <div className="grid grid-cols-8 border-b border-gray-200">
              <div className="p-3 bg-gray-50 text-sm font-medium text-gray-700">Team</div>
              {generateCalendarDays().slice(0, 7).map((date) => (
                <div key={date} className="p-3 bg-gray-50 text-sm font-medium text-gray-700 text-center">
                  <div>{new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <div>{new Date(date).getDate()}</div>
                </div>
              ))}
            </div>

            {/* Calendar Rows */}
            {teams.filter(team => team.isActive).map((team) => (
              <div key={team.id} className="grid grid-cols-8 border-b border-gray-100 hover:bg-gray-50">
                <div className="p-3 border-r border-gray-200 flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: team.color }}
                  />
                  <div>
                    <div className="font-medium text-sm">{team.name}</div>
                    <div className="text-xs text-gray-500">{team.serviceAreas.join(', ')}</div>
                  </div>
                </div>
                {generateCalendarDays().slice(0, 7).map((date) => {
                  const dayBookings = getBookingsForDateAndTeam(date, team.id);
                  const blocked = isDateBlocked(date, team.id);
                  const holiday = isHoliday(date);

                  return (
                    <div key={`${team.id}-${date}`} className="p-2 border-r border-gray-100 min-h-[80px]">
                      {holiday && (
                        <div className="text-xs bg-purple-100 text-purple-800 rounded px-1 py-0.5 mb-1">
                          Holiday
                        </div>
                      )}
                      {blocked && (
                        <div className="text-xs bg-red-100 text-red-800 rounded px-1 py-0.5 mb-1">
                          Blocked
                        </div>
                      )}
                      {dayBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="text-xs bg-blue-100 text-blue-800 rounded px-1 py-0.5 mb-1 cursor-pointer hover:bg-blue-200"
                          title={`${booking.customerName} - ${booking.serviceType} - ${booking.serviceTime}`}
                        >
                          {booking.serviceTime} - {booking.customerName.split(' ')[0]}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-100 rounded mr-1" />
              <span>Scheduled Booking</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-100 rounded mr-1" />
              <span>Blocked Time</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-100 rounded mr-1" />
              <span>Holiday</span>
            </div>
          </div>
        </div>
      )}

      {/* Team Management */}
      {activeTab === 'teams' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <div key={team.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: team.color }}
                    />
                    <h3 className="text-lg font-semibold">{team.name}</h3>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingTeam(team);
                        setNewTeam(team);
                        setShowTeamModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        const updatedTeams = teams.map(t =>
                          t.id === team.id ? { ...t, isActive: !t.isActive } : t
                        );
                        setTeams(updatedTeams);
                        scheduleService.updateTeams(updatedTeams);
                      }}
                      className={`text-sm ${team.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                    >
                      {team.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Team Members</h4>
                    <div className="text-sm text-gray-600">
                      {team.members.length > 0 ? team.members.join(', ') : 'No members assigned'}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Service Areas</h4>
                    <div className="flex flex-wrap gap-1">
                      {team.serviceAreas.map((area) => (
                        <span
                          key={area}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Status</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      team.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {team.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Today's Schedule</h4>
                    <div className="text-sm text-gray-600">
                      {getBookingsForDateAndTeam(selectedDate, team.id).length} bookings
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Route Optimization */}
      {activeTab === 'routes' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Route Optimization for {new Date(selectedDate).toLocaleDateString()}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {optimizeRoutes(selectedDate).map((route) => (
                <div key={route.area} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{route.area}</h4>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      Number.parseFloat(route.efficiency) > 2 ? 'bg-green-100 text-green-800' :
                      Number.parseFloat(route.efficiency) > 1 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {route.efficiency} efficiency
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bookings:</span>
                      <span className="font-medium">{route.bookings}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Teams:</span>
                      <span className="font-medium">{route.teams}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Travel:</span>
                      <span className="font-medium">{route.avgTravelTime} min</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Route Recommendations */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">🚀 Optimization Recommendations</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Consider grouping bookings in St. Catharines and Thorold for Team A</li>
                <li>• Niagara Falls and Welland can be efficiently served by Team B</li>
                <li>• Schedule buffer time of 30 minutes between distant locations</li>
                <li>• Peak efficiency achieved with 2-3 bookings per team per area</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Total Bookings Today</h3>
              <div className="text-2xl font-bold text-blue-600">
                {getBookingsForDateAndTeam(selectedDate).length}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Active Teams</h3>
              <div className="text-2xl font-bold text-green-600">
                {teams.filter(team => team.isActive).length}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Blocked Time Slots</h3>
              <div className="text-2xl font-bold text-red-600">
                {blockedSlots.filter(slot => slot.date === selectedDate).length}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Upcoming Holidays</h3>
              <div className="text-2xl font-bold text-purple-600">
                {holidays.filter(holiday => new Date(holiday.date) > new Date()).length}
              </div>
            </div>
          </div>

          {/* Team Utilization Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Team Utilization</h3>
            <div className="space-y-4">
              {teams.filter(team => team.isActive).map((team) => {
                const teamBookings = getBookingsForDateAndTeam(selectedDate, team.id).length;
                const maxBookings = 4; // Assume max 4 bookings per team per day
                const utilization = (teamBookings / maxBookings) * 100;

                return (
                  <div key={team.id} className="flex items-center">
                    <div className="w-24 text-sm font-medium">{team.name}</div>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${Math.min(utilization, 100)}%`,
                            backgroundColor: team.color
                          }}
                        />
                      </div>
                    </div>
                    <div className="w-16 text-sm text-gray-600">{utilization.toFixed(0)}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Settings */}
      {activeTab === 'settings' && scheduleSettings && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Schedule Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Booking Duration (minutes)
                </label>
                <input
                  type="number"
                  value={scheduleSettings.defaultBookingDuration}
                  onChange={(e) => setScheduleSettings({
                    ...scheduleSettings,
                    defaultBookingDuration: Number.parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buffer Time Between Bookings (minutes)
                </label>
                <input
                  type="number"
                  value={scheduleSettings.bufferTimeBetweenBookings}
                  onChange={(e) => setScheduleSettings({
                    ...scheduleSettings,
                    bufferTimeBetweenBookings: Number.parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Daily Bookings
                </label>
                <input
                  type="number"
                  value={scheduleSettings.maxDailyBookings}
                  onChange={(e) => setScheduleSettings({
                    ...scheduleSettings,
                    maxDailyBookings: Number.parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Advance Booking Days
                </label>
                <input
                  type="number"
                  value={scheduleSettings.advanceBookingDays}
                  onChange={(e) => setScheduleSettings({
                    ...scheduleSettings,
                    advanceBookingDays: Number.parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={() => scheduleService.updateScheduleSettings(scheduleSettings)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Team Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">{editingTeam ? 'Edit Team' : 'Add New Team'}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Team Name</label>
                <input
                  type="text"
                  value={newTeam.name || ''}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter team name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Team Color</label>
                <input
                  type="color"
                  value={newTeam.color || '#3B82F6'}
                  onChange={(e) => setNewTeam({ ...newTeam, color: e.target.value })}
                  className="w-20 h-10 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Areas</label>
                <div className="grid grid-cols-2 gap-2">
                  {NIAGARA_SERVICE_AREAS.map((area) => (
                    <label key={area.name} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newTeam.serviceAreas?.includes(area.name) || false}
                        onChange={(e) => {
                          const areas = newTeam.serviceAreas || [];
                          if (e.target.checked) {
                            setNewTeam({ ...newTeam, serviceAreas: [...areas, area.name] });
                          } else {
                            setNewTeam({ ...newTeam, serviceAreas: areas.filter(a => a !== area.name) });
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{area.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Team Members</label>
                <textarea
                  value={newTeam.members?.join(', ') || ''}
                  onChange={(e) => setNewTeam({
                    ...newTeam,
                    members: e.target.value.split(',').map(m => m.trim()).filter(m => m)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter member names separated by commas"
                  rows={3}
                />
              </div>
            </div>
            <div className="p-6 border-t flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowTeamModal(false);
                  setEditingTeam(null);
                  setNewTeam({
                    name: '',
                    members: [],
                    color: '#3B82F6',
                    serviceAreas: [],
                    isActive: true,
                    workingHours: {}
                  });
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTeam}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingTeam ? 'Update Team' : 'Add Team'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Time Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Block Time Slot</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Block Type</label>
                <select
                  value={blockType}
                  onChange={(e) => setBlockType(e.target.value as 'single' | 'range' | 'recurring')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="single">Single Date</option>
                  <option value="range">Date Range</option>
                  <option value="recurring">Recurring</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={blockData.startDate}
                  onChange={(e) => setBlockData({ ...blockData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {blockType === 'range' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={blockData.endDate}
                    onChange={(e) => setBlockData({ ...blockData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <input
                  type="text"
                  value={blockData.reason}
                  onChange={(e) => setBlockData({ ...blockData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Holiday, Maintenance, Team Unavailable"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Affected Team (Optional)</label>
                <select
                  value={blockData.teamId}
                  onChange={(e) => setBlockData({ ...blockData, teamId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Teams</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end space-x-3">
              <button
                onClick={() => setShowBlockModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBlockDate}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Block Time
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Holiday Modal */}
      {showHolidayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Add Holiday</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Holiday Name</label>
                <input
                  type="text"
                  value={newHoliday.name}
                  onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Christmas Day, New Year's Day"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={newHoliday.date}
                  onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newHoliday.isRecurring}
                    onChange={(e) => setNewHoliday({ ...newHoliday, isRecurring: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm">Recurring Annual Holiday</span>
                </label>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end space-x-3">
              <button
                onClick={() => setShowHolidayModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddHoliday}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Add Holiday
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminScheduling;
