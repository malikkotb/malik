import DynamicCurrentTime from "../DynamicCurrentTime/DynamicCurrentTime";
import ScrambleLink from "../Scramble/ScrambleLink";

export default function Navigation() {
  return (
    <div className='borderr sticky top-5 flex flex-col justify-between h-[calc(100vh-40px)] col-span-6'>
      <div className='text-sm flex flex-col'>
        <h2 className=''>MALIK KOTB</h2>
        <h2>WORKING GLOBALLY</h2>
        <h2>FOLIO 2025</h2>
      </div>
      <nav className='uppercase text-sm opacity-60 flex flex-col'>
        <ScrambleLink href='#'>INDEX</ScrambleLink>
        <a href='#'>
          <p>INDEX</p>
        </a>
        <a href='#'>
          <p>SERVICES</p>
        </a>
        <a href='#'>
          <p>WORK</p>
        </a>
        <a href='#'>
          <p>ABOUT</p>
        </a>
        <a href='#'>
          <p>LET'S TALK</p>
        </a>
      </nav>
      <div className='uppercase text-sm opacity-60 flex flex-col gap-5'>
        <DynamicCurrentTime />

        <div className='flex flex-col'>
          <a href='#'>
            <p>TIKTOK</p>
          </a>
          <a href='#'>
            <p>INSTAGRAM</p>
          </a>
          <a href='#'>
            <p>LINKEDIN</p>
          </a>
        </div>
        <div className='flex flex-col'>
          <a href='#'>
            <p>TIKTOK</p>
          </a>
          <a href='#'>
            <p>INSTAGRAM</p>
          </a>
          <a href='#'>
            <p>LINKEDIN</p>
          </a>
        </div>
      </div>
    </div>
  );
}
