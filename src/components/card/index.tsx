import Image from "next/image";

type ICard = {
  title: string;
  street: string;
  city: string;
  clinicName: string;
  hrefCall: string;
  hrefMap: string;
  style: string;
};

export default function Card(props: ICard) {
  return (
    <div
      className={`${props.style} hover:shadow-slate-300 bg-white pb-10 w-[250px] h-[360px] shadow-xl shadow-slate-200 m-auto`}
    >
      <Image
        className="mx-auto pt-10 pb-5"
        src={"/svg/icon.svg"}
        alt="Alline Duarte Nutricionista"
        width="64"
        height="64"
      />
      <div>
        <h1
          className={
            "font-['Marcellus_SC'] text-[20px] font-normal text-[#202b36]"
          }
        >
          {props.title}
        </h1>
        <h1
          className={
            "mt-4 mb-3 font-['Marcellus_SC'] text-[20px] font-normal text-[#202b36]"
          }
        >
          {props.clinicName}
        </h1>
        <p className="font-serif text-[18px] text-[#5b6f82]">{props.street}</p>
        <p className="font-serif text-[18px] text-[#5b6f82] text-wrap">
          {props.city}
        </p>
      </div>
      <div className="mt-3 w-[80%] m-auto flex justify-evenly">
        <a href={props.hrefCall}>
          <button className="px-5 py-1 bg-white shadow-md hover:shadow-lg shadow-slate-200 text-main text-[14px] font-bold">
            LIGAR
          </button>
        </a>
        <a href={props.hrefMap}>
          <button className="px-5 py-1 bg-white shadow-md hover:shadow-lg shadow-slate-200 text-main text-[14px] font-bold">
            MAPA
          </button>
        </a>
      </div>
    </div>
  );
}
