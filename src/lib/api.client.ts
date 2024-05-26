import axios, { AxiosResponse } from "axios";
import { env } from "./env";
import { cache } from "react";
import { ISchedule, IClinic } from "@/types";

export const axiosClient = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 10000,
});

export const fetchClinicsApi = cache(async (): Promise<IClinic[]> => {
  const res: AxiosResponse<IClinic[]> = await axiosClient.get("/clinic");
  return res.data;
});

export const scheduleAppointmentApi = async (
  req: ISchedule,
): Promise<{
  message: string;
  response: any;
}> => {
  const res: AxiosResponse = await axiosClient.post(
    "/appointment/schedule/",
    req,
  );
  return {
    message: res.data,
    response: "Success on creating appointment",
  };
};
