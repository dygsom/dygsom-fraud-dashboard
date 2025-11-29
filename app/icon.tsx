import { ImageResponse } from 'next/og'
 
// Route segment config
export const runtime = 'edge'
 
// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'
 
// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 24,
          background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '50%',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 64 64" fill="none">
          <path d="M32 10L22 14V26C22 35 28 42 32 44C36 42 42 35 42 26V14L32 10Z" 
                fill="currentColor" 
                stroke="currentColor" 
                strokeWidth="1"/>
          <circle cx="27" cy="22" r="1.5" fill="currentColor"/>
          <circle cx="37" cy="20" r="1.5" fill="currentColor"/>
          <circle cx="32" cy="30" r="1.5" fill="currentColor"/>
          <circle cx="25" cy="34" r="1.5" fill="currentColor"/>
          <circle cx="39" cy="32" r="1.5" fill="currentColor"/>
        </svg>
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported icons size metadata
      // config to also set the ImageResponse's width and height.
      ...size,
    }
  )
}