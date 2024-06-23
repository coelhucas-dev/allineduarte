"use client";
import { cache } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IClinic, IScheduled, IPlan } from "@/types";
import {
  DateValue,
  isWeekend,
  getDayOfWeek,
  parseAbsolute,
  getLocalTimeZone,
  isSameDay,
  parseAbsoluteToLocal,
} from "@internationalized/date";
import { useLocale } from "@react-aria/i18n";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  scheduleAppointmentApi,
  getScheduledApi,
  fetchClinicsApi,
  createPatientApi,
} from "@/lib/api.client";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

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

const formSchema: any = z.object({
  fullName: z.string().min(1),
  email: z
    .string()
    .min(1)
    .email(
      "Esse não é um email válido, por favor digite um email válido e tente novamente!",
    ),
  dayOfBirth: z.string(),
  monthOfBirth: z.string(),
  yearOfBirth: z.string(),
  countryCode: z.string(),
  phoneNumber: z.string().min(8),
  clinic: z.string(),
  plan: z.string(),
  appointmentDate: z.date(),
  appointmentHour: z.string(),
});

export default function AppointmentModal() {
  const form = useForm<z.infer<typeof formSchema>>({
    mode: "onChange",
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
    },
  });
  const [modalOpen, setModalOpen] = useState(false);

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

  const clearStates = () => {
    setModalOpen(false);
    setPlanInputDisabled(true);
    setCurrentPlan(null);
    setHourInputDisabled(true);
    setAvailableHours([]);
    setAppointmentDateDisabled(true);
    setAppointments([]);
  };

  useEffect(() => {
    const fetchData = cache(async () => {
      try {
        const res: IClinic[] = await fetchClinicsApi();
        setClinics(res);
      } catch (err) {
        console.log(err);
      } finally {
        setClinicsLoading(false);
      }
    });

    fetchData().then();
  }, []);

  const convertToDateTime = (dateStr: string, timeStr: string): Date => {
    const date = new Date(dateStr);

    if (isNaN(date.getTime())) {
      throw new Error("Invalid Date");
    }

    const [hours, minutes] = timeStr.split(":").map(Number);

    date.setHours(hours, minutes, 0, 0);

    return date;
  };

  const onFormSubmit = async (values: z.infer<typeof formSchema>) => {
    const time = convertToDateTime(
      values.appointmentDate.toString(),
      values.appointmentHour,
    );

    if (!values.clinic || !values.plan || !time) {
      toast({
        className: cn(
          "top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4",
        ),
        title: "ERROR:",
        description: (
          <p>{"Por favor verifique se todos os campos estão preenchidos"}</p>
        ),
        variant: "destructive",
      });
      return;
    }

    const createPatientResponse = await createPatientApi({
      name: values.fullName,
      email: values.email,
      phone: values.phoneNumber,
      country_code: values.countryCode,
      birth_date: `${values.yearOfBirth}-${values.monthOfBirth}-${values.dayOfBirth}`,
    });

    await scheduleAppointmentApi({
      clinic: values.clinic,
      plan: values.plan,
      patient: createPatientResponse.response.id,
      time: time,
    });

    setModalOpen(false);
    clearStates();
    toast({
      className: cn(
        "top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4",
      ),
      title: "Parabéns, a sua pré consulta foi concluída!",
      description: (
        <p>
          {
            "Assim que a sua consulta for confirmada, vamos enviar um email para o endereço preenchido!"
          }
        </p>
      ),
      variant: "success",
    });
  };

  const isDateUnavailable = (date: DateValue) => {
    if (currentClinic == null) {
      return true;
    }
    return (
      isWeekend(date, locale) ||
      !currentClinic.clinic_hours.some(
        (clinicHour) =>
          getDayOfWeek(date, locale) - 1 == clinicHour.day_of_week,
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
    const res = await getScheduledApi();
    if (!res) {
      setAppointments([]);
      toast({
        className: cn(
          "top-0 right-0 flex fixed md:max-w-[420px] md:top-4 md:right-4",
        ),
        title: "ERRO",
        description: (
          <p>{"Não foi possível carregar os horários disponíveis"}</p>
        ),
        variant: "destructive",
      });
      return;
    }
    setAppointments(res.response.scheduled);
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
    unavailableHours: IHour[],
  ): boolean => {
    return unavailableHours.some((unavailableHour: IHour) => {
      return isEqualHour(localHour, unavailableHour);
    });
  };

  const unloadAvailableHours = () => {
    setAvailableHours([]);
    setHourInputDisabled(true);
    return;
  };

  const loadAvailableHours = (date: DateValue | undefined) => {
    if (!currentClinic || !date) {
      setAvailableHours([]);
      setHourInputDisabled(true);
      return;
    }
    let unavailableHours: IHour[] = [];
    appointments.map((appointment: IScheduled) => {
      let appointmentTime = parseAbsolute(
        new Date(appointment.appointment.time).toISOString(),
        getLocalTimeZone(),
      );
      if (isSameDay(appointmentTime, date)) {
        let appointmentDuration = appointment.plan.duration;
        let appointmentDurationMinute = (appointmentDuration + "").split(
          ".",
        )[1];

        if (appointmentDurationMinute != "0")
          if (!["00", "0"].includes(appointmentDurationMinute)) {
            unavailableHours.push({
              hour: appointmentTime.hour + 1,
              minute: 0,
              disabled: true,
            });
          }
        unavailableHours.push({
          hour: appointmentTime.hour,
          minute: 0,
          disabled: true,
        });
      }
    });

    let clinicHour = currentClinic?.clinic_hours.find(
      (clinicHour) => getDayOfWeek(date, locale) - 1 == clinicHour.day_of_week,
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

  const handlePlanSelectChange = async (id: string | number) => {
    const plan = plans.find((plan) => {
      return id == plan.id;
    });
    if (!plan) {
      setCurrentPlan(null);
      return;
    }
    setCurrentPlan(plan);
  };

  const handleClinicSelectChange = async (clinicId: string | number) => {
    const clinic = clinics.find((clinic) => {
      if (!clinicId) return false;
      return clinicId == clinic.id;
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

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogTrigger asChild>
        <Button className="px-8 py-6 text-[16px] text-white font-bold bg-gradient-to-r from-[#268a7b] to-[#0defca] hover:shadow-lg rounded-sm">
          AGENDAR AGORA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-screen-sm  max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agende agora sua consulta!</DialogTitle>
          <DialogDescription>Faça aqui seu pré agendamento.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onFormSubmit)}
              className="space-y-3 w-full"
            >
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem className="space-y-0 text-gray-700">
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input
                        id="fullName"
                        required
                        autoFocus
                        placeholder="Digite seu nome completo"
                        className="rounded-sm w-full"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={"email"}
                render={({ field }) => (
                  <FormItem className="space-y-0 text-gray-700">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        id="email"
                        required
                        autoFocus
                        placeholder="Digite seu melhor email"
                        className="rounded-sm w-full"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div>
                <div className="mt-1 text-gray-700">
                  <FormLabel>Data de nascimento</FormLabel>
                </div>
                <div className="flex space-x-1 gap-2 space-y-0 w-full">
                  <FormField
                    control={form.control}
                    name={"dayOfBirth"}
                    render={({ field }) => (
                      <FormItem className="space-y-2 text-gray-700 w-[33%]">
                        <FormControl>
                          <Select
                            onValueChange={(value) => field.onChange(value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Dia" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {Array.from(
                                  { length: 31 },
                                  (_, i) => i + 1,
                                ).map((day) => (
                                  <SelectItem
                                    key={day}
                                    value={
                                      day < 10
                                        ? `0${day.toString()}`
                                        : day.toString()
                                    }
                                  >
                                    {day}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={"monthOfBirth"}
                    render={({ field }) => (
                      <FormItem className={"space-y-2 text-gray-700 w-[33%]"}>
                        <FormControl>
                          <Select
                            onValueChange={(value) => field.onChange(value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Mês" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="01">Janeiro</SelectItem>
                                <SelectItem value="02">Fevereiro</SelectItem>
                                <SelectItem value="03">Março</SelectItem>
                                <SelectItem value="04">Abril</SelectItem>
                                <SelectItem value="05">Maio</SelectItem>
                                <SelectItem value="06">Junho</SelectItem>
                                <SelectItem value="07">Julho</SelectItem>
                                <SelectItem value="08">Agosto</SelectItem>
                                <SelectItem value="09">Setembro</SelectItem>
                                <SelectItem value="10">Outubro</SelectItem>
                                <SelectItem value="11">Novembro</SelectItem>
                                <SelectItem value="12">Dezembro</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={"yearOfBirth"}
                    render={({ field }) => (
                      <FormItem className={"space-y-2 text-gray-700 w-[33%]"}>
                        <FormControl>
                          <Select
                            onValueChange={(value) => field.onChange(value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Ano" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {Array.from(
                                  { length: 120 },
                                  (_, i) => new Date().getFullYear() - i,
                                ).map((year) => (
                                  <SelectItem
                                    key={year}
                                    value={year.toString()}
                                  >
                                    {year}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <FormField
                  control={form.control}
                  name="countryCode"
                  render={({ field }) => (
                    <FormItem className="space-y-0 text-gray-700 w-[45%]">
                      <FormLabel>Código de país</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) => {
                            return field.onChange(value);
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="País" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {countryCodes.map((countryCode) => (
                              <SelectItem
                                key={countryCode.key}
                                value={countryCode.code}
                              >
                                {countryCode.code} | {countryCode.country}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem className="space-y-0 text-gray-700 w-[55%]">
                      <FormLabel>Número de celular</FormLabel>
                      <FormControl>
                        <Input
                          id={"phoneNumber"}
                          required
                          autoFocus
                          placeholder="Digite seu número"
                          className="rounded-sm w-full"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="clinic"
                render={({ field }) => (
                  <FormItem className="space-y-0 text-gray-700 ">
                    <FormLabel>Selecione uma clínica</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          handleClinicSelectChange(value).then();
                          return field.onChange(value);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger disabled={clinicsLoading}>
                            <SelectValue placeholder="Clínica" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clinics.map((clinic) => (
                            <SelectItem key={clinic.id} value={`${clinic.id}`}>
                              {clinic.name} - {clinic.address2}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="plan"
                render={({ field }) => (
                  <FormItem className="space-y-0 text-gray-700 ">
                    <FormLabel>Selecione um plano</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          handlePlanSelectChange(value).then();
                          return field.onChange(value);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger disabled={planInputDisabled}>
                            <SelectValue placeholder="Plano" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {plans.map((plan) => (
                            <SelectItem key={plan.id} value={`${plan.id}`}>
                              {plan.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={"appointmentDate"}
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-1 text-gray-700">
                    <FormLabel>Data de agendamento</FormLabel>
                    <Popover>
                      <PopoverTrigger
                        asChild
                        disabled={appointmentDateDisabled}
                      >
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Escolha uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(value) => {
                            if (!value) {
                              unloadAvailableHours();
                              return field.onChange(null);
                            }
                            loadAvailableHours(
                              parseAbsoluteToLocal(value.toISOString()),
                            );
                            return field.onChange(value);
                          }}
                          disabled={(date) =>
                            isDateUnavailable(
                              parseAbsoluteToLocal(date.toISOString()),
                            ) || date < new Date()
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="appointmentHour"
                render={({ field }) => (
                  <FormItem className="space-y-0 text-gray-700 ">
                    <FormLabel>Selecione o horário para a consulta</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger disabled={hourInputDisabled}>
                            <SelectValue placeholder="Hoário da consulta" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableHours.map((hour) => (
                            <SelectItem
                              key={formatToClockFormat(hour.hour, hour.minute)}
                              disabled={hour.disabled}
                              value={formatToClockFormat(
                                hour.hour,
                                hour.minute,
                              )}
                            >
                              {hour.disabled ? (
                                <del>
                                  {formatToClockFormat(hour.hour, hour.minute)}
                                </del>
                              ) : (
                                <>
                                  {formatToClockFormat(hour.hour, hour.minute)}
                                </>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter className="sm:justify-end gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Fechar
                  </Button>
                </DialogClose>
                <Button
                  className="bg-emerald-700"
                  type="submit"
                  variant="default"
                >
                  Agendar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
