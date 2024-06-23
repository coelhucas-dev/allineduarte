import axios, { AxiosResponse } from "axios";
import { cache } from "react";
import { env } from "./env";
import { ISchedule, IClinic, IPatient, IPatientResponse } from "@/types";

const defaultHeaders = {
  Authorization: `Basic ${btoa(
    `${env.TECH_USER_USERNAME}:${env.TECH_USER_PASSWORD}`,
  )}`,
};

export const axiosClient = axios.create({
  baseURL: process.env.API_BASE_URL,
  timeout: 10000,
  headers: defaultHeaders,
});

export const fetchClinicsApi = cache(async (): Promise<IClinic[]> => {
  const res: AxiosResponse<IClinic[]> = await axiosClient.get("/clinic/");
  return res.data;
});

export const createPatientApi = async (
  req: IPatient,
): Promise<{
  message: string;
  response: IPatientResponse;
}> => {
  const res: AxiosResponse<IPatientResponse> = await axiosClient.post(
    "/patient/",
    req,
  );
  return {
    message: "Success on creating patient",
    response: res.data,
  };
};

export const getScheduledApi = async (): Promise<{
  message: string;
  response: any;
}> => {
  const res: AxiosResponse = await axiosClient.get(
    "/appointment/get_scheduled/",
  );

  return {
    message: "Success on getting scheduled appointments",
    response: res.data,
  };
};

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
    message: "Success on creating appointment",
    response: res.data,
  };
};
