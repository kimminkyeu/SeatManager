
function CursorSVG({ color }: { color: string }) {
  return (

    <svg
      className='relative'
      width="20"
      height="20"
      viewBox="2 2 18 18"
      stroke="white"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <path
        transform="rotate(-15) scale(1.3)"
        fill={color}
        d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
      />
    </svg>
  );
}

export { CursorSVG };
