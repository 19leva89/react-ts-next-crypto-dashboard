import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'
import tailwindcssTypography from '@tailwindcss/typography'

export default {
	darkMode: 'selector',
	content: [
		'./src/pages/**/*.{ts,tsx,mdx}',
		'./src/components/**/*.{ts,tsx,mdx}',
		'./src/app/**/*.{ts,tsx,mdx}',
	],
	theme: {
		extend: {
			colors: {
				dark: 'rgba(23, 25, 35, 1)',
				'red-dark-item': 'rgba(203, 1, 1, 1)',
				'red-dark-container': 'rgba(203, 1, 1, 0.15)',
				'green-dark-item': 'rgba(1, 177, 48, 1)',
				'green-dark-container': 'rgba(1, 177, 48, 0.15)',
			},
			maxWidth: {
				expand: '1536px',
			},
			width: {
				'r1/2': '48%',
				'r1/4': '24%',
				'r1/3': '32%',
			},
		},
	},
	plugins: [tailwindcssAnimate, tailwindcssTypography],
} satisfies Config
