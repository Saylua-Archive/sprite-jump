import React from 'react';

export default function Platform(props) {
  const translateString = `translate(${props.x}%, -${props.y}%)`;
  const widthString = `${props.width}%`;
  return (
    <div
      className='platform_wrapper'
      style={{
        transform: translateString,
      }}
    >
      <div
        className='platform'
        style={{
          width: widthString,
        }}
      >&nbsp;</div>
    </div>
  )
}
