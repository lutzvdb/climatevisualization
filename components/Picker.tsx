import { useEffect, useState } from "react"
import Card from "./Card"
import { Location } from "../app/api/latlon/route"
import ClimateModelPicker from "./ClimateModelPicker"
import UnitPicker from "./UnitPicker"

export default function Picker(props: {
	chosenCity: Location
	setChosenCity: Function
	unit: string
	setUnit: Function
	climateModel: string
	setClimateModel: Function
}) {
	const [searchText, setSearchText] = useState("")
	const [lastChangeTime, setLastChangeTime] = useState(new Date())
	const [loading, setLoading] = useState(false)
	const [locations, setLocations] = useState<Location[]>([])
	const [selectedLocation, setSelectedLocation] = useState(-1)
	const [error, setError] = useState(false)

	useEffect(() => {
		if (searchText.length < 3) return

		startLooking()
	}, [searchText])

	const startLooking = async () => {
		setError(false)
		setLoading(true)
		let res = await fetch("/api/latlon", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ searchString: searchText }),
		})
		setLoading(false)

		if (res.status == 200) {
			let locs = await res.json()
			if (!locs.results) {
				setError(true)
				return
			}
			setLocations(locs.results)
		} else {
			setError(true)
		}
	}

	const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		let newloc = 0

		if (e.key == "ArrowDown" && locations && locations.length > 0) {
			if (selectedLocation === null) {
				newloc = 0
			} else {
				if (selectedLocation == locations.length - 1) {
					newloc = 0
				} else {
					newloc = selectedLocation + 1
				}
			}
			setSelectedLocation(newloc)
			const el = document.getElementById("location_" + newloc)
			if (el) el.scrollIntoView()
			e.preventDefault()
		} else if (e.key == "ArrowUp" && locations && locations.length > 0) {
			if (selectedLocation === null) {
				newloc = locations.length
			} else {
				if (selectedLocation == 0) {
					newloc = locations.length - 1
				} else {
					newloc = selectedLocation - 1
				}
			}
			setSelectedLocation(newloc)
			e.preventDefault()
			const el = document.getElementById("location_" + newloc)
			if (el) el.scrollIntoView()
		} else if (e.key == "Enter" && locations && locations.length > 0) {
			if (selectedLocation == null) return

			selectLocation(locations[selectedLocation])
		}
	}

	const selectLocation = (loc: Location) => {
		props.setChosenCity(loc)
		setSearchText("")
		setLocations([])
	}

	return (
		<Card>
			{/* <p className="w-full text-center text-5xl">climatevisualizer</p> */}
			<p className="w-full text-center text-3xl mb-8 mt-8">
				Visualize climate change for{" "}
				<span className="decoration-dashed underline decoration-0 bg-base-300 p-2">
					{props.chosenCity.name}
					{props.chosenCity.country && ", " + props.chosenCity.country}.
				</span>
			</p>
			<p className="text-justify">
				It is normal for weather conditions to be quite different from year to
				year - some years are hotter, some are colder; some are wetter, some are
				drier. However, for many places on earth, strong trends can be observed.
				In many cases, the trend is for temperatures to be higher on average.
				The graphics below are designed to give you an idea of how the climate
				has changed to this date for the place where you live.
			</p>
			<p className="text-justify">
				The data also incorporates climate projections up until 2050. Please
				keep in mind that such long-term projections are always subject to
				assumptions and therefore only represent our current best guess as to
				what might happen.
			</p>
			<p>To look up your city, start typing its name:</p>
			<label className="input input-bordered flex items-center gap-2">
				<input
					type="text"
					className="grow"
					placeholder="Berlin"
					autoFocus={true}
					value={searchText}
					onChange={(e) => setSearchText(e.target.value)}
					onKeyDown={(e) => onSearchKeyDown(e)}
				/>
				{loading ? (
					<span className="loading loading-spinner loading-xs"></span>
				) : (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 16 16"
						fill="currentColor"
						className="w-4 h-4 opacity-70"
					>
						<path
							fillRule="evenodd"
							d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
							clipRule="evenodd"
						/>
					</svg>
				)}
			</label>
			{locations.length > 0 && (
				<div className="h-64 w-full rounded-xl overflow-scroll">
					<ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-full">
						{locations.map((loc, i) => (
							<li
								className={selectedLocation == i ? "bg-gray-200" : ""}
								id={"location_" + i}
								key={i}
							>
								<a href={"#"} onClick={() => selectLocation(loc)}>
									<img
										src={
											"https://hatscripts.github.io/circle-flags/flags/" +
											String(loc.countryCode).toLowerCase() +
											".svg"
										}
										alt={loc.country}
										className="w-8 h-8"
									/>
									{loc.name}, {loc.subregion}, {loc.country}
								</a>
							</li>
						))}
					</ul>
				</div>
			)}
			{error && (
				<div className="text-red-500">
					Something went wrong. Please try again.
				</div>
			)}
			<div className="flex flex-row w-full items-center gap-x-4">
				<UnitPicker unit={props.unit} setUnit={props.setUnit} />
				<ClimateModelPicker
					climateModel={props.climateModel}
					setClimateModel={props.setClimateModel}
				/>
			</div>
		</Card>
	)
}
