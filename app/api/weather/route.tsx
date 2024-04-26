import { getCombinedHistoricalAndForecastWeatherData } from "@/lib/weatherFetching"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, response: NextResponse) {
	try {
		let req = await request.json()

		if (!req || !req.lat || !req.lon)
			return NextResponse.json({ error: "Invalid request" }, { status: 500 })

		let rawData = await getCombinedHistoricalAndForecastWeatherData(
			req.lat,
			req.lon
		)

		return NextResponse.json(rawData, { status: 200 })
	} catch (error) {
		console.error(error)
		return NextResponse.json({ error: "Internal error" }, { status: 500 })
	}
}
