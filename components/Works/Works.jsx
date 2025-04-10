"use client";
import "./Projects.css";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Works() {
  return (
    <>
      <h2 className='h2'>Selected</h2>
      <div className='spacer'></div>

      <div className='gallery'>
        <div className='left'>
          <div className='detailsWrapper'>
            <div className='details'>
              <div className='headline'></div>
              <div className='text'></div>
              <div className='text'></div>
              <div className='text'></div>
              <div className='text'></div>
            </div>

            <div className='details'>
              <div className='headline'></div>
              <div className='text'></div>
              <div className='text'></div>
              <div className='text'></div>
              <div className='text'></div>
            </div>

            <div className='details'>
              <div className='headline'></div>
              <div className='text'></div>
              <div className='text'></div>
              <div className='text'></div>
              <div className='text'></div>
            </div>
          </div>
        </div>

        <div className='right'>
          <div className='photos'></div>
        </div>
      </div>

      <div className='spacer'></div>
      <div className='spacer'></div>
      <div className='spacer'></div>
    </>
  );
}
