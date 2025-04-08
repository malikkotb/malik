"use client";

export default function ActionCall() {
  // TODO: opacity animation on scroll for this text
  // like https://www.spylt.com/ section
  return (
    <div className='h-[100vh] flex gap-12 flex-col px-[5vw] justify-center items-center'>
      <h3 className='h3'>
        {/* <h2 className='h3 text-white w-fit font-bold text-center font-neuemontreal-bold leading-[100%] tracking-[-3%] text-[8vw] uppercase'> */}
        Everyone has a <span className='text-[#909090]'>story</span>,
        let me help you tell{" "}
        <span className='text-[#909090]'>yours</span>.
      </h3>
      <a
        href='mailto:hello@malikkotb.com'
        className='text-black px-6 py-5 bg-white font-neuemontreal-bold leading-[100%] tracking-[-3%] text-[2vw]'
      >
        BOOK A CALL
      </a>
    </div>
  );
}
