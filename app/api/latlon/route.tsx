import { NextRequest, NextResponse } from "next/server"

export interface LatLonRequest {
	searchString: string
}

export interface Location {
	name: string
	country: string
	countryCode: string
	subregion: string
	lat: number
	lon: number
}

export async function POST(request: NextRequest, response: NextResponse) {
	try {
		let req: LatLonRequest = await request.json()

		let name = req.searchString

		let apiCall =
			"https://geocoding-api.open-meteo.com/v1/search?name=" +
			name +
			"&apikey=" +
			process.env.OPEN_METEO_API_KEY

		const res = await fetch(apiCall)
		const data = await res.json()

		if (!data)
			return NextResponse.json({ error: "No data returned" }, { status: 500 })
		if (!data.results)
			return NextResponse.json({ error: "No data returned" }, { status: 500 })

		let formattedResults: Location[] = data.results.map((result: any) => ({
			name: result.name,
			country: result.country,
			countryCode: result.country_code,
			subregion: result.admin1,
			lat: result.latitude,
			lon: result.longitude,
		}))

		return NextResponse.json({ results: formattedResults }, { status: 200 })
	} catch (error) {
		console.error(error)
		return NextResponse.json({ error: "Internal error" }, { status: 500 })
	}
}
