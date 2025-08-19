import { MongoClient, Db, GridFSBucket } from 'mongodb';

let client: MongoClient;
let db: Db;
let bucket: GridFSBucket;

export async function connectToMongoDB(uri?: string): Promise<Db> {
  if (db) {
    return db;
  }

  const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/webapp';
  
  try {
    client = new MongoClient(mongoUri);
    await client.connect();
    
    // Extract database name from URI or use default
    const dbName = mongoUri.split('/').pop()?.split('?')[0] || 'webapp';
    db = client.db(dbName);
    
    // Initialize GridFS bucket for file storage
    bucket = new GridFSBucket(db, { bucketName: 'files' });
    
    console.log('Connected to MongoDB successfully');
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export function getDB(): Db {
  if (!db) {
    throw new Error('Database not initialized. Call connectToMongoDB first.');
  }
  return db;
}

export function getGridFSBucket(): GridFSBucket {
  if (!bucket) {
    throw new Error('GridFS bucket not initialized. Call connectToMongoDB first.');
  }
  return bucket;
}

export async function closeMongoDB(): Promise<void> {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Helper function to generate unique registration links
export function generateRegistrationLink(eventId: string): string {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/register/${eventId}`;
}

// Helper function to generate time slots for an event
export function generateTimeSlots(
  eventDate: Date,
  startTime: string,
  endTime: string,
  testDuration: number,
  breakDuration: number,
  customBreaks: Array<{ startTime: string; endTime: string; title: string }>
): Array<{
  startTime: string;
  endTime: string;
  slotType: 'available' | 'break';
}> {
  const slots: Array<{
    startTime: string;
    endTime: string;
    slotType: 'available' | 'break';
  }> = [];

  // Convert time strings to minutes from midnight for easier calculation
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  // Create custom break ranges for easy lookup
  const customBreakRanges = customBreaks.map(cb => ({
    start: timeToMinutes(cb.startTime),
    end: timeToMinutes(cb.endTime),
    title: cb.title
  }));

  let currentTime = startMinutes;

  while (currentTime < endMinutes) {
    const slotEndTime = currentTime + testDuration;
    
    // Check if this slot overlaps with any custom break
    const isInBreak = customBreakRanges.some(breakRange => 
      (currentTime >= breakRange.start && currentTime < breakRange.end) ||
      (slotEndTime > breakRange.start && slotEndTime <= breakRange.end) ||
      (currentTime < breakRange.start && slotEndTime > breakRange.end)
    );

    if (isInBreak) {
      // Find the break that contains this time
      const containingBreak = customBreakRanges.find(breakRange => 
        currentTime >= breakRange.start && currentTime < breakRange.end
      );
      
      if (containingBreak) {
        // Add break slot
        slots.push({
          startTime: minutesToTime(containingBreak.start),
          endTime: minutesToTime(containingBreak.end),
          slotType: 'break'
        });
        currentTime = containingBreak.end;
      } else {
        currentTime += testDuration;
      }
    } else {
      // Check if slot would end after event end time
      if (slotEndTime > endMinutes) {
        break;
      }

      // Add available slot
      slots.push({
        startTime: minutesToTime(currentTime),
        endTime: minutesToTime(slotEndTime),
        slotType: 'available'
      });

      currentTime = slotEndTime + breakDuration;
    }
  }

  return slots;
}