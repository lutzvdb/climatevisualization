import { Location } from "@/app/api/latlon/route"
import Card from "./Card"
import { useEffect, useState } from "react"
import { PreparedData, prepareRawData } from "@/lib/dataAggregation"
import TempVis from "./TempVis"
import PrecipVis from "./PrecipVis"
import {
	Chart as ChartJS,
	LineController,
	LineElement,
	PointElement,
	CategoryScale,
	LinearScale,
	Filler,
	Tooltip,
	Title,
} from "chart.js"

ChartJS.register(
	LineController,
	LineElement,
	PointElement,
	CategoryScale,
	LinearScale,
	Filler,
	Tooltip,
	Title
)

export default function ClimateViewer(props: {
	city: Location
	unit: string
	climateModel: string
}) {
	const [activeTab, setActiveTab] = useState(1)
	const [rawData, setRawData] = useState<any>(null)
	const [preparedData, setPreparedData] = useState<PreparedData | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(false)

	const getRawData = async () => {
		setLoading(true)
		let res = await fetch("/api/weather", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ lat: props.city.lat, lon: props.city.lon }),
		})

		if (res.status == 200) {
			let dt = await res.json()
			if (!dt.forecast || !dt.history) {
				setError(true)
				return
			}
			setRawData(dt)
		} else {
			setError(true)
		}
	}

	useEffect(() => {
		// Upon receival of new data, change of unit or climate model, re-prepare raw data
		if (!rawData) return

		let preparedData = prepareRawData(rawData, props.unit, props.climateModel)
		setPreparedData(preparedData)
		setLoading(false)
	}, [rawData, props.unit, props.climateModel])

	useEffect(() => {
		if (props.city.lat == 0 && props.city.lon == 0) return

		getRawData()
	}, [props.city])

	return (
		<>
			{props.city.country != "" && (
				<Card>
					{loading && (
						<div className="w-full flex justify-center">
							<span className="loading loading-spinner loading-md"></span>
						</div>
					)}
					{!loading && (
						<div className="flex w-full justify-center ">
							<div className="tabs tabs-bordered">
								<button
									className={
										"tab tab-bordered" + (activeTab == 1 ? " tab-active" : "")
									}
									onClick={() => setActiveTab(1)}
								>
									Summer
								</button>
								<button
									className={
										"tab tab-bordered" + (activeTab == 2 ? " tab-active" : "")
									}
									onClick={() => setActiveTab(2)}
								>
									Winter
								</button>
								<button
									className={
										"tab tab-bordered" + (activeTab == 3 ? " tab-active" : "")
									}
									onClick={() => setActiveTab(3)}
								>
									Rain
								</button>
								<button
									className={
										"tab tab-bordered" + (activeTab == 4 ? " tab-active" : "")
									}
									onClick={() => setActiveTab(4)}
								>
									Snow
								</button>
							</div>
						</div>
					)}
					<div className={activeTab == 1 ? "" : "hidden"}>
						{preparedData && (
							<TempVis
								data={preparedData}
								unit={props.unit}
								timeOfYear="Summer"
								city={props.city}
							/>
						)}
					</div>
					<div className={activeTab == 2 ? "" : "hidden"}>
						{preparedData && (
							<TempVis
								data={preparedData}
								unit={props.unit}
								timeOfYear="Winter"
								city={props.city}
							/>
						)}
					</div>
					<div className={activeTab == 3 ? "" : "hidden"}>
						{preparedData && (
							<PrecipVis
								data={preparedData}
								unit={props.unit == "C" ? "mm" : " inches"}
								type="rain"
								city={props.city}
							/>
						)}
					</div>
					<div className={activeTab == 4 ? "" : "hidden"}>
						{preparedData && (
							<PrecipVis
								data={preparedData}
								unit={props.unit == "C" ? "cm" : " inches"}
								type="snow"
								city={props.city}
							/>
						)}
					</div>
				</Card>
			)}
		</>
	)
}
