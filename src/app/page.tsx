import Clinics from "@/components/clinics";
import Footer from "@/components/footer";
import Header from "@/components/header";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";

export default function Home() {
  return (
    <main className="overflow-x-hidden m-auto relative md:max-w-[1440px] shadow-lg">
      <div className="bg-main overflow-x-hidden inset-0 mt-[-240px] md:mt-[-250px] ml-[-100px] md:ml-[-400px] z-auto lg:w-[1900px]  md:w-[1500px] w-[900px] h-[700px] md:h-[800px] absolute transform rotate-[-12deg] top-0 bg-gradient-to-r from-[#265d58] to-[#6d9c99] md:from-[#265d58] md:to-[#467975] lg:to-[#497c79]"></div>
      <Header />
      <div className="flex min-h-screen flex-col items-center justify-between px-4 py-8 z-1 bg-white shadow-lg">
        <section className="container text-center z-20">
          <h1 className="font-['Marcellus_SC'] font-[400] text-center text-[30px] text-nowrap text-white mt-3 md:text-[42px]">
            Dra. Alline Duarte
          </h1>
          <div className="text-[#fffc] pt-3 font-sans text-[20px]">
            <p>Nutricionista</p>
            <p>CRN-10: 11474P</p>
          </div>
          <div className="mt-12">
            <Dialog>
              <DialogTrigger>
                <button className="px-8 py-4 text-[13px] text-white font-black bg-gradient-to-r from-[#268a7b] to-[#0defca] hover:shadow-lg">
                  AGENDAR AGORA
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agendamento</DialogTitle>
                  <DialogDescription>
                    Agende sua consulta agora!
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
          <div className="w-full mt-10 h-[0.5px] bg-gradient-to-r from-transparent via-white to-transparent"></div>
          <Clinics />
        </section>
        <Footer />
      </div>
    </main>
  );
}
