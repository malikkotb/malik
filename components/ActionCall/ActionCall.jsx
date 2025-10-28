"use client";

export default function ActionCall() {
  return (
    <div className='h-screen w-full flex items-center justify-center'>
      <div className='flex flex-col text-center text-white'>
        <div className='text-3xl mb-8'>
          <div>Get in touch today.</div>
          <div>Booking new projects.</div>
        </div>

        <div className='lg:w-[65vw] w-[90vw] h-[55vh]'>
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
