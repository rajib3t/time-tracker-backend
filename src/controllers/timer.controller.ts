import { Controller } from "./controller"
import { Request, Response } from "express";
import AsyncHandler from '../exceptions/asynchandler';
import { authMiddleware, AuthRequest } from "../middlewares/auth.middleware";
import httpStatus from 'http-status';
import DailyTimeRecord from '../models/daily-time-record.model';
import TimeSegment from '../models/time-segment.model';
import TimerEvent from '../models/timer-event.model';
import { Op } from 'sequelize';

class TimerController extends Controller {
    constructor() {
        super();
        this.initRoutes();
    }

    private initRoutes(): void {
        this.router.post('/start', authMiddleware, AsyncHandler.handle(this.startTimer.bind(this)));
        this.router.post('/pause', authMiddleware, AsyncHandler.handle(this.pauseTimer.bind(this)));
        this.router.post('/resume', authMiddleware, AsyncHandler.handle(this.resumeTimer.bind(this)));
        this.router.post('/end', authMiddleware, AsyncHandler.handle(this.endTimer.bind(this)));
        this.router.post('/update', authMiddleware, AsyncHandler.handle(this.updateTimer.bind(this)));
        this.router.get('/daily', authMiddleware, AsyncHandler.handle(this.getDailyRecord.bind(this)));
        this.router.get('/segments', authMiddleware, AsyncHandler.handle(this.getTimeSegments.bind(this)));
    }

