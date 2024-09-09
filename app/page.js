import Image from "next/image";

export default function Home() {
  return (
    <div>
      <section className="justify-center flex items-center landingSection bg-[#e5e4e0] h-screen">
        <div className="flex flex-col tracking-tight font-semibold leading-tight text-[5vw] text-center text-black uppercase">
          <span>Malik Kotb</span>
          <span>Independent Web</span>
          <span>Developer</span>
          <span>Based in Paris</span>
        </div>
      </section>
    </div>
  );
}
