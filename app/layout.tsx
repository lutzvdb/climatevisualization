import type { Metadata } from "next"
import { Lato as MainFont } from "next/font/google"
import "./globals.css"

const mainFont = MainFont({ subsets: ["latin"], weight: ["400", "700"] })

export const metadata: Metadata = {
	title: "climatevisualizer",
	description: "Visualize climate change for any place on earth",
	icons: {
		icon: "/icon-192x192.png",
	},
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en">
			<head>
				<link rel="icon" href="/favicon.png" />
			</head>
			<body className={mainFont.className}>
				<div className="flex flex-col items-center p-4 w-full">{children}</div>
			</body>
		</html>
	)
}
