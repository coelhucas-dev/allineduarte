import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t-[1px] w-full mt-20">
      <div className="z-1 mx-auto md:flex md:justify-evenly md:items-center p-6">
        <div className="flex m-auto lg:ml-[7rem] md:ml-10">
          <Link className="m-auto" href="/">
            <Image
              className="lg:w-[280px]"
              src={"/img/logo/logo_alline_280.png"}
              alt="Alline Duarte Nutricionista"
              width="280"
              height="280"
            />
          </Link>
        </div>
        <div className="flex bg-white m-auto z-10 lg:mr-[13rem] md:mr-38">
          <Link
            className="m-auto"
            href="https://www.instagram.com/dra_allineduarte/"
          >
            <Image
              className="w-[32px] m-auto md:w-[64px]"
              src={"/svg/insta.svg"}
              alt="Alline Duarte Nutricionista"
              width="64"
              height="64"
            />
          </Link>
        </div>
      </div>
      <div className="block z-10 m-auto px-2 md:w-[82%] lg:w-[60%]">
        <p className="mt-2 text-[13px] text-center text-slate-400">
          Utilizamos scripts de rastreamento de terceiros para obter informações
          sobre a forma como os utilizadores interagem com o nosso site
        </p>
        <p className="mt-2 text-[13px] text-center text-slate-400">
          Copyright © 2024 CoelhoDev. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
