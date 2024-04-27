import { IPlan } from ".";

export type IClinic = {
  id: number;
  name: string;
  title: string;
  address1: string;
  address2: string;
  city: string;
  country_code: string;
  maps_link: string;
  phone: string;
  plans: IPlan;
};
