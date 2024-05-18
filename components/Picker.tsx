import { useEffect, useState } from "react"
import Card from "./Card"
import { Location } from "../app/api/latlon/route"
import ClimateModelPicker from "./ClimateModelPicker"
import UnitPicker from "./UnitPicker"
import SearchBar from "./SearchBar"

export default function Picker(props: {
	chosenCity: Location
	setChosenCity: Function
	unit: string
	setUnit: Function
	climateModel: string
	setClimateModel: Function
}) {
	return (
		<Card>
			<p className="text-3xl mb-4 mt-4 leading-relaxed">
				Visualize climate change for{" "}
				<span className="decoration-dashed underline decoration-0 bg-accent text-accent-content p-2">
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
			<SearchBar selectLocation={(loc: Location) => props.setChosenCity(loc)} />
			<div className="flex flex-row w-full items-center gap-x-4">
				<UnitPicker unit={props.unit} setUnit={props.setUnit} />
				<div className="grow flex flex-row justify-end">
					<ClimateModelPicker
						climateModel={props.climateModel}
						setClimateModel={props.setClimateModel}
					/>
				</div>
			</div>
		</Card>
	)
}
