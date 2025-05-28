import AnimatedLink from "./AnimatedLink/AnimatedLink";

export default function Header() {
  // TODO: make header content have color exclusion effect

  // TODO: make header disappear on scroll down and reappear on scroll up
  return (
    <div className='z-50 px-5 py-5 absolute w-full text-sm grid grid-cols-3 top-0 font-neuemontreal-medium items-center'>
      {/* header fontSize is 14px atm because of text-sm */}

      <a
        href='/'
        onClick={() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className='w-[1/3] flex justify-start items-center'
      >
        <h1 className='header-logo borderr'>MALIK KOTB</h1>
      </a>
      <div className='flex gap-2 w-[1/3] justify-center items-center'>
        <AnimatedLink selected={true} href='#services'>
          SERVICES
        </AnimatedLink>
        <AnimatedLink href='#work'>WORK</AnimatedLink>
        <AnimatedLink href='#about'>ABOUT</AnimatedLink>
        {/* <FlipLink
          newPage={true}
          href='https://malikkotb.github.io/blog/'
        >
          BLOG
        </FlipLink> */}
        <AnimatedLink href='mailto:hello@malikkotb.com'>
          CONTACT
        </AnimatedLink>
      </div>
      <div className='w-[1/3] flex justify-end items-center'>
        <button className='rounded-full w-4 h-4 bg-white'></button>
      </div>
    </div>
  );
}
