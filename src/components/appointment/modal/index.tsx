"use client";
import { I18nProvider, useLocale } from "@react-aria/i18n";
import {
  Button,
  Input,
  DatePicker,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
  Select,
  SelectItem,
} from "@nextui-org/react";
import {
  today,
  isWeekend,
  getDayOfWeek,
  getLocalTimeZone,
  DateValue,
  isSameDay,
  parseAbsolute,
} from "@internationalized/date";
import { ChangeEvent, useEffect, useState } from "react";
import { IClinic, IPlan, IScheduled } from "@/types";

const countryCodes = [
  {
    key: "br",
    code: "+55",
    country: "Brasil",
  },
];

interface IHour {
  hour: number;
  minute: number;
  disabled: boolean;
}

interface LocalCache {
  clinics: {
    [key: string | number]: IClinic;
  };
  appointments: IScheduled[];
}

export default function AppointmentModal() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [clinicsLoading, setClinicsLoading] = useState(true);
  const [currentClinic, setCurrentClinic] = useState<IClinic | null>();
  const [clinics, setClinics] = useState<IClinic[]>([]);

  const [planInputDisabled, setPlanInputDisabled] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<IPlan | null>();

  const [hourInputDisabled, setHourInputDisabled] = useState(true);
  const [availableHours, setAvailableHours] = useState<IHour[]>([]);

  const [appointmentDateDisabled, setAppointmentDateDisabled] = useState(true);
  const [appointments, setAppointments] = useState<IScheduled[]>([]);

  const [localCache, setLocalCache] = useState<LocalCache>({
    clinics: {},
    appointments: [],
  });

  const [plans, setPlans] = useState<IPlan[]>([]);

  const { locale } = useLocale();

  useEffect(() => {
    fetch("http://localhost:8000/clinic")
      .then((res) => res.json())
      .then((data) => {
        setClinics(data);
        setClinicsLoading(false);
      });
  }, []);

  const isDateUnavailable = (date: DateValue) => {
    if (currentClinic == null) {
      return true;
    }
    return (
      isWeekend(date, locale) ||
      !currentClinic.clinic_hours.some(
        (clinicHour) => getDayOfWeek(date, locale) - 1 == clinicHour.day_of_week
      )
    );
  };

  const loadClinicAvailablePlans = (clinic: IClinic) => {
    if (localCache.clinics[clinic.id]) {
      setPlans(localCache.clinics[clinic.id].plans);
      setPlanInputDisabled(false);
      return;
    }
    setPlans(clinic.plans);

    if (plans) setPlanInputDisabled(false);
  };

  const fetchAppointments = async () => {
    fetch("http://localhost:8000/appointment/get_scheduled/")
      .then((res) => res.json())
      .then((data) => {
        setAppointments(data.scheduled);
      });

    if (appointments) {
      setAppointmentDateDisabled(false);
    }
  };

  const isEqualHour = (localHour: IHour, unavailableHour: IHour): boolean => {
    return (
      localHour.hour === unavailableHour.hour &&
      localHour.minute === unavailableHour.minute
    );
  };

  const isHourUnavailable = (
    localHour: IHour,
    unavailableHours: IHour[]
  ): boolean => {
    return unavailableHours.some((unavailableHour: IHour) => {
      return isEqualHour(localHour, unavailableHour);
    });
  };

  const loadAvailableHours = (date: DateValue) => {
    if (!currentClinic) {
      setAvailableHours([]);
      setHourInputDisabled(true);
      return;
    }
    let unavailableHours: IHour[] = [];
    appointments.map((appointment: IScheduled) => {
      let appointmentTime = parseAbsolute(
        new Date(appointment.appointment.time).toISOString(),
        getLocalTimeZone()
      );
      if (isSameDay(appointmentTime, date)) {
        unavailableHours.push({
          hour: appointmentTime.hour,
          minute: appointmentTime.minute,
          disabled: true,
        });
      }
    });

    let clinicHour = currentClinic?.clinic_hours.find(
      (clinicHour) => getDayOfWeek(date, locale) - 1 == clinicHour.day_of_week
    );

    if (!clinicHour) {
      setAvailableHours([]);
      setHourInputDisabled(true);
      return;
    }

    let localTime = {
      hour: parseInt(clinicHour.opening_time.split(":")[0]),
      minute: parseInt(clinicHour.opening_time.split(":")[1]),
      disabled: false,
    };
    let closingTime = {
      hour: parseInt(clinicHour.closing_time.split(":")[0]),
      minute: parseInt(clinicHour.closing_time.split(":")[1]),
      disabled: false,
    };
    let hours: IHour[] = [];
    console.log(unavailableHours);
    while (
      localTime.hour < closingTime.hour &&
      (localTime.minute < closingTime.minute ||
        localTime.hour < closingTime.hour)
    ) {
      if (isHourUnavailable(localTime, unavailableHours)) {
        hours.push({
          hour: localTime.hour,
          minute: localTime.minute,
          disabled: true,
        });
      } else {
        hours.push({
          hour: localTime.hour,
          minute: localTime.minute,
          disabled: false,
        });
      }
      localTime.hour++;
    }
    setAvailableHours(hours);
    setHourInputDisabled(false);
  };

  const handleAppointmentDateChange = (date: DateValue) => {
    loadAvailableHours(date);
  };

  const handlePlanSelectChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const plan = plans.find((plan) => {
      if (!e.target.value) return false;
      return JSON.parse(e.target.value) == plan.id;
    });
    if (!plan) {
      setCurrentPlan(null);
      return;
    }
    setCurrentPlan(plan);
  };

  const handleClinicSelectChange = async (
    e: ChangeEvent<HTMLSelectElement>
  ) => {
    const clinic = clinics.find((clinic) => {
      if (!e.target.value) return false;
      return JSON.parse(e.target.value) == clinic.id;
    });

    if (!clinic) {
      setPlans([]);
      setAppointments([]);
      setAppointmentDateDisabled(true);
      setPlanInputDisabled(true);
      setCurrentClinic(null);
      return;
    }
    setCurrentClinic(clinic);
    loadClinicAvailablePlans(clinic);
    await fetchAppointments();
    setLocalCache({
      clinics: {
        ...localCache.clinics,
        [clinic.id]: clinic,
      },
      appointments: appointments,
    });
  };

  const formatToClockFormat = (hours: number, minutes: number): string => {
    const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${formattedHours}:${formattedMinutes}`;
  };

  const handleSubmitAppointment = () => {
    console.log({
      clinic: currentClinic,
      plan: currentPlan,
    });
  };

  return (
    <>
      <Button
        onPress={onOpen}
        className="px-8 py-4 text-[13px] text-white font-black bg-gradient-to-r from-[#268a7b] to-[#0defca] hover:shadow-lg rounded-sm"
      >
        AGENDAR AGORA
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top-center"
        className="rounded-md"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Agende agora sua consulta!
              </ModalHeader>
              <ModalBody>
                <form className="space-y-3">
                  <Input
                    isRequired
                    autoFocus
                    label="Nome completo"
                    placeholder="Digite seu nome completo"
                    className="rounded-sm"
                    variant="flat"
                  />
                  <Input
                    isRequired
                    autoFocus
                    label="Email"
                    placeholder="Digite seu email"
                    variant="flat"
                  />
                  <div>
                    <label>
                      <I18nProvider locale="en-GB">
                        <DatePicker
                          isRequired
                          showMonthAndYearPickers
                          label="Data de nascimento"
                          color="default"
                          variant={"flat"}
                          defaultValue={today(getLocalTimeZone())}
                        />
                      </I18nProvider>
                    </label>
                  </div>
                  <div className="flex flex-row gap-3">
                    <Select
                      isRequired
                      variant="flat"
                      placeholder="País"
                      className="w-[48%]"
                      label={"Código do país"}
                    >
                      {countryCodes.map((countryCode) => (
                        <SelectItem
                          key={countryCode.key}
                          value={countryCode.key}
                          textValue={`${countryCode.code} | ${countryCode.country}`}
                        >
                          {countryCode.code} | {countryCode.country}
                        </SelectItem>
                      ))}
                    </Select>
                    <Input
                      isRequired
                      autoFocus
                      label="Celular"
                      className="pr-[-2px]"
                      placeholder="Digite seu número (com DDD)"
                      variant="flat"
                    />
                  </div>
                  <Select
                    isRequired
                    isDisabled={clinicsLoading}
                    variant="flat"
                    onChange={(e) => handleClinicSelectChange(e)}
                    placeholder="Selecione a clínica desejada"
                    label={"Clínica"}
                  >
                    {clinics.map((clinic: IClinic) => (
                      <SelectItem
                        key={clinic.id}
                        value={JSON.stringify(clinic)}
                        textValue={`${clinic.name} - ${clinic.address2}`}
                      >
                        {clinic.name} - {clinic.address2}
                      </SelectItem>
                    ))}
                  </Select>
                  <Select
                    isRequired
                    isDisabled={planInputDisabled}
                    onChange={(e) => handlePlanSelectChange(e)}
                    variant="flat"
                    placeholder="Selecione o plano desejado"
                    label={"Plano"}
                  >
                    {plans.map((plan: IPlan) => (
                      <SelectItem
                        key={plan.id}
                        value={JSON.stringify(plan)}
                        textValue={`${plan.name} - ${plan.duration}`}
                      >
                        {plan.name} - {plan.duration}
                      </SelectItem>
                    ))}
                  </Select>
                  <div>
                    <label>
                      <I18nProvider locale="en-GB">
                        <DatePicker
                          isRequired
                          onChange={(date) => handleAppointmentDateChange(date)}
                          isDisabled={appointmentDateDisabled}
                          label="Pretenção de data para a consulta"
                          color="default"
                          variant={"flat"}
                          minValue={today(getLocalTimeZone())}
                          isDateUnavailable={isDateUnavailable}
                        />
                      </I18nProvider>
                    </label>
                  </div>
                  <Select
                    isRequired
                    isDisabled={hourInputDisabled}
                    variant="flat"
                    placeholder="Selecione o horário desejado para consulta"
                    label={"Horário para consulta"}
                  >
                    {availableHours.map((hour) => (
                      <SelectItem
                        key={`${hour.hour}-${hour.minute}`}
                        value={JSON.stringify(hour)}
                        isDisabled={hour.disabled}
                        textValue={formatToClockFormat(hour.hour, hour.minute)}
                      >
                        {hour.disabled ? (
                          <del>
                            {formatToClockFormat(hour.hour, hour.minute)}
                          </del>
                        ) : (
                          formatToClockFormat(hour.hour, hour.minute)
                        )}
                      </SelectItem>
                    ))}
                  </Select>
                </form>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="flat"
                  className="rounded-sm"
                  onPress={onClose}
                >
                  Cancelar
                </Button>
                <Button
                  onPress={onClose}
                  onSubmit={() => handleSubmitAppointment()}
                  className="bg-[#3fa98d] text-white rounded-sm"
                >
                  Agendar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
