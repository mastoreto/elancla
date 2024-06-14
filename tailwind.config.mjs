/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				'primary': {
					'50': '#ffeff0',
					'100': '#ffdcdf',
					'200': '#ffbfc5',
					'300': '#ff929c',
					'400': '#ff5463',
					'500': '#ff1f33',
					'600': '#ff0016',
					'700': '#db0013',
					'800': '#b70010',
					'900': '#940814',
					'950': '#520007',
    			}
			},
			fontFamily: {
				montserrat: ['Montserrat', 'sans-serif'],
			},
		},
	},
	plugins: [],
}
