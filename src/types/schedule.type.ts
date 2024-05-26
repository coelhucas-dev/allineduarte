import { IPlan } from ".";
import { IAppointment } from "./appointment.type";

export type IScheduled = {
  appointment: IAppointment;
  plan: IPlan;
  scheduled_time: {
    day: null;
    hour: null;
  };
};

export type IGetScheduledResponse = {
  scheduled: IScheduled[];
};

export type ISchedule = {
  clinic: string;
  plan: string;
  time: Date;
};
