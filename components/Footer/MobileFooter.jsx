import DynamicCurrentTime from "../DynamicCurrentTime/DynamicCurrentTime";

export default function MobileFooter() {
  return (
    <div className='uppercase text-sm flex md:hidden flex-col gap-5 pb-[20vh]'>
      <DynamicCurrentTime />
      <div className='flex flex-col'>
        <div className='flex gap-1'>
          <p className=''>→</p>
          <a
            target='_blank'
            href='https://www.tiktok.com/@malik.code'
          >
            TIKTOK
          </a>
        </div>
        <div className='flex gap-1'>
          <p className=''>→</p>
          <a
            target='_blank'
            href='https://www.instagram.com/malik.code'
          >
            INSTAGRAM
          </a>
        </div>
        <div className='group flex gap-1'>
          <p className=''>→</p>
          <a
            target='_blank'
            href='https://www.linkedin.com/in/malik-kotb/'
          >
            LINKEDIN
          </a>
        </div>
      </div>
      <div className='flex flex-col'>
        <a href='mailto:hello@malikkotb.com'>
          {/* TODO: change this to: hello@malikotb.com WITH ONLY ON "K" */}
          HELLO@MALIKKOTB.COM
        </a>
      </div>
    </div>
  );
}
