import User from "../../models/user.model";
import Timer from "../../models/timer.mode";  // Import the Timer model
import { ITimer } from "../../types/timer";
import { IUser } from "../../types/user";
import { literal } from "sequelize";
import httpStatus from 'http-status';
class TimerService {
    public async startTimer(user: IUser, timer: ITimer) {
        try {
            // User.timers is an association, not a direct array that has methods like findOne
            // Need to use the proper Sequelize methods to find or create a timer
            const existingTimer = await Timer.findOne({
                where: {
                    id: timer.id,
                    user_id: user.id,
                    start_time: literal('DATE(start_time) = CURRENT_DATE')
                }
            });

            if (existingTimer) {
                return existingTimer;
            }

            // Create a new timer associated with this user
            const newTimer = await Timer.create({
                ...timer,
                user_id: user.id as number,

            });

            return newTimer;
        } catch (error) {
            console.error("Error starting timer:", error);
            throw error;
        }
    }

    public async updateTimeCount(user: IUser, timerId: number, timeCount: number) {
        try {
          // Find the timer belonging to this user
          const timer = await Timer.findOne({
            where: {
              id: timerId,
              user_id: user.id
            }
          });
      
          if (!timer) {
            const error = Error("Timer not found or doesn't belong to this user");
            (error as any).statusCode = httpStatus.CONFLICT;
            throw error;
          }
      
          // Update the time count
          await timer.update({ time_counter: timeCount });
      
          return timer;
        } catch (error) {
            if ((error as any).statusCode) {
                throw error;
            }
            throw new Error(
              `Error updating time count: ${(error as any).message}`
);
        }
      }


      public async endTimer(user: IUser, timerId: number) {
        try {
          // Find the timer belonging to this user
          const timer = await Timer.findOne({
            where: {
              id: timerId,
              user_id: user.id
            }
          });
      
          if (!timer) {
            const error = Error("Timer not found or doesn't belong to this user");
            (error as any).statusCode = httpStatus.NOT_FOUND;
            throw error;
          }
      
          // Check if timer is already ended
          if (timer.end_time) {
            const error = Error("Timer has already been ended");
            (error as any).statusCode = httpStatus.CONFLICT;
            throw error;
          }
      
          // Update the end time to current time
          await timer.update({ 
            end_time: new Date(),
    
          });
      
          return timer;
        } catch (error) {
          if ((error as any).statusCode) {
            throw error;
          }
          throw new Error(`Error ending timer: ${(error as any).message}`);
        }
      }
}

export default TimerService;