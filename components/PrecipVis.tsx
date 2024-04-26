import { Location } from "@/app/api/latlon/route"
import { PreparedData } from "@/lib/dataAggregation"
import { useEffect, useState } from "react"
import { Line } from "react-chartjs-2"
import { LuCloudRain } from "react-icons/lu"
import { TbSnowflake } from "react-icons/tb"
import { op, table } from "arquero"
import LinearRegression from "@/lib/linearRegression"

export default function PrecipVis(props: {
	data: PreparedData
	city: Location
	unit: string
	type: string
}) {
	const [todayDelta, setTodayDelta] = useState<number | null>(null)
	const [totalDelta, setTotalDelta] = useState<number | null>(null)
	const [lastYear, setLastYear] = useState(2050)
	const [firstYear, setFirstYear] = useState(1950)
	const [thisYearTrendPoint, setThisYearTrendPoint] = useState<number | null>(
		null
	)
	const [firstTrendPoint, setFirstTrendPoint] = useState<number | null>(null)
	const [lastTrendPoint, setLastTrendPoint] = useState<number | null>(null)
	const [thisYearTrendPoint2, setThisYearTrendPoint2] = useState<number | null>(
		null
	)
	const [firstTrendPoint2, setFirstTrendPoint2] = useState<number | null>(null)
	const [lastTrendPoint2, setLastTrendPoint2] = useState<number | null>(null)
	const [thisYearTrendPoint3, setThisYearTrendPoint3] = useState<number | null>(
		null
	)
	const [firstTrendPoint3, setFirstTrendPoint3] = useState<number | null>(null)
	const [lastTrendPoint3, setLastTrendPoint3] = useState<number | null>(null)
	const [plotData, setPlotData] = useState<any>(null)
	const [plotData3, setPlotData3] = useState<any>(null)
	const [plotData2, setPlotData2] = useState<any>(null)

	useEffect(() => {
		if (!props.data) return

		let curYear: number = new Date().getFullYear() - 1 // past year has full true measurements

		let yearlySum: any
		let dryDays: any

		if (props.type == "rain") {
			yearlySum = table(props.data)
				.filter((d: any) => d.rain_sum !== null)
				.derive({ year: (d: any) => op.year(d.time) })
				.groupby("year")
				.rollup({
					sumPrecipitation: (d: any) => op.sum(d.rain_sum),
					strongestRain: (d: any) => op.max(d.rain_sum),
				})
				.objects()
			dryDays = table(props.data)
				.filter((d: any) => d.rain_sum <= 3)
				.derive({ year: (d: any) => op.year(d.time) })
				.groupby("year")
				.rollup({
					dryDayN: (d: any) => op.count(),
				})
				.objects()
		} else {
			yearlySum = table(props.data)
				.filter((d: any) => d.snowfall_sum !== null)
				.derive({ year: (d: any) => op.year(d.time) })
				.groupby("year")
				.rollup({
					sumPrecipitation: (d: any) => op.sum(d.snowfall_sum),
				})
				.objects()
		}

		const linTrendPast = LinearRegression(
			yearlySum
				.filter((i: any) => i.year <= curYear)
				.map((i: any) => [i.year, i.sumPrecipitation])
		)
		const linTrendFuture = LinearRegression(
			yearlySum
				.filter((i: any) => i.year > curYear)
				.map((i: any) => [i.year, i.sumPrecipitation])
		)

		let ftp = Math.round(linTrendPast.predictions[0][1] * 10) / 10
		setFirstTrendPoint(ftp)
		let tytp =
			Math.round(
				linTrendPast.predictions.filter((i) => i[0] == curYear)[0][1] * 10
			) / 10
		setThisYearTrendPoint(tytp)
		let ltp =
			Math.round(
				linTrendFuture.predictions[linTrendFuture.predictions.length - 1][1] *
					10
			) / 10
		setLastTrendPoint(ltp)

		setTotalDelta(Math.round((ltp - ftp) * 10) / 10)
		setTodayDelta(Math.round((tytp - ftp) * 10) / 10)

		let linTrend_dryDaysPast
		let linTrend_dryDaysFuture
		let linTrend_strongestRainPast
		let linTrend_strongestRainFuture
		if (props.type == "rain") {
			linTrend_dryDaysPast = LinearRegression(
				dryDays
					.filter((i: any) => i.year <= curYear)
					.map((i: any) => [i.year, i.dryDayN])
			)
			linTrend_dryDaysFuture = LinearRegression(
				dryDays
					.filter((i: any) => i.year > curYear)
					.map((i: any) => [i.year, i.dryDayN])
			)
			setFirstTrendPoint2(
				Math.round(linTrend_dryDaysPast.predictions[0][1] * 10) / 10
			)
			setThisYearTrendPoint2(
				Math.round(
					linTrend_dryDaysPast.predictions.filter(
						(i) => i[0] == curYear
					)[0][1] * 10
				) / 10
			)
			setLastTrendPoint2(
				Math.round(
					linTrend_dryDaysFuture.predictions[
						linTrend_dryDaysFuture.predictions.length - 1
					][1] * 10
				) / 10
			)

			linTrend_strongestRainPast = LinearRegression(
				yearlySum
					.filter((i: any) => i.year <= curYear)
					.map((i: any) => [i.year, i.strongestRain])
			)
			linTrend_strongestRainFuture = LinearRegression(
				yearlySum
					.filter((i: any) => i.year > curYear)
					.map((i: any) => [i.year, i.strongestRain])
			)
			setFirstTrendPoint3(
				Math.round(linTrend_strongestRainPast.predictions[0][1] * 10) / 10
			)
			setThisYearTrendPoint3(
				Math.round(
					linTrend_strongestRainPast.predictions.filter(
						(i) => i[0] == curYear
					)[0][1] * 10
				) / 10
			)
			setLastTrendPoint3(
				Math.round(
					linTrend_strongestRainFuture.predictions[
						linTrend_strongestRainFuture.predictions.length - 1
					][1] * 10
				) / 10
			)
		}

		setFirstYear(yearlySum[0].year)
		setLastYear(yearlySum[yearlySum.length - 1].year)

		setPlotData({
			labels: yearlySum.map((i: any) => i.year),
			datasets: [
				{
					label: "Yearly sum (observed)",
					data: yearlySum.map((i: any) =>
						i.year < curYear ? i.sumPrecipitation : null
					),
					borderColor: "rgba(0,0,255, 0.1)",
					backgroundColor: "rgba(0,0,255,0.2)",
					pointRadius: 2,
				},
				{
					label: "Yearly sum (projected)",
					data: yearlySum.map((i: any) =>
						i.year >= curYear ? i.sumPrecipitation : null
					),
					borderColor: "rgba(0,0,255, 0.1)",
					backgroundColor: "rgba(0,0,255,0.2)",
					pointRadius: 2,
					borderDash: [4, 4],
				},
				{
					label: "Trend",
					data: linTrendPast.predictions
						.map((i: any) =>
							i[0] == firstYear || i[0] == curYear ? i[1] : undefined
						)
						.concat(
							linTrendFuture.predictions.map((i: any) =>
								i[0] == lastYear ? i[1] : undefined
							)
						),
					borderColor: "rgba(0,0,200,0.7)",
					backgroundColor: "rgba(0,0,255,0.3)",
					pointRadius: 5,
				},
			],
		})

		if (
			props.type == "rain" &&
			linTrend_dryDaysFuture &&
			linTrend_dryDaysPast &&
			linTrend_strongestRainFuture &&
			linTrend_strongestRainPast
		) {
			setPlotData2({
				labels: yearlySum.map((i: any) => i.year),
				datasets: [
					{
						label: "Dry days per year (observed)",
						data: dryDays.map((i: any) =>
							i.year < curYear ? i.dryDayN : null
						),
						borderColor: "rgba(0,0,255, 0.1)",
						backgroundColor: "rgba(0,0,255,0.2)",
						pointRadius: 2,
					},
					{
						label: "Dry days per year (projected)",
						data: dryDays.map((i: any) =>
							i.year >= curYear ? i.dryDayN : null
						),
						borderColor: "rgba(0,0,255, 0.1)",
						backgroundColor: "rgba(0,0,255,0.2)",
						pointRadius: 2,
						borderDash: [4, 4],
					},
					{
						label: "Trend",
						data: linTrend_dryDaysPast.predictions
							.map((i: any) =>
								i[0] == firstYear || i[0] == curYear ? i[1] : undefined
							)
							.concat(
								linTrend_dryDaysFuture.predictions.map((i: any) =>
									i[0] == lastYear ? i[1] : undefined
								)
							),
						borderColor: "rgba(0,0,200,0.7)",
						backgroundColor: "rgba(0,0,255,0.3)",
						pointRadius: 5,
					},
				],
			})

			setPlotData3({
				labels: yearlySum.map((i: any) => i.year),
				datasets: [
					{
						label: "Strongest single-day rainfall (observed)",
						data: yearlySum.map((i: any) =>
							i.year < curYear ? i.strongestRain : null
						),
						borderColor: "rgba(0,0,255, 0.1)",
						backgroundColor: "rgba(0,0,255,0.2)",
						pointRadius: 2,
					},
					{
						label: "Strongest single-day rainfall (projected)",
						data: yearlySum.map((i: any) =>
							i.year >= curYear ? i.strongestRain : null
						),
						borderColor: "rgba(0,0,255, 0.1)",
						backgroundColor: "rgba(0,0,255,0.2)",
						pointRadius: 2,
						borderDash: [4, 4],
					},
					{
						label: "Trend",
						data: linTrend_strongestRainPast.predictions
							.map((i: any) =>
								i[0] == firstYear || i[0] == curYear ? i[1] : undefined
							)
							.concat(
								linTrend_strongestRainFuture.predictions.map((i: any) =>
									i[0] == lastYear ? i[1] : undefined
								)
							),
						borderColor: "rgba(0,0,200,0.7)",
						backgroundColor: "rgba(0,0,255,0.3)",
						pointRadius: 5,
					},
				],
			})
		}
	}, [props.data])

	return (
		<>
			{!(
				props.type == "snow" &&
				lastTrendPoint == 0 &&
				firstTrendPoint == 0
			) ? (
				<div>
					<div className="mt-8">
						<h3 className="text-2xl w-full text-center my-4">
							{props.type == "rain" ? (
								<>
									<LuCloudRain className="inline mr-2" />
									Amount of yearly rainfall
								</>
							) : (
								<>
									<TbSnowflake className="inline mr-2" />
									Amount of yearly snowfall
								</>
							)}
						</h3>
						<h4 className="text-xl w-full text-center">
							{todayDelta && firstTrendPoint && (
								<>
									{todayDelta && Math.abs(todayDelta)}
									{props.unit}
									{todayDelta && todayDelta > 0 ? " more " : " less "}
									or {todayDelta > 0 ? "+" : ""}
									{Math.round(10 * 100 * (todayDelta / firstTrendPoint)) / 10}%
									until today
									<br />
								</>
							)}
							{totalDelta && firstTrendPoint && (
								<>
									{totalDelta && Math.abs(totalDelta)}
									{props.unit}
									{totalDelta && totalDelta > 0 ? " more " : " less "}
									or {totalDelta > 0 ? "+" : ""}
									{Math.round(10 * 100 * (totalDelta / firstTrendPoint)) / 10}%
									until {lastYear}
								</>
							)}
						</h4>
						<h4 className="text-xl m-4">
							Total yearly {props.type == "rain" ? "rainfall" : "snowfall"}
						</h4>
						<p>
							{lastTrendPoint && firstTrendPoint && totalDelta && (
								<>
									In the {firstYear}s, the average year saw
									<strong>
										{" "}
										{firstTrendPoint}
										{props.unit}
										{props.type == "rain" ? " of rainfall" : " of snowfall"}
									</strong>
									. These days, the average yearly sum is
									<strong>
										{" "}
										{thisYearTrendPoint}
										{props.unit}
									</strong>
									. Until {lastYear}, this is projected to change to
									<strong>
										{" "}
										{lastTrendPoint}
										{props.unit}
									</strong>
									. That is a total change of about {Math.abs(totalDelta)}
									{props.unit}.
								</>
							)}
						</p>
						{plotData && (
							<Line
								data={plotData}
								options={{
									spanGaps: true,
									plugins: {
										title: {
											display: true,
											text:
												"Total yearly " +
												(props.type == "rain" ? "rainfall" : "snowfall"),
										},
										legend: { display: false },
									},
								}}
							/>
						)}
						{props.type == "rain" && (
							<>
								<h4 className="text-xl m-4 mt-8">Number of dry days</h4>
								<p>
									{lastTrendPoint2 && firstTrendPoint2 && (
										<>
											In the {firstYear}s, the average year had{" "}
											<strong>{firstTrendPoint2} dry days per year </strong>.
											These days, the average is is{" "}
											<strong>{thisYearTrendPoint2} days</strong>. Until{" "}
											{lastYear}, this is projected to change to{" "}
											<strong>{lastTrendPoint2} days</strong>.
											{lastTrendPoint2 > firstTrendPoint2 && (
												<>
													Longer dry periods pose challenges to agriculture and
													water supply.
												</>
											)}
										</>
									)}
								</p>
								{plotData2 && (
									<Line
										data={plotData2}
										options={{
											spanGaps: true,
											plugins: {
												title: {
													display: true,
													text: "Number of dry days",
												},
												legend: { display: false },
											},
										}}
									/>
								)}
								<h4 className="text-xl m-4 mt-8">Strongest daily rainfall</h4>
								<p>
									{lastTrendPoint3 && firstTrendPoint3 && (
										<>
											In the {firstYear}s, the day with the most rainfall had
											<strong>
												{" "}
												{firstTrendPoint3}
												{props.unit} of rainfall in a single day{" "}
											</strong>
											. By now, this has changed to
											<strong>
												{" "}
												{thisYearTrendPoint3}
												{props.unit}
											</strong>
											. In many places on earth, we see stronger daily
											rainfalls. Until {lastYear}, this is projected to change
											to
											<strong>
												{" "}
												{lastTrendPoint3}
												{props.unit}
											</strong>
											.
											{lastTrendPoint2 &&
												firstTrendPoint2 &&
												lastTrendPoint2 > firstTrendPoint2 &&
												lastTrendPoint3 > firstTrendPoint3 &&
												(lastTrendPoint2 - firstTrendPoint2) /
													firstTrendPoint2 >
													0.03 &&
												(lastTrendPoint3 - firstTrendPoint3) /
													firstTrendPoint3 >
													0.03 && (
													<>
														The combination of more dry days yet stronger daily
														rainfall means that there is a tendency for the soil
														to be either dried out or overwhelmed with water.
														This is problematic for agriculture as plants are
														not supplied with a constant enough stream of water,
														potentially causing significant loss of food.
													</>
												)}
										</>
									)}
								</p>
								{plotData3 && (
									<Line
										data={plotData3}
										options={{
											spanGaps: true,
											plugins: {
												title: {
													display: true,
													text: "Strongest daily rainfall",
												},
												legend: { display: false },
											},
										}}
									/>
								)}
							</>
						)}
					</div>
				</div>
			) : (
				<p>No relevant data found.</p>
			)}
		</>
	)
}
