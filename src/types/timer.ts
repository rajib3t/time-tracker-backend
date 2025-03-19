export interface IDailyTimeRecord {
    id?: number;
    user_id: number;
    date: Date;
    total_seconds: number;
    first_start_time: Date;
    last_end_time?: Date;
    
  }
  
  export interface ITimeSegment {
    id?: number;
    daily_record_id: number;
    start_time: Date;
    end_time?: Date;
    duration_seconds?: number;
    status: 'active' | 'paused' | 'completed';
  }
  
  export interface ITimerEvent {
    id?: number;
    user_id: number;
    event_type: 'start' | 'update' | 'end' | 'pause' | 'resume';
    timestamp: Date;
    elapsed_time?: number;
    segment_id?: number;
  }