import AnimatedLink from "./AnimatedLink/AnimatedLink";

export default function Header() {
  // TODO: make header content have color exclusion effect
  return (
    <div className='z-50 font-neuemontreal-medium flex justify-between items-center w-full'>
      <h1 className='header-logo'>malik</h1>
      <div className='flex gap-2 text-sm'>
        <AnimatedLink href='#about'>ABOUT</AnimatedLink>
        <AnimatedLink href='#work'>WORK</AnimatedLink>
        <AnimatedLink href='#services'>SERVICES</AnimatedLink>

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
    </div>
  );
}
