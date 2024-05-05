"use client";
import { I18nProvider } from "@react-aria/i18n";
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
import { today, getLocalTimeZone } from "@internationalized/date";
import { ChangeEvent, useEffect, useState } from "react";
import { IAppointment, IClinic } from "@/types";

const countryCode = [
  {
    key: "br",
    code: "+55",
    country: "Brasil",
  },
];

interface LocalCache {
  clinics: {
    [key: string | number]: IClinic;
  };
  appointments: IAppointment[];
}

export default function AppointmentModal() {
  const [clinics, setClinics] = useState<IClinic[]>([]);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [clinicsLoading, setClinicsLoading] = useState(true);
  const [appointmentDateDisabled, setAppointmentDateDisabled] = useState(true);

  const [appointments, setAppointments] = useState<IAppointment[]>([]);

  const [localCache, setLocalCache] = useState<LocalCache>({
    clinics: {},
    appointments: [],
  });

  const [availablePlans, setAvailablePlans] = useState({});

  useEffect(() => {
    fetch("http://localhost:8000/clinic")
      .then((res) => res.json())
      .then((data) => {
        setClinics(data);
        setClinicsLoading(false);
      });
  }, []);

  const loadClinicAvailablePlans = (clinic: IClinic) => {
    if (localCache.clinics[clinic.id]) {
      setAvailablePlans(localCache.clinics[clinic.id].plans);
      return;
    }
    setAvailablePlans(clinic.plans);
  };

  const loadAvailableAppointmentDates = async () => {
    fetch("http://localhost:8000/appointment/get_scheduled/")
      .then((res) => res.json())
      .then((data) => {
        setAppointments(data);
      });

    if (appointments) setAppointmentDateDisabled(false);
  };

  const handleClinicSelectChange = async (
    e: ChangeEvent<HTMLSelectElement>
  ) => {
    const clinic = clinics.find((clinic) => {
      if (!e.target.value) return false;
      return JSON.parse(e.target.value) == clinic.id;
    });

    if (!clinic) {
      setAvailablePlans({});
      setAppointments([]);
      setAppointmentDateDisabled(true);
      return;
    }

    loadClinicAvailablePlans(clinic);
    await loadAvailableAppointmentDates();
    setLocalCache({
      clinics: {
        ...localCache.clinics,
        [clinic.id]: clinic,
      },
      appointments: appointments,
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
                      <SelectItem key={"br"} value={"br"}>
                        +55 | Brasil
                      </SelectItem>
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
                  <div>
                    <label>
                      <I18nProvider locale="en-GB">
                        <DatePicker
                          isRequired
                          isDisabled={appointmentDateDisabled}
                          label="Pretenção de data para a consulta"
                          color="default"
                          variant={"flat"}
                          defaultValue={today(getLocalTimeZone())}
                        />
                      </I18nProvider>
                    </label>
                  </div>{" "}
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
