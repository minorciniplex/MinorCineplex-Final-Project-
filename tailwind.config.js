/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
       "./src/**/*.{js,ts,jsx,tsx}",
     ],
     theme: {
     	extend: {
     		colors: {
     			background: 'hsl(var(--background))',
     			foreground: 'hsl(var(--foreground))',
     			'base-gray': {
     				'0': 'var(--base-gray-0)',
     				'100': 'var(--base-gray-100)',
     				'200': 'var(--base-gray-200)',
     				'300': 'var(--base-gray-300)',
     				'400': 'var(--base-gray-400)'
     			},
     			white: 'var(--base-white)',
     			'brand-blue': {
     				'100': 'var(--brand-blue-100)',
     				'200': 'var(--brand-blue-200)',
     				'300': 'var(--brand-blue-300)'
     			},
     			'brand-green': 'var(--brand-green)',
     			'brand-red': 'var(--brand-red)',
     			card: {
     				DEFAULT: 'hsl(var(--card))',
     				foreground: 'hsl(var(--card-foreground))'
     			},
     			popover: {
     				DEFAULT: 'hsl(var(--popover))',
     				foreground: 'hsl(var(--popover-foreground))'
     			},
     			primary: {
     				DEFAULT: 'hsl(var(--primary))',
     				foreground: 'hsl(var(--primary-foreground))'
     			},
     			secondary: {
     				DEFAULT: 'hsl(var(--secondary))',
     				foreground: 'hsl(var(--secondary-foreground))'
     			},
     			muted: {
     				DEFAULT: 'hsl(var(--muted))',
     				foreground: 'hsl(var(--muted-foreground))'
     			},
     			accent: {
     				DEFAULT: 'hsl(var(--accent))',
     				foreground: 'hsl(var(--accent-foreground))'
     			},
     			destructive: {
     				DEFAULT: 'hsl(var(--destructive))',
     				foreground: 'hsl(var(--destructive-foreground))'
     			},
     			border: 'hsl(var(--border))',
     			input: 'hsl(var(--input))',
     			ring: 'hsl(var(--ring))',
     			chart: {
     				'1': 'hsl(var(--chart-1))',
     				'2': 'hsl(var(--chart-2))',
     				'3': 'hsl(var(--chart-3))',
     				'4': 'hsl(var(--chart-4))',
     				'5': 'hsl(var(--chart-5))'
     			}
     		},
     		fontFamily: {
     			condensed: [
     				'Roboto Condensed',
     				'sans-serif'
     			]
     		},
     		screens: {
     			sm: '375px',
     			md: '768px',
     			lg: '1024px'
     		},
     		typography: {
     			'headline-1': {
     				css: {
     					fontFamily: 'var(--font-family-condensed)',
     					fontWeight: '700',
     					fontSize: '56px'
     				}
     			},
     			'headline-2': {
     				css: {
     					fontFamily: 'var(--font-family-condensed)',
     					fontWeight: '700',
     					fontSize: '36px'
     				}
     			},
     			'headline-3': {
     				css: {
     					fontFamily: 'var(--font-family-condensed)',
     					fontWeight: '700',
     					fontSize: '24px'
     				}
     			},
     			'headline-4': {
     				css: {
     					fontFamily: 'var(--font-family-condensed)',
     					fontWeight: '700',
     					fontSize: '20px'
     				}
     			},
     			'body-1-regular': {
     				css: {
     					fontFamily: 'var(--font-family-condensed)',
     					fontWeight: '400',
     					fontSize: '16px'
     				}
     			},
     			'body-1-medium': {
     				css: {
     					fontFamily: 'var(--font-family-condensed)',
     					fontWeight: '700',
     					fontSize: '16px'
     				}
     			},
     			'body-2-regular': {
     				css: {
     					fontFamily: 'var(--font-family-condensed)',
     					fontWeight: '400',
     					fontSize: '14px'
     				}
     			},
     			'body-2-medium': {
     				css: {
     					fontFamily: 'var(--font-family-condensed)',
     					fontWeight: '500',
     					fontSize: '14px'
     				}
     			},
     			'body-3': {
     				css: {
     					fontFamily: 'var(--font-family-condensed)',
     					fontWeight: '400',
     					fontSize: '12px'
     				}
     			}
     		},
     		borderRadius: {
     			lg: 'var(--radius)',
     			md: 'calc(var(--radius) - 2px)',
     			sm: 'calc(var(--radius) - 4px)'
     		},
     		keyframes: {
     			'accordion-down': {
     				from: {
     					height: '0'
     				},
     				to: {
     					height: 'var(--radix-accordion-content-height)'
     				}
     			},
     			'accordion-up': {
     				from: {
     					height: 'var(--radix-accordion-content-height)'
     				},
     				to: {
     					height: '0'
     				}
     			}
     		},
     		animation: {
     			'accordion-down': 'accordion-down 0.2s ease-out',
     			'accordion-up': 'accordion-up 0.2s ease-out'
     		}
     	}
     },
     plugins: [
       require('@tailwindcss/typography'),
         require("tailwindcss-animate")
    ],
   } 
