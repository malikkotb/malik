"use client";

export default function ActionCall() {
  return (
    <div className='py-8 relative bg-black w-full h-full flex items-center justify-center'>
      <div className='flex flex-col text-center text-white'>
        <div style={{ lineHeight: 1 }} className='subheading my-8'>
          <div>Get in touch today.</div>
          <div>Booking new projects.</div>
        </div>

        <div className='lg:w-[65vw] w-[90vw] h-[70vh] min-h-[650px]'>
          <iframe
            src='https://cal.com/malikkotb?theme=dark'
            frameBorder='0'
            className='w-full h-full rounded-lg'
          ></iframe>
        </div>
      </div>
    </div>
  );
}
