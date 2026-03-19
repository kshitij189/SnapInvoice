import React from 'react'

const Logo = ({ size = 36 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <rect x="5" y="4" width="14" height="20" rx="3" fill="#6366f1" />
      <rect x="13" y="10" width="14" height="18" rx="3" fill="#a5b4fc" />
    </svg>
  )
}

export default Logo
