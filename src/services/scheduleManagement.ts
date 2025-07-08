// Schedule Management Service for VIP Cleaning Squad
export interface TimeSlot {
  id: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:mm format
  duration: number; // minutes
  isBlocked: boolean;
  reason?: string; // "Holiday", "Maintenance", "Team Unavailable", "Fully Booked", etc.
  teamId?: string;
  customerId?: string;
  bookingId?: string;
  createdBy: string; // admin who created the block
  createdAt: string;
}

export interface OperatingHours {
  id: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  isOpen: boolean;
  openTime: string; // HH:mm
  closeTime: string; // HH:mm
  breakStart?: string; // HH:mm
  breakEnd?: string; // HH:mm
  maxBookingsPerHour: number;
}

export interface Team {
  id: string;
  name: string;
  members: string[];
  color: string; // for calendar display
  serviceAreas: string[];
  isActive: boolean;
  workingHours: {
    [key: number]: { // day of week
      start: string;
      end: string;
      isWorking: boolean;
    }
  };
}

export interface Holiday {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  isRecurring: boolean; // annual holidays
  affectedTeams: string[]; // empty array means all teams
  createdBy: string;
  createdAt: string;
}

export interface ScheduleSettings {
  defaultBookingDuration: number; // minutes
  bufferTimeBetweenBookings: number; // minutes
  advanceBookingDays: number; // how far in advance customers can book
  cancellationHours: number; // how many hours before service can be cancelled
  timeSlotInterval: number; // minutes between available slots (e.g., 30 min intervals)
  maxDailyBookings: number;
  emergencyServiceAvailable: boolean;
  emergencyServiceMultiplier: number; // price multiplier for emergency bookings
}

export class ScheduleManagementService {
  private static instance: ScheduleManagementService;

  static getInstance(): ScheduleManagementService {
    if (!ScheduleManagementService.instance) {
      ScheduleManagementService.instance = new ScheduleManagementService();
    }
    return ScheduleManagementService.instance;
  }

  // Time Slot Management
  getBlockedTimeSlots(): TimeSlot[] {
    try {
      const stored = localStorage.getItem('vip_blocked_timeslots');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  blockTimeSlot(timeSlot: Omit<TimeSlot, 'id' | 'createdAt'>): TimeSlot {
    const newTimeSlot: TimeSlot = {
      ...timeSlot,
      id: `block_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      createdAt: new Date().toISOString()
    };

    const existing = this.getBlockedTimeSlots();
    const updated = [...existing, newTimeSlot];
    localStorage.setItem('vip_blocked_timeslots', JSON.stringify(updated));

    return newTimeSlot;
  }

  unblockTimeSlot(timeSlotId: string): boolean {
    const existing = this.getBlockedTimeSlots();
    const updated = existing.filter(slot => slot.id !== timeSlotId);
    localStorage.setItem('vip_blocked_timeslots', JSON.stringify(updated));
    return true;
  }

  blockDateRange(startDate: string, endDate: string, reason: string, teamId?: string, createdBy = 'admin'): TimeSlot[] {
    const blockedSlots: TimeSlot[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];

      // Block entire day
      const dayBlock = this.blockTimeSlot({
        date: dateStr,
        time: '00:00',
        duration: 1440, // full day in minutes
        isBlocked: true,
        reason,
        teamId,
        createdBy
      });

      blockedSlots.push(dayBlock);
    }

    return blockedSlots;
  }

  // Operating Hours Management
  getOperatingHours(): OperatingHours[] {
    try {
      const stored = localStorage.getItem('vip_operating_hours');
      return stored ? JSON.parse(stored) : this.getDefaultOperatingHours();
    } catch {
      return this.getDefaultOperatingHours();
    }
  }

  updateOperatingHours(hours: OperatingHours[]): void {
    localStorage.setItem('vip_operating_hours', JSON.stringify(hours));
  }

  private getDefaultOperatingHours(): OperatingHours[] {
    return [
      { id: '0', dayOfWeek: 0, isOpen: false, openTime: '09:00', closeTime: '17:00', maxBookingsPerHour: 2 }, // Sunday
      { id: '1', dayOfWeek: 1, isOpen: true, openTime: '08:00', closeTime: '20:00', maxBookingsPerHour: 4 }, // Monday
      { id: '2', dayOfWeek: 2, isOpen: true, openTime: '08:00', closeTime: '20:00', maxBookingsPerHour: 4 }, // Tuesday
      { id: '3', dayOfWeek: 3, isOpen: true, openTime: '08:00', closeTime: '20:00', maxBookingsPerHour: 4 }, // Wednesday
      { id: '4', dayOfWeek: 4, isOpen: true, openTime: '08:00', closeTime: '20:00', maxBookingsPerHour: 4 }, // Thursday
      { id: '5', dayOfWeek: 5, isOpen: true, openTime: '08:00', closeTime: '19:00', maxBookingsPerHour: 4 }, // Friday
      { id: '6', dayOfWeek: 6, isOpen: true, openTime: '09:00', closeTime: '17:00', maxBookingsPerHour: 3 }, // Saturday
    ];
  }

  // Team Management
  getTeams(): Team[] {
    try {
      const stored = localStorage.getItem('vip_teams');
      return stored ? JSON.parse(stored) : this.getDefaultTeams();
    } catch {
      return this.getDefaultTeams();
    }
  }

  updateTeams(teams: Team[]): void {
    localStorage.setItem('vip_teams', JSON.stringify(teams));
  }

  private getDefaultTeams(): Team[] {
    return [
      {
        id: 'team_a',
        name: 'Team A',
        members: ['Sarah Johnson', 'Mike Rodriguez'],
        color: '#3B82F6',
        serviceAreas: ['St. Catharines', 'Niagara-on-the-Lake', 'Thorold'],
        isActive: true,
        workingHours: {
          1: { start: '08:00', end: '16:00', isWorking: true },
          2: { start: '08:00', end: '16:00', isWorking: true },
          3: { start: '08:00', end: '16:00', isWorking: true },
          4: { start: '08:00', end: '16:00', isWorking: true },
          5: { start: '08:00', end: '15:00', isWorking: true },
          6: { start: '09:00', end: '14:00', isWorking: true },
          0: { start: '10:00', end: '14:00', isWorking: false }
        }
      },
      {
        id: 'team_b',
        name: 'Team B',
        members: ['Jessica Chen', 'David Williams'],
        color: '#10B981',
        serviceAreas: ['Niagara Falls', 'Welland', 'Fort Erie'],
        isActive: true,
        workingHours: {
          1: { start: '10:00', end: '18:00', isWorking: true },
          2: { start: '10:00', end: '18:00', isWorking: true },
          3: { start: '10:00', end: '18:00', isWorking: true },
          4: { start: '10:00', end: '18:00', isWorking: true },
          5: { start: '10:00', end: '17:00', isWorking: true },
          6: { start: '11:00', end: '16:00', isWorking: true },
          0: { start: '12:00', end: '16:00', isWorking: false }
        }
      }
    ];
  }

  // Holiday Management
  getHolidays(): Holiday[] {
    try {
      const stored = localStorage.getItem('vip_holidays');
      return stored ? JSON.parse(stored) : this.getDefaultHolidays();
    } catch {
      return this.getDefaultHolidays();
    }
  }

  addHoliday(holiday: Omit<Holiday, 'id' | 'createdAt'>): Holiday {
    const newHoliday: Holiday = {
      ...holiday,
      id: `holiday_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      createdAt: new Date().toISOString()
    };

    const existing = this.getHolidays();
    const updated = [...existing, newHoliday];
    localStorage.setItem('vip_holidays', JSON.stringify(updated));

    // Auto-block the holiday date
    this.blockDateRange(holiday.date, holiday.date, `Holiday: ${holiday.name}`, undefined, holiday.createdBy);

    return newHoliday;
  }

  removeHoliday(holidayId: string): boolean {
    const existing = this.getHolidays();
    const updated = existing.filter(holiday => holiday.id !== holidayId);
    localStorage.setItem('vip_holidays', JSON.stringify(updated));
    return true;
  }

  private getDefaultHolidays(): Holiday[] {
    const currentYear = new Date().getFullYear();
    return [
      {
        id: 'new_year',
        name: 'New Year\'s Day',
        date: `${currentYear}-01-01`,
        isRecurring: true,
        affectedTeams: [],
        createdBy: 'system',
        createdAt: new Date().toISOString()
      },
      {
        id: 'christmas',
        name: 'Christmas Day',
        date: `${currentYear}-12-25`,
        isRecurring: true,
        affectedTeams: [],
        createdBy: 'system',
        createdAt: new Date().toISOString()
      }
    ];
  }

  // Schedule Settings
  getScheduleSettings(): ScheduleSettings {
    try {
      const stored = localStorage.getItem('vip_schedule_settings');
      return stored ? JSON.parse(stored) : this.getDefaultScheduleSettings();
    } catch {
      return this.getDefaultScheduleSettings();
    }
  }

  updateScheduleSettings(settings: ScheduleSettings): void {
    localStorage.setItem('vip_schedule_settings', JSON.stringify(settings));
  }

  private getDefaultScheduleSettings(): ScheduleSettings {
    return {
      defaultBookingDuration: 180, // 3 hours
      bufferTimeBetweenBookings: 30, // 30 minutes
      advanceBookingDays: 30, // 30 days in advance
      cancellationHours: 24, // 24 hours notice
      timeSlotInterval: 30, // 30-minute intervals
      maxDailyBookings: 8,
      emergencyServiceAvailable: true,
      emergencyServiceMultiplier: 1.5
    };
  }

  // Availability Checking
  isTimeSlotAvailable(date: string, time: string, duration = 180, teamId?: string): boolean {
    const blockedSlots = this.getBlockedTimeSlots();
    const operatingHours = this.getOperatingHours();
    const holidays = this.getHolidays();

    // Check if date is a holiday
    const dateObj = new Date(date);
    const isHoliday = holidays.some(holiday =>
      holiday.date === date &&
      (holiday.affectedTeams.length === 0 || (teamId && holiday.affectedTeams.includes(teamId)))
    );

    if (isHoliday) return false;

    // Check operating hours
    const dayOfWeek = dateObj.getDay();
    const operatingHour = operatingHours.find(oh => oh.dayOfWeek === dayOfWeek);

    if (!operatingHour || !operatingHour.isOpen) return false;

    // Check if time is within operating hours
    const requestedTime = new Date(`${date}T${time}:00`);
    const openTime = new Date(`${date}T${operatingHour.openTime}:00`);
    const closeTime = new Date(`${date}T${operatingHour.closeTime}:00`);
    const endTime = new Date(requestedTime.getTime() + duration * 60000);

    if (requestedTime < openTime || endTime > closeTime) return false;

    // Check blocked time slots
    const isBlocked = blockedSlots.some(slot => {
      if (slot.date !== date) return false;
      if (teamId && slot.teamId && slot.teamId !== teamId) return false;

      const slotStart = new Date(`${slot.date}T${slot.time}:00`);
      const slotEnd = new Date(slotStart.getTime() + slot.duration * 60000);

      // Check for overlap
      return (requestedTime < slotEnd && endTime > slotStart);
    });

    return !isBlocked;
  }

  // Get available time slots for a specific date
  getAvailableTimeSlots(date: string, teamId?: string): string[] {
    const settings = this.getScheduleSettings();
    const operatingHours = this.getOperatingHours();
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();

    const operatingHour = operatingHours.find(oh => oh.dayOfWeek === dayOfWeek);
    if (!operatingHour || !operatingHour.isOpen) return [];

    const availableSlots: string[] = [];
    const openTime = new Date(`${date}T${operatingHour.openTime}:00`);
    const closeTime = new Date(`${date}T${operatingHour.closeTime}:00`);

    let currentTime = new Date(openTime);

    while (currentTime.getTime() + settings.defaultBookingDuration * 60000 <= closeTime.getTime()) {
      const timeStr = currentTime.toTimeString().substring(0, 5);

      if (this.isTimeSlotAvailable(date, timeStr, settings.defaultBookingDuration, teamId)) {
        availableSlots.push(timeStr);
      }

      currentTime = new Date(currentTime.getTime() + settings.timeSlotInterval * 60000);
    }

    return availableSlots;
  }
}

export default ScheduleManagementService;
