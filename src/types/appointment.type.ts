import { IClinic, IPlan } from ".";

export type IAppointment = {
  clinic: IClinic;
  plan: IPlan;
  time: null;
  confirmed: boolean;
};
