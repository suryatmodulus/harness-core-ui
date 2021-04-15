import React from 'react'

interface COFixedDrawerProps {
  content: JSX.Element
  topMargin: number
}
const COFixedDrawer: React.FC<COFixedDrawerProps> = props => {
  return (
    <div
      style={{
        top: `${props.topMargin}px`,
        boxShadow: 'rgb(40 41 61 / 4%) 0px 2px 8px, rgb(96 97 112 / 16%) 0px 16px 24px',
        width: '392px',
        bottom: 0,
        right: 0,
        position: 'fixed',
        zIndex: 20,
        backgroundColor: 'var(--white)',
        overflowY: 'scroll'
      }}
    >
      {props.content}
    </div>
  )
}

export default COFixedDrawer
