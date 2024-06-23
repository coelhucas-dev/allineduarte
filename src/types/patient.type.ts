export type IPatient = {
    name: string,
    email: string,
    phone: string,
    country_code: string,
    birth_date: string
}

export interface IPatientResponse extends IPatient {
    id: string,
}