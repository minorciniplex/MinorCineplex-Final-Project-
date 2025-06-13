import React from 'react';
import PropTypes from 'prop-types';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  onClick,
  className = '',
  type = 'button',
  ...props
}) => {
  // สร้างคลาสตาม variant
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'w-[123px] h-[48px] px-[40px] py-[12px] rounded-[4px] gap-1.5 border-none bg-brand-blue-100 hover:bg-brand-blue-200 active:bg-brand-blue-300 text-white body-1-medium cursor-pointer focus:outline-none focus:ring-0 focus-visible:outline-none flex items-center justify-center';
      case 'ghost':
        return 'px-4 py-2 border-none bg-transparent hover:bg-transparent text-white cursor-pointer focus:outline-none focus:ring-0 focus-visible:outline-none flex items-center justify-center';
      case 'secondary':
        return 'w-[123px] h-[48px] px-[40px] py-[12px] rounded-[4px] gap-1.5 border-[1px] hover:bg-base-gray-300 hover:border-none active:bg-base-gray-200 active:border-none text-white body-1-medium cursor-pointer focus:outline-none focus:ring-0 focus-visible:outline-none flex items-center justify-center';
      case 'outline':
        return 'w-[123px] h-[48px] px-[40px] py-[12px] rounded-[4px] gap-1.5 border-2 border-brand-blue-100 text-brand-blue-100 hover:bg-brand-blue-100/10 active:bg-brand-blue-100/20 cursor-pointer focus:outline-none focus:ring-0 focus-visible:outline-none flex items-center justify-center';
      case 'danger':
        return 'w-[123px] h-[48px] px-[40px] py-[12px] rounded-[4px] gap-1.5 border-none bg-brand-red hover:bg-red-600 active:bg-red-700 text-white cursor-pointer focus:outline-none focus:ring-0 focus-visible:outline-none flex items-center justify-center';
      case 'success':
        return 'w-[123px] h-[48px] px-[40px] py-[12px] rounded-[4px] gap-1.5 border-none bg-brand-green hover:bg-green-600 active:bg-green-700 text-white cursor-pointer focus:outline-none focus:ring-0 focus-visible:outline-none flex items-center justify-center';
      default:
        return 'w-[123px] h-[48px] px-[40px] py-[12px] rounded-[4px] gap-1.5 border-none bg-brand-blue-100 hover:bg-brand-blue-200 active:bg-brand-blue-300 text-white cursor-pointer focus:outline-none focus:ring-0 focus-visible:outline-none flex items-center justify-center';
    }
  };

  // สร้างคลาสตามขนาด
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'px-3 py-1.5 text-sm';
      case 'medium':
        return 'px-4 py-2 text-base';
      case 'large':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };

  // รวมคลาสทั้งหมด
  const buttonClasses = `
    font-condensed
    rounded-lg
    font-medium
    transition-colors
    duration-200
    disabled:opacity-50
    disabled:cursor-not-allowed
    ${getVariantClasses()}
    ${getSizeClasses()}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `;

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'danger', 'success', 'ghost']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
};

export default Button; 