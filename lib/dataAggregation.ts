export interface PreparedData {
	time: string[]
	rain_sum: number[]
	snowfall_sum: number[]
	temperature_2m_max: number[]
	temperature_2m_min: number[]
}
export function prepareRawData(
	rawData: any,
	unit: string,
	climateModel: string
) {
	let wthDataCopy = JSON.parse(JSON.stringify(rawData))

	// select requested weather model
	wthDataCopy.forecast["temperature_2m_max"] =
		wthDataCopy.forecast["temperature_2m_max_" + climateModel]
	wthDataCopy.forecast["temperature_2m_min"] =
		wthDataCopy.forecast["temperature_2m_min_" + climateModel]
	wthDataCopy.forecast["rain_sum"] =
		wthDataCopy.forecast["rain_sum_" + climateModel]
	wthDataCopy.forecast["snowfall_sum"] =
		wthDataCopy.forecast["snowfall_sum_" + climateModel]

	let newWthData: PreparedData = wthDataCopy.history

	// UNIONize history and forecast data
	newWthData.time = newWthData.time.concat(wthDataCopy.forecast.time)
	newWthData.temperature_2m_max = newWthData.temperature_2m_max.concat(
		wthDataCopy.forecast.temperature_2m_max
	)
	newWthData.temperature_2m_min = newWthData.temperature_2m_min.concat(
		wthDataCopy.forecast.temperature_2m_min
	)
	newWthData.rain_sum = newWthData.rain_sum.concat(
		wthDataCopy.forecast.rain_sum
	)
	newWthData.snowfall_sum = newWthData.snowfall_sum.concat(
		wthDataCopy.forecast.snowfall_sum
	)

	// now, convert to correct unit
	// we requested in metric units, so we only have to do conversion
	// for imperial units
	if (unit == "F") {
		// convert everything to imperial units
		// °C to °F
		newWthData.temperature_2m_max = newWthData.temperature_2m_max.map(
			(i: number) => i * (9 / 5) + 32
		)
		newWthData.temperature_2m_min = newWthData.temperature_2m_min.map(
			(i: number) => i * (9 / 5) + 32
		)
		// mm rainfall to inches
		newWthData.rain_sum = newWthData.rain_sum.map((i: number) => i / 25.4)
		// cm snowfall to inches
		newWthData.snowfall_sum = newWthData.snowfall_sum.map(
			(i: number) => i / 2.54
		)
	}

	return newWthData
}
