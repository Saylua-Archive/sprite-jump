import React from 'react';

export default function Jumper(props) {
  const translateString = `translate(${props.x}%, ${-1 * props.y}%)`;
  const widthString = `${props.width}%`;
  return (
    <div
      className='platform_wrapper'
      style={{
        transform: translateString,
      }}
    >
      <img className="jumper" src="gam.png" alt="You" width={widthString}/>
    </div>
  )
}