    private async startTimer(req: Request, res: Response): Promise<void> {
        const authReq = req as AuthRequest;
        const userId = authReq.user?.user_id;
        
        if (!userId) {
            res.status(httpStatus.UNAUTHORIZED).json({
                success: false,
                message: 'User not authenticated'
            });
            return;
        }
    
        // Get or create daily record for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let dailyRecord = await DailyTimeRecord.findOne({
            where: {
                user_id: userId,
                date: today
            }
        });
    
        const now = new Date();
        const timeString = now.toTimeString().split(' ')[0];
    
        if (!dailyRecord) {
            dailyRecord = await DailyTimeRecord.create({
                user_id: userId,
                date: today,
                first_start_time: timeString,
                total_seconds: 0
            });
        }
    
        // Check for existing active or paused time segment
        const existingSegment = await TimeSegment.findOne({
            where: {
                status: {
                    [Op.in]: ['active', 'paused']
                },
                end_time: null
            },
            include: [{
                model: DailyTimeRecord,
                as: 'dailyRecord',
                where: { user_id: userId }
            }]
        });
    
        let timeSegment;
        if (existingSegment) {
            timeSegment = existingSegment;
        } else {
            timeSegment = await TimeSegment.create({
                daily_record_id: dailyRecord.id,
                start_time: now,
                status: 'active'
            });
        }
        
        // Log the timer event
        await TimerEvent.create({
            user_id: userId,
            event_type: 'start',
            timestamp: now,
            elapsed_time: 0,
            segment_id: timeSegment.id
        });
    
        res.status(httpStatus.OK).json({
            success: true,
            message: 'Timer started successfully',
            data: { 
                segmentId: timeSegment.id,
                startTime: now 
            }
        });
    }

    private async pauseTimer(req: Request, res: Response): Promise<void> {
        const authReq = req as AuthRequest;
        const userId = authReq.user?.user_id;
        
        if (!userId) {
            res.status(httpStatus.UNAUTHORIZED).json({
                success: false,
                message: 'User not authenticated'
            });
            return;
        }

        // Find the active segment
        const activeSegment = await TimeSegment.findOne({
            where: {
                status: 'active',
                end_time: null
            },
            include: [{
                model: DailyTimeRecord,
                as: 'dailyRecord',
                where: { user_id: userId }
            }]
        });

        if (!activeSegment) {
            res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: 'No active timer found'
            });
            return;
        }

        const now = new Date();
        const elapsedSeconds = Math.floor((now.getTime() - activeSegment.start_time.getTime()) / 1000);

        // Update the segment status
        await activeSegment.update({
            status: 'paused'
        });

        // Log the timer event
        await TimerEvent.create({
            user_id: userId,
            event_type: 'pause',
            timestamp: now,
            elapsed_time: elapsedSeconds,
            segment_id: activeSegment.id
        });

        res.status(httpStatus.OK).json({
            success: true,
            message: 'Timer paused successfully',
            data: { 
                segmentId: activeSegment.id,
                elapsedTime: elapsedSeconds 
            }
        });
    }

    private async resumeTimer(req: Request, res: Response): Promise<void> {
        const authReq = req as AuthRequest;
        const userId = authReq.user?.user_id;
        
        if (!userId) {
            res.status(httpStatus.UNAUTHORIZED).json({
                success: false,
                message: 'User not authenticated'
            });
            return;
        }

        // Find the paused segment
        const pausedSegment = await TimeSegment.findOne({
            where: {
                status: 'paused',
                end_time: null
            },
            include: [{
                model: DailyTimeRecord,
                as: 'dailyRecord',
                where: { user_id: userId }
            }]
        });

        if (!pausedSegment) {
            res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: 'No paused timer found'
            });
            return;
        }

        const now = new Date();

        // Update the segment status
        await pausedSegment.update({
            status: 'active'
        });

        // Calculate total elapsed time so far
        const events = await TimerEvent.findAll({
            where: {
                segment_id: pausedSegment.id
            },
            order: [['timestamp', 'ASC']]
        });

        let totalElapsed = 0;
        if (events.length > 0) {
            const lastEvent = events[events.length - 1];
            totalElapsed = lastEvent.elapsed_time || 0;
        }

        // Log the timer event
        await TimerEvent.create({
            user_id: userId,
            event_type: 'resume',
            timestamp: now,
            elapsed_time: totalElapsed,
            segment_id: pausedSegment.id
        });

        res.status(httpStatus.OK).json({
            success: true,
            message: 'Timer resumed successfully',
            data: { 
                segmentId: pausedSegment.id,
                resumeTime: now 
            }
        });
    }

    private async endTimer(req: Request, res: Response): Promise<void> {
        const authReq = req as AuthRequest;
        const userId = authReq.user?.user_id;
        
        if (!userId) {
            res.status(httpStatus.UNAUTHORIZED).json({
                success: false,
                message: 'User not authenticated'
            });
            return;
        }

        // Find the active or paused segment
        const segment = await TimeSegment.findOne({
            where: {
                status: {
                    [Op.in]: ['active', 'paused']
                },
                end_time: null
            },
            include: [{
                model: DailyTimeRecord,
                as: 'dailyRecord',
                where: { user_id: userId }
            }]
        });

        if (!segment) {
            res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: 'No active timer found'
            });
            return;
        }

        const now = new Date();
        const timeString = now.toTimeString().split(' ')[0];
        
        // Calculate duration in seconds
        const durationSeconds = Math.floor((now.getTime() - segment.start_time.getTime()) / 1000);

        // Update the segment
        await segment.update({
            end_time: now,
            duration_seconds: durationSeconds,
            status: 'completed'
        });

        // Log the timer event
        await TimerEvent.create({
            user_id: userId,
            event_type: 'end',
            timestamp: now,
            elapsed_time: durationSeconds,
            segment_id: segment.id
        });

        // Update the daily record
        const dailyRecord = await DailyTimeRecord.findByPk(segment.daily_record_id);
        if (dailyRecord) {
            // Calculate total seconds for the day
            const totalSeconds = await TimeSegment.sum('duration_seconds', {
                where: {
                    daily_record_id: dailyRecord.id,
                    status: 'completed'
                }
            }) || 0;

            await dailyRecord.update({
                last_end_time: timeString,
                total_seconds: totalSeconds
            });
        }

        res.status(httpStatus.OK).json({
            success: true,
            message: 'Timer ended successfully',
            data: { 
                segmentId: segment.id,
                duration: durationSeconds,
                totalDailySeconds: dailyRecord?.total_seconds
            }
        });
    }

    private async updateTimer(req: Request, res: Response): Promise<void> {
        const authReq = req as AuthRequest;
        const userId = authReq.user?.user_id;
        
        if (!userId) {
            res.status(httpStatus.UNAUTHORIZED).json({
                success: false,
                message: 'User not authenticated'
            });
            return;
        }

        // Find the active segment
        const activeSegment = await TimeSegment.findOne({
            where: {
                status: 'active',
                end_time: null
            },
            include: [{
                model: DailyTimeRecord,
                as: 'dailyRecord',
                where: { user_id: userId }
            }]
        });

        if (!activeSegment) {
            res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: 'No active timer found'
            });
            return;
        }

        const now = new Date();
        const elapsedSeconds = Math.floor((now.getTime() - activeSegment.start_time.getTime()) / 1000);

        // Log the timer event
        await TimerEvent.create({
            user_id: userId,
            event_type: 'update',
            timestamp: now,
            elapsed_time: elapsedSeconds,
            segment_id: activeSegment.id
        });

        res.status(httpStatus.OK).json({
            success: true,
            message: 'Timer updated successfully',
            data: { 
                segmentId: activeSegment.id,
                elapsedTime: elapsedSeconds 
            }
        });
    }

    private async getDailyRecord(req: Request, res: Response): Promise<void> {
        const authReq = req as AuthRequest;
        const userId = authReq.user?.user_id;
        
        if (!userId) {
            res.status(httpStatus.UNAUTHORIZED).json({
                success: false,
                message: 'User not authenticated'
            });
            return;
        }

        const date = req.query.date ? new Date(req.query.date as string) : new Date();
        date.setHours(0, 0, 0, 0);

        const dailyRecord = await DailyTimeRecord.findOne({
            where: {
                user_id: userId,
                date: date
            }
        });

        if (!dailyRecord) {
            res.status(httpStatus.OK).json({
                success: true,
                message: 'No time record found for this date',
                data: null
            });
            return;
        }

        // Format the response to match the screenshot format
        const formattedHours = Math.floor(dailyRecord.total_seconds / 3600);
        const formattedMinutes = Math.floor((dailyRecord.total_seconds % 3600) / 60);
        const timeWorked = `${formattedHours}h ${formattedMinutes}m`;

        // Format the time strings
        const startTime = dailyRecord.first_start_time ? 
            new Date(`1970-01-01T${dailyRecord.first_start_time}`).toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit', 
                hour12: true 
            }) : null;
            
        const endTime = dailyRecord.last_end_time ? 
            new Date(`1970-01-01T${dailyRecord.last_end_time}`).toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit', 
                hour12: true 
            }) : null;

        res.status(httpStatus.OK).json({
            success: true,
            message: 'Daily time record retrieved successfully',
            data: {
                date: dailyRecord.date,
                timeWorked: timeWorked,
                startTime: startTime,
                endTime: endTime,
                totalSeconds: dailyRecord.total_seconds
            }
        });
    }

    private async getTimeSegments(req: Request, res: Response): Promise<void> {
        const authReq = req as AuthRequest;
        const userId = authReq.user?.user_id;
        
        if (!userId) {
            res.status(httpStatus.UNAUTHORIZED).json({
                success: false,
                message: 'User not authenticated'
            });
            return;
        }

        const date = req.query.date ? new Date(req.query.date as string) : new Date();
        date.setHours(0, 0, 0, 0);

        // Get the daily record for this date
        const dailyRecord = await DailyTimeRecord.findOne({
            where: {
                user_id: userId,
                date: date
            }
        });

        if (!dailyRecord) {
            res.status(httpStatus.OK).json({
                success: true,
                message: 'No time record found for this date',
                data: []
            });
            return;
        }

        // Get all segments for this daily record
        const segments = await TimeSegment.findAll({
            where: {
                daily_record_id: dailyRecord.id
            },
            order: [['start_time', 'ASC']]
        });

        // Format segments for hourly blocks display (as in the screenshot)
        const hourlyBlocks = [];
        for (let hour = 0; hour <= 23; hour++) { // 7 AM to 7 PM
            const hourLabel = hour > 12 ? `${hour-12} PM` : hour === 12 ? '12 PM' : `${hour} AM`;
            
            // Filter segments that fall within this hour
            const hourStart = new Date(date);
            hourStart.setHours(hour, 0, 0, 0);
            
            const hourEnd = new Date(date);
            hourEnd.setHours(hour + 1, 0, 0, 0);
            
            // Find segments that overlap with this hour
            const hourSegments = segments.filter(segment => {
                const segStart = new Date(segment.start_time);
                const segEnd = segment.end_time ? new Date(segment.end_time) : new Date();
                
                return (segStart < hourEnd && segEnd > hourStart);
            });
            
            // Format segments within this hour
            const blocks = hourSegments.map(segment => {
                const segStart = new Date(segment.start_time);
                const segEnd = segment.end_time ? new Date(segment.end_time) : new Date();
                
                // Clip to hour boundaries
                const blockStart = segStart < hourStart ? hourStart : segStart;
                const blockEnd = segEnd > hourEnd ? hourEnd : segEnd;
                
                return {
                    start: blockStart.toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit', 
                        hour12: true 
                    }),
                    end: blockEnd.toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit', 
                        hour12: true 
                    }),
                    duration: (blockEnd.getTime() - blockStart.getTime()) / 1000 / 60, // in minutes
                }
            });
            
            hourlyBlocks.push({
                hour: hourLabel,
                blocks: blocks
            });
        }

        res.status(httpStatus.OK).json({
            success: true,
            message: 'Time segments retrieved successfully',
            data: hourlyBlocks
        });
    }
}

export default new TimerController().router;