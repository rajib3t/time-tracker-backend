export interface ITimer {
    id?: number;
    user_id:number
    start_time:Date,
    end_time?:Date
    time_counter:number
    created_at?:Date
    updated_at?:Date
}
