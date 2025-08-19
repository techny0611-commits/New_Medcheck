// User Types
export interface User {
  _id?: string;
  email: string;
  name: string;
  role: 'admin' | 'tester';
  createdAt: Date;
  supabaseUserId?: string; // Link to Supabase auth user
}

// Event Types
export interface Event {
  _id?: string;
  organizationName: string;
  eventDate: Date;
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
  minimumParticipants: number;
  testDuration: number; // in minutes
  breakDuration: number; // in minutes between tests
  customBreaks: CustomBreak[];
  relevantIssues: string[]; // Health issues that allow direct scheduling
  
  // Registration page settings
  eventPassword: string;
  marketingMessage: string;
  colorPalette: ColorPalette;
  iconName: string;
  bannerImage?: string; // Base64 encoded image
  
  // Status and metadata
  status: 'preparing' | 'planned' | 'cancelled' | 'postponed' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User ID
  
  // Registration link
  registrationLink: string;
}

export interface CustomBreak {
  startTime: string; // "12:00"
  endTime: string;   // "13:00"
  title: string;     // "Lunch Break"
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

// Time Slot Types
export interface TimeSlot {
  _id?: string;
  eventId: string;
  startTime: string; // "09:00"
  endTime: string;   // "09:30"
  slotType: 'available' | 'occupied' | 'break';
  participantId?: string; // Employee ID when occupied
  createdAt: Date;
}

// Employee/Participant Types
export interface Employee {
  _id?: string;
  eventId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  hasRelevantIssues: boolean; // If they checked any relevant health issues
  relevantIssuesSelected: string[]; // Which specific issues they selected
  
  // Status in event
  status: 'registered' | 'scheduled' | 'waiting' | 'tested' | 'no_show';
  timeSlotId?: string; // If scheduled
  registrationDate: Date;
  
  // Test results (if tested)
  testResults?: TestResults;
}

export interface TestResults {
  medicalResults: string; // Free text medical findings
  businessDetails: string; // Free text business details
  transactionAmount: number;
  attachedFiles: AttachedFile[]; // Images or PDFs
  testedBy: string; // User ID of tester
  testDate: Date;
}

export interface AttachedFile {
  filename: string;
  contentType: string;
  data: string; // Base64 encoded file data
  size: number;
}

// System Settings Types
export interface SystemSettings {
  _id?: string;
  systemName: string;
  logo?: string; // Base64 encoded logo
  
  // Menu design settings
  menuColorPalette: ColorPalette;
  logoPosition: 'left' | 'center' | 'right';
  backgroundImage?: string; // Base64 encoded background
  
  // Email settings
  emailProvider: 'gmail' | 'sendgrid' | 'resend';
  emailSettings: EmailSettings;
  
  updatedAt: Date;
  updatedBy: string; // User ID
}

export interface EmailSettings {
  // Gmail settings
  gmail?: {
    email: string;
    appPassword: string;
  };
  // Other providers can be added here
}

// Report Types
export interface MonthlyActivityReport {
  year: number;
  month: number;
  totalEvents: number;
  totalRegistered: number;
  totalTested: number;
  totalRevenue: number;
  testToSaleRatio: number; // percentage
  averageTransactionAmount: number;
  eventsByStatus: {
    preparing: number;
    planned: number;
    completed: number;
    cancelled: number;
    postponed: number;
  };
}

export interface EventEmployeeReport {
  eventId: string;
  eventName: string;
  eventDate: Date;
  employees: {
    fullName: string;
    email: string;
    organizationName: string;
    wasTested: boolean;
    transactionAmount: number;
    medicalResults?: string;
    businessDetails?: string;
  }[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Dashboard Statistics
export interface DashboardStats {
  currentMonth: {
    totalEvents: number;
    completedEvents: number;
    upcomingEvents: number;
    totalRevenue: number;
    averageTransaction: number;
    testToSaleRatio: number;
  };
  recentEvents: Array<{
    _id: string;
    organizationName: string;
    eventDate: Date;
    status: Event['status'];
    totalRegistered: number;
    totalTested: number;
    totalWaiting: number;
    totalRevenue: number;
  }>;
}