import { climateModels } from "@/components/ClimateModelPicker"
import { addDays, format, parseISO } from "date-fns"

export async function getCombinedHistoricalAndForecastWeatherData(
	lat: number,
	lon: number,
	dateFrom: Date = parseISO("1950-01-01"),
	dateTo: Date = parseISO("2050-12-31")
) {
	// split up data into two parts:
	// history from ERA5 up until today
	// future from climate modeling for future days
	let dateFromHistory = dateFrom
	// era5-data is released with some lag
	let dateToHistory = addDays(new Date(), -14)
	let dateFromForecast = addDays(dateToHistory, 1)
	let dateToForecast = dateTo

	let resHistorical = await getHistoricalWeatherData(
		lat,
		lon,
		dateFromHistory,
		dateToHistory
	)
	let resForecast = await getClimateForecastWeatherData(
		lat,
		lon,
		dateFromForecast,
		dateToForecast
	)

	if (!resForecast) return
	if (!resHistorical) return

	return {
		forecast: resForecast,
		history: resHistorical,
	}
}

async function getGenericDailyDataFromOpenMeteo(
	endpoint: string,
	lat: number,
	lon: number,
	dateFrom: Date,
	dateTo: Date,
	additionalParams: string = ""
) {
	if (!process.env.OPEN_METEO_API_KEY) {
		throw new Error("Missing API KEY")
	}
	const df = format(dateFrom, "yyyy-MM-dd")
	const dt = format(dateTo, "yyyy-MM-dd")

	let api =
		endpoint +
		"?latitude=" +
		Math.round(100 * lat) / 100 +
		"&longitude=" +
		Math.round(100 * lon) / 100 +
		"&start_date=" +
		df +
		"&end_date=" +
		dt +
		"&daily=temperature_2m_max,temperature_2m_min,rain_sum,snowfall_sum&timezone=Europe%2FBerlin" +
		"&apikey=" +
		process.env.OPEN_METEO_API_KEY +
		additionalParams

	const resDirect = await fetch(api)

	const res = await resDirect.json()

	return res.daily
}

async function getClimateForecastWeatherData(
	lat: number,
	lon: number,
	dateFrom: Date,
	dateTo: Date
) {
	const allModels = climateModels.map((m) => m.specifier).join(",")

	let res = await getGenericDailyDataFromOpenMeteo(
		"https://customer-climate-api.open-meteo.com/v1/climate",
		lat,
		lon,
		dateFrom,
		dateTo,
		"&models=" + allModels
	)

	return res
}

async function getHistoricalWeatherData(
	lat: number,
	lon: number,
	dateFrom: Date,
	dateTo: Date
) {
	return await getGenericDailyDataFromOpenMeteo(
		"https://customer-archive-api.open-meteo.com/v1/archive",
		lat,
		lon,
		dateFrom,
		dateTo,
		"&models=best_match"
	)
}
