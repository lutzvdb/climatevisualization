import { Location } from "@/app/api/latlon/route"
import { PreparedData } from "@/lib/dataAggregation"
import { escape, op, table } from "arquero"
import { Line } from "react-chartjs-2"
import { useEffect, useState } from "react"
import { PiThermometerSimpleLight } from "react-icons/pi"
import LinearRegression from "@/lib/linearRegression"

export default function TempVis(props: {
	data: PreparedData
	city: Location
	unit: string
	timeOfYear: string
}) {
	const [todayDelta, setTodayDelta] = useState<number | null>(null)
	const [totalDelta, setTotalDelta] = useState<number | null>(null)
	const [lastYear, setLastYear] = useState(2050)
	const [firstYear, setFirstYear] = useState(1940)
	const [thisYearTrendPoint, setThisYearTrendPoint] = useState<number | null>(
		null
	)
	const [firstTrendPoint, setFirstTrendPoint] = useState<number | null>(null)
	const [lastTrendPoint, setLastTrendPoint] = useState<number | null>(null)
	const [thisYearTrendPointSD, setThisYearTrendPointSD] = useState<
		number | null
	>(null)
	const [firstTrendPointSD, setFirstTrendPointSD] = useState<number | null>(
		null
	)
	const [lastTrendPointSD, setLastTrendPointSD] = useState<number | null>(null)
	const [plotData, setPlotData] = useState<any>(null)
	const [plotDataLow, setPlotDataLow] = useState<any>(null)
	const [plotDataSD, setPlotDataSD] = useState<any>(null)
	const [hotCutoff, setHotCutoff] = useState(30)
	const [freezingCutoff, setFreezingCutoff] = useState(0)
	const [summerMonths, setSummerMonths] = useState([6, 7, 8])
	const [winterMonths, setWinterMonths] = useState([12, 1, 2])
	const [potentialHotCutoffs, setPotentialHotCutoffs] = useState([
		15, 20, 25, 30, 35, 40, 45,
	])

	useEffect(() => {
		setSummerMonths(props.city.lat > 0 ? [6, 7, 8] : [12, 1, 2])
		setWinterMonths(props.city.lat > 0 ? [12, 1, 2] : [6, 7, 8])
		setHotCutoff(props.unit == "C" ? 25 : 80)
		setPotentialHotCutoffs(
			props.unit == "C"
				? [15, 20, 25, 30, 35, 40, 45]
				: [60, 70, 80, 90, 100, 110]
		)
		setFreezingCutoff(props.unit == "C" ? 0 : 32)
	}, [props.city, props.unit])

	useEffect(() => {
		if (!props.data) return

		let curYear: number = new Date().getFullYear() - 1 // past year has full true measurements

		let filteredData = table(props.data).filter(
			(d: any) => d.temperature_2m_max !== null && d.temperature_2m_min !== null
		)

		let specialDayData = filteredData

		if (props.timeOfYear == "Summer") {
			filteredData = filteredData
				.filter(escape((d: any) => summerMonths.includes(op.month(d.time) + 1)))
				.derive({ year: (d: any) => op.year(d.time) })
				.reify()

			specialDayData = filteredData
				.derive({
					hotDay: escape((d: any) =>
						d.temperature_2m_max >= hotCutoff ? 1 : 0
					),
				})
				.groupby("year")
				.rollup({
					noSpecialDays: (d: any) => op.sum(d.hotDay),
				})
				.reify()
		} else {
			filteredData = filteredData
				.filter(escape((d: any) => winterMonths.includes(op.month(d.time) + 1)))
				.derive({ year: (d: any) => op.year(d.time) })
				.reify()

			specialDayData = filteredData
				.derive({
					freezingDay: escape((d: any) =>
						d.temperature_2m_min <= freezingCutoff ? 1 : 0
					),
				})
				.groupby("year")
				.rollup({
					noSpecialDays: (d: any) => op.sum(d.freezingDay),
				})
				.reify()
		}
		let specialDays = specialDayData.objects()
		let yearlyAverages = filteredData
			.groupby("year")
			.rollup({
				avgDailyHigh: (d: any) => op.mean(d.temperature_2m_max),
				avgDailyLow: (d: any) => op.mean(d.temperature_2m_min),
			})
			.objects() as any // type inference is buggy

		const linTrendHighPast = LinearRegression(
			yearlyAverages
				.filter((i: any) => i.year <= curYear)
				.map((i: any) => [i.year, i.avgDailyHigh])
		)
		const linTrendHighFuture = LinearRegression(
			yearlyAverages
				.filter((i: any) => i.year > curYear)
				.map((i: any) => [i.year, i.avgDailyHigh])
		)
		const linTrendLowPast = LinearRegression(
			yearlyAverages
				.filter((i: any) => i.year <= curYear)
				.map((i: any) => [i.year, i.avgDailyLow])
		)
		const linTrendLowFuture = LinearRegression(
			yearlyAverages
				.filter((i: any) => i.year > curYear)
				.map((i: any) => [i.year, i.avgDailyLow])
		)

		const linTrendSDPast = LinearRegression(
			specialDays
				.filter((i: any) => i.year <= curYear)
				.map((i: any) => [i.year, i.noSpecialDays])
		)
		const linTrendSDFuture = LinearRegression(
			specialDays
				.filter((i: any) => i.year > curYear)
				.map((i: any) => [i.year, i.noSpecialDays])
		)

		// trendpoints for daily high values
		let ftp = Math.round(linTrendHighPast.predictions[0][1] * 10) / 10
		setFirstTrendPoint(ftp)
		let tytp =
			Math.round(
				linTrendHighPast.predictions.filter((i) => i[0] == curYear)[0][1] * 10
			) / 10
		setThisYearTrendPoint(tytp)
		let ltp =
			Math.round(
				linTrendHighFuture.predictions[
					linTrendHighFuture.predictions.length - 1
				][1] * 10
			) / 10
		setLastTrendPoint(ltp)

		// trendpoints for special day values
		setFirstTrendPointSD(Math.round(linTrendSDPast.predictions[0][1] * 10) / 10)
		setThisYearTrendPointSD(
			Math.round(
				linTrendSDPast.predictions.filter((i) => i[0] == curYear)[0][1] * 10
			) / 10
		)
		setLastTrendPointSD(
			Math.round(
				linTrendSDFuture.predictions[
					linTrendSDFuture.predictions.length - 1
				][1] * 10
			) / 10
		)

		setTotalDelta(Math.round((ltp - ftp) * 10) / 10)
		setTodayDelta(Math.round((tytp - ftp) * 10) / 10)

		let firstYearDirect = yearlyAverages[0].year
		let lastYearDirect = yearlyAverages[yearlyAverages.length - 1].year
		setFirstYear(firstYearDirect)
		setLastYear(lastYearDirect)

		setPlotData({
			labels: yearlyAverages.map((i: any) => i.year),
			datasets: [
				{
					label: "Avg. daily high (observed)",
					data: yearlyAverages.map((i: any) =>
						i.year < curYear ? i.avgDailyHigh : null
					),
					borderColor: "rgba(255,0,0,0.5)",
					backgroundColor: "rgba(255,0,0,0.5)",
					pointRadius: 0,
					fill: {
						target: "+2",
						above: "rgba(255, 0, 0, 0.05)",
						below: "rgba(255, 0, 0, 0.05)",
					},
				},
				{
					label: "Avg. daily high (projected)",
					data: yearlyAverages.map((i: any) =>
						i.year >= curYear ? i.avgDailyHigh : null
					),
					borderColor: "rgba(255,0,0,0.3)",
					backgroundColor: "rgba(255,0,0,0.05)",
					pointRadius: 0,
					fill: {
						target: "+1",
						above: "rgba(255, 0, 0, 0.03)",
						below: "rgba(255, 0, 0, 0.03)",
					},
					borderDash: [4, 4],
				},
				{
					label: "Avg. daily high (trend)",
					data: linTrendHighPast.predictions
						.map((i: any) =>
							i[0] == firstYearDirect || i[0] == curYear ? i[1] : undefined
						)
						.concat(
							linTrendHighFuture.predictions.map((i: any) =>
								i[0] == lastYearDirect ? i[1] : undefined
							)
						),
					borderColor: "rgba(255,0,0,0.7)",
					backgroundColor: "rgba(255,0,0,0.3)",
					pointRadius: 5,
				},
			],
		})

		setPlotDataLow({
			labels: yearlyAverages.map((i: any) => i.year),
			datasets: [
				{
					label: "Avg. daily low (observed)",
					data: yearlyAverages.map((i: any) =>
						i.year < curYear ? i.avgDailyLow : null
					),
					borderColor: "rgba(0,0,255,0.5)",
					backgroundColor: "rgba(0,0,255,0.5)",
					pointRadius: 0,
					fill: {
						target: "+2",
						above: "rgba(0, 0, 255, 0.05)",
						below: "rgba(0, 0, 255, 0.05)",
					},
				},
				{
					label: "Avg. daily low (projected)",
					data: yearlyAverages.map((i: any) =>
						i.year >= curYear ? i.avgDailyLow : null
					),
					borderColor: "rgba(0,0,255,0.3)",
					backgroundColor: "rgba(0,0,255,0.02)",
					pointRadius: 0,
					fill: {
						target: "+1",
						above: "rgba(0, 0, 255, 0.03)",
						below: "rgba(0, 0, 255, 0.03)",
					},
					borderDash: [4, 4],
				},
				{
					label: "Avg. daily low (trend)",
					data: linTrendLowPast.predictions
						.map((i: any) =>
							i[0] == firstYearDirect || i[0] == curYear ? i[1] : undefined
						)
						.concat(
							linTrendLowFuture.predictions.map((i: any) =>
								i[0] == lastYearDirect ? i[1] : undefined
							)
						),
					borderColor: "rgba(0,0,200,0.7)",
					backgroundColor: "rgba(0,0,255,0.3)",
					pointRadius: 5,
				},
			],
		})

		let sdPlotLabel =
			props.timeOfYear == "Summer"
				? "Number of days >= " + hotCutoff + "°" + props.unit
				: "Number of days <= " + freezingCutoff + "°" + props.unit
		setPlotDataSD({
			labels: specialDays.map((i: any) => i.year),
			datasets: [
				{
					label: sdPlotLabel + " (observed)",
					data: specialDays.map((i: any) =>
						i.year < curYear ? i.noSpecialDays : null
					),
					borderColor:
						props.timeOfYear == "Summer"
							? "rgba(255,0,0,0.5)"
							: "rgba(0,0,255,0.5)",
					backgroundColor:
						props.timeOfYear == "Summer"
							? "rgba(255,0,0,0.5)"
							: "rgba(0,0,255,0.5)",
					pointRadius: 0,
					fill: {
						target: "+2",
						above:
							props.timeOfYear == "Summer"
								? "rgba(255,0,0,0.03)"
								: "rgba(0,0,255,0.03)",
						below:
							props.timeOfYear == "Summer"
								? "rgba(255,0,0,0.03)"
								: "rgba(0,0,255,0.03)",
					},
				},
				{
					label: sdPlotLabel + " (projected)",
					data: specialDays.map((i: any) =>
						i.year >= curYear ? i.noSpecialDays : null
					),
					borderColor:
						props.timeOfYear == "Summer"
							? "rgba(255,0,0,0.5)"
							: "rgba(0,0,255,0.5)",
					backgroundColor:
						props.timeOfYear == "Summer"
							? "rgba(255,0,0,0.5)"
							: "rgba(0,0,255,0.5)",
					pointRadius: 0,
					borderDash: [4, 4],
					fill: {
						target: "+1",
						above:
							props.timeOfYear == "Summer"
								? "rgba(255,0,0,0.03)"
								: "rgba(0,0,255,0.03)",
						below:
							props.timeOfYear == "Summer"
								? "rgba(255,0,0,0.03)"
								: "rgba(0,0,255,0.03)",
					},
				},
				{
					label: "Trend",
					data: linTrendSDPast.predictions
						.map((i: any) =>
							i[0] == firstYearDirect || i[0] == curYear ? i[1] : undefined
						)
						.concat(
							linTrendSDFuture.predictions.map((i: any) =>
								i[0] == lastYearDirect ? i[1] : undefined
							)
						),
					borderColor:
						props.timeOfYear == "Summer"
							? "rgba(255,0,0,0.7)"
							: "rgba(0,0,255,0.7)",
					backgroundColor:
						props.timeOfYear == "Summer"
							? "rgba(255,0,0,0.3)"
							: "rgba(0,0,255,0.3)",
					pointRadius: 5,
				},
			],
		})
	}, [props.data, props.unit, props.city, hotCutoff])

	return (
		<div>
			<div className="mt-8">
				<h3 className="text-2xl w-full text-center my-2">
					<PiThermometerSimpleLight className="inline mr-2" />
					{props.timeOfYear}
				</h3>
				<h4 className="text-xl w-full text-center">
					{todayDelta && Math.abs(todayDelta)}°{props.unit}
					{todayDelta && todayDelta > 0 ? " hotter" : " colder"} until today,
					<br />
					{totalDelta && Math.abs(totalDelta)}°{props.unit}
					{totalDelta && totalDelta > 0 ? " hotter" : " colder"} until{" "}
					{lastYear}
				</h4>
				<h4 className="text-xl m-4 mt-8">Average daily high/low</h4>

				{lastTrendPoint &&
					thisYearTrendPoint &&
					firstTrendPoint &&
					totalDelta && (
						<>
							{props.timeOfYear == "Summer" ? (
								<p>
									In the {firstYear}s, the average summer day had a daily high
									of{" "}
									<strong>
										{firstTrendPoint}°{props.unit}
									</strong>
									. These days, the average daily high is{" "}
									<strong>
										{thisYearTrendPoint}°{props.unit}
									</strong>
									. Until {lastYear}, the daily high is projected to change to{" "}
									<strong>
										{lastTrendPoint}°{props.unit}
									</strong>
									. Oh, by the way, summer means{" "}
									{props.city.lat > 0
										? "June through August"
										: "December through February"}{" "}
									here.
								</p>
							) : (
								<p>
									In the {firstYear}s, the average winter day had a daily high
									of
									<strong>
										{firstTrendPoint}°{props.unit}
									</strong>
									. These days, the average daily high is
									<strong>
										{thisYearTrendPoint}°{props.unit}
									</strong>
									. Until {lastYear}, this is projected to change to{" "}
									<strong>
										{lastTrendPoint}°{props.unit}
									</strong>
									. ! By winter days I mean days from{" "}
									{props.city.lat > 0
										? "December to February"
										: "June to August"}
									.
								</p>
							)}
						</>
					)}

				<div className="mt-8">
					{plotData && (
						<Line
							data={plotData}
							options={{
								elements: {
									line: {
										tension: 0.2,
									},
								},
								spanGaps: true,
								scales: {
									x: {
										grid: {
											display: false,
										},
									},
								},
								plugins: {
									title: {
										display: true,
										text: "Daily temperature high",
									},
									legend: { display: false },
								},
							}}
						/>
					)}
					{plotDataLow && (
						<Line
							data={plotDataLow}
							options={{
								elements: {
									line: {
										tension: 0.2,
									},
								},
								spanGaps: true,
								scales: {
									x: {
										grid: {
											display: false,
										},
									},
								},
								plugins: {
									title: {
										display: true,
										text: "Daily temperature low",
									},
									legend: { display: false },
								},
							}}
						/>
					)}
				</div>
				<h4 className="text-xl m-4 mt-8">
					{props.timeOfYear == "Summer" ? (
						<p>
							Number of days hotter than
							<select
								className="inline select select-bordered w-min select-sm ml-2"
								value={hotCutoff}
								onChange={(e) => setHotCutoff(parseInt(e.target.value))}
							>
								{potentialHotCutoffs.map((co) => (
									<option value={co} key={co}>
										{co}°{props.unit}
									</option>
								))}
							</select>
						</p>
					) : (
						<p>Number of freezing days</p>
					)}
				</h4>
				{/* don't display if there was exactly 0 change (constant data ==> no freezing days / all hot days) */}
				{!(
					lastTrendPointSD &&
					firstTrendPointSD &&
					lastTrendPointSD - firstTrendPointSD == 0
				) ? (
					<>
						{props.timeOfYear == "Summer" ? (
							<p>
								In the plot below, you can see the number of days in the summer
								months where daily maximum temperatures were {">="}
								{hotCutoff}°{props.unit}. For many places on earth, we can see
								that this number of days has greatly increased in the past
								decades. In this case, the number of hot days has changed
								<strong>
									{" "}
									from {firstTrendPointSD} days in the 1950s to{" "}
									{thisYearTrendPointSD} days in present time.
								</strong>{" "}
								Until {lastYear}, this is projected to change to{" "}
								{lastTrendPointSD} days.
							</p>
						) : (
							<p>
								Below, you can see the number of days in the winter months where
								daily minimum temperatures were {"<="}
								{freezingCutoff}°{props.unit}. For many places on earth, we can
								see that this number of days is steadily decreasing. In this
								case, the number of freezing days has changed
								<strong>
									{" "}
									from {firstTrendPointSD} days in the 1950s to{" "}
									{thisYearTrendPointSD} days in present time.
								</strong>{" "}
								Until {lastYear}, this is projected to change to{" "}
								{lastTrendPointSD} days.
							</p>
						)}

						{plotDataSD && (
							<Line
								data={plotDataSD}
								options={{
									elements: {
										line: {
											tension: 0.2,
										},
									},
									spanGaps: true,
									scales: {
										x: {
											grid: {
												display: false,
											},
										},
									},
									plugins: {
										title: {
											display: true,
											text:
												props.timeOfYear == "Summer"
													? "Number of days hotter than " +
													  hotCutoff +
													  "°" +
													  props.unit
													: "Number of freezing days",
										},
										legend: { display: false },
									},
								}}
							/>
						)}
					</>
				) : (
					<p>No data found.</p>
				)}
			</div>
		</div>
	)
}
