import React from "react";
import FlipLink from "./FlipLink";

export default function Header() {
  return (
    <div className='z-50 font-neuemontreal-medium flex justify-between items-center w-full'>
      <h1 className='header-logo'>malik</h1>
      <div className='flex gap-2'>
        {/* <div className='headerLink'> */}
        <FlipLink href='#about'>ABOUT</FlipLink>
        {/* </div> */}
        <FlipLink href='#work'>WORK</FlipLink>
        <FlipLink href='#services'>SERVICES</FlipLink>

        {/* <FlipLink
          newPage={true}
          href='https://malikkotb.github.io/blog/'
        >
          BLOG
        </FlipLink> */}
        <FlipLink href='mailto:hello@malikkotb.com'>CONTACT</FlipLink>
      </div>
    </div>
  );
}
