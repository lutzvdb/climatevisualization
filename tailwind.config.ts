import type { Config } from "tailwindcss"

const config: Config = {
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			backgroundImage: {
				"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
				"gradient-conic":
					"conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
			},
		},
	},
	plugins: [require("daisyui")],
	daisyui: {
		themes: [
			{
				mytheme: {
					primary: "#344966",
					secondary: "#D68C45",
					accent: "#B4CDED",
					neutral: "#FFF",
					"base-100": "#FAFFFF",
					"base-200": "#F0F5F5",
					"base-content": "#0D1821",
				},
			},
			"dark",
			"cupcake",
		],
	},
}
export default config
