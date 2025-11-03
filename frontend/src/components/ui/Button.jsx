import React from "react";

/**
 * @param {object} props
 * @param {React.ReactNode} props.children
 */
const Button = ({ children, ...props }) => {
  const { className = "", ...rest } = props;
  
  // Check if className contains a width class (w-*)
  const hasCustomWidth = /\bw-\S+/.test(className);
  
  const buttonClasses = `
    relative inline-flex items-center justify-center 
    ${hasCustomWidth ? '' : 'w-[8em]'} h-[2.6em] m-5 
    font-sans font-medium text-[17px] text-black
    bg-[#E1D7C6] border-2 border-[#E1D7C6] rounded-xl 
    cursor-pointer overflow-hidden 
    transition-colors duration-1000 ease-in-out
    z-10 
    hover:text-white
    before:content-[''] before:absolute
    before:w-[200px] before:h-[150px]
    before:bg-[#579BB1]
    before:rounded-full
    before:-z-10 
    before:top-full before:left-full
    before:transition-all before:duration-1000 before:ease-in-out
    hover:before:-top-[30px] hover:before:-left-[30px] 
    active:before:bg-[#579BB1] active:before:transition-none 
    ${className}
  `;

  return (
    <button className={buttonClasses} {...rest}>
      {children}
    </button>
  );
};

export default Button;
