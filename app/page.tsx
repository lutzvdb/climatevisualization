"use client"

import Footer from "@/components/Footer"
import Picker from "@/components/Picker"
import { useState } from "react"
import { Location } from "./api/latlon/route"
import ClimateViewer from "@/components/ClimateViewer"

const DEFAULT_CITY =
	process.env.NODE_ENV === "development"
		? {
				name: "Berlin",
				country: "Germany",
				subregion: "Berlin",
				countryCode: "DE",
				lat: 52.52437,
				lon: 13.41053,
		  }
		: {
				name: "your city",
				country: "",
				subregion: "",
				countryCode: "",
				lat: 0,
				lon: 0,
		  }

export default function Home() {
	const [chosenCity, setChosenCity] = useState<Location>(DEFAULT_CITY)
	const [unit, setUnit] = useState("C")
	const [climateModel, setClimateModel] = useState("MRI_AGCM3_2_S")

	return (
		<div className="flex flex-col gap-y-4">
			<Picker
				chosenCity={chosenCity}
				setChosenCity={setChosenCity}
				setUnit={setUnit}
				unit={unit}
				climateModel={climateModel}
				setClimateModel={setClimateModel}
			/>
			<ClimateViewer
				city={chosenCity}
				unit={unit}
				climateModel={climateModel}
			/>
			<Footer />
		</div>
	)
}
