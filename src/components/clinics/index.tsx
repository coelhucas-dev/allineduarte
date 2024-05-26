"use client";

// import { Spinner } from "@nextui-org/react";
import { cache, useEffect, useState } from "react";
import { IClinic } from "@/types/clinic.type";
import Card from "../card";
import { fetchClinicsApi } from "@/lib/api.client";
import Image from "next/image";

export default function Clinics() {
  const [clinics, setClinics] = useState<IClinic[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = cache(async () => {
      try {
        const res: IClinic[] = await fetchClinicsApi();
        setClinics(res);
      } catch (err) {
        throw new Error(`Error while trying to fetch clinics, error=${err}`);
      } finally {
        setLoading(false);
      }
    });

    fetchData();
  }, []);

  // if (isLoading) return <Spinner color="default" size="md" />;
  if (isLoading)
    return (
      <Image
        className="m-auto"
        src={"/svg/loading.svg"}
        alt="Carregando..."
        width="64"
        height="64"
      />
    );
  if (!clinics) return <p>No profile data</p>;

  return (
    <div className="flex">
      {clinics.map((clinic: IClinic) => (
        <Card
          key={clinic.id}
          style={"mt-12"}
          title={clinic.title}
          clinicName={clinic.name}
          street={clinic.address1}
          district={clinic.address2}
          city={clinic.city}
          hrefCall={`tel:${clinic.country_code}${clinic.phone}`}
          hrefMap={clinic.maps_link}
        />
      ))}
    </div>
  );
}
