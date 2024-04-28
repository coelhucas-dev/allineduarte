import { useEffect, useState } from "react";
import { IClinic } from "@/types/clinic.type";
import Card from "../card";

export default function Clinics() {
  const [clinics, setClinics] = useState([]);
  const [isLoading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("http://localhost:8000/clinic")
      .then((res) => res.json())
      .then((data) => {
        setClinics(data);
        setLoading(false);
      });
  }, []);

  if (isLoading) return <p>Loading...</p>;
  if (!clinics) return <p>No profile data</p>;

  return (
    <>
      {clinics.map((clinic: IClinic) => (
        <Card
          key={clinic.id}
          style={"mt-12"}
          title={clinic.title}
          clinicName={clinic.name}
          street={clinic.address1}
          district={clinic.address2}
          city={clinic.city}
          hrefCall="tel:+554832320470"
          hrefMap="https://www.google.com/maps/@-27.6058676,-48.466518,3a,75y,247.16h,83.74t/data=!3m6!1e1!3m4!1spjS_4B_CjG4TKYQwgCdKng!2e0!7i16384!8i8192?entry=ttu"
        />
      ))}
    </>
  );
}
