import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/Command"
import { FaLocationDot } from "react-icons/fa6"
import { useEffect, useState } from "react"
import { Location } from "../app/api/latlon/route"
import { BiErrorCircle } from "react-icons/bi"

const SUGGESTED_LOCATIONS: Location[] = [
	{
		name: "Kiel",
		countryCode: "DE",
		country: "Germany",
		subregion: "Schleswig-Holstein",
		lat: 54.3215,
		lon: 10.1345,
	},
	{
		name: "Buenos Aires",
		countryCode: "AR",
		country: "Argentina",
		subregion: "Buenos Aires",
		lat: -34.6037,
		lon: -58.3816,
	},
	{
		name: "New York City",
		country: "United States",
		countryCode: "US",
		subregion: "New York",
		lat: 40.7128,
		lon: -74.006,
	},
	{
		name: "Tokyo",
		country: "Japan",
		countryCode: "JP",
		subregion: "Tokyo",
		lat: 35.6895,
		lon: 139.6917,
	},
	{
		name: "Cape Town",
		country: "South Africa",
		countryCode: "ZA",
		subregion: "Western Cape",
		lat: -33.9249,
		lon: 18.4241,
	},
]

function SearchResult(props: { LocationName: string; onPress: Function }) {
	return (
		<CommandItem onSelect={() => props.onPress()}>
			<FaLocationDot className="mr-2 h-4 w-4" />
			<span>{props.LocationName}</span>
		</CommandItem>
	)
}

export default function SearchBar(props: { selectLocation: Function }) {
	const [searchText, setSearchText] = useState("")
	const [loading, setLoading] = useState(false)
	const [locations, setLocations] = useState<Location[]>([])
	const [noResults, setNoResults] = useState(false)
	const [hasSelected, setHasSelected] = useState(false)

	useEffect(() => {
		if (searchText.length < 2) return

		setHasSelected(false)
		startLooking()
	}, [searchText])

	const startLooking = async () => {
		setNoResults(false)
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
				setNoResults(true)
				return
			}
			let locations = locs.results as Location[]
			// sometimes, duplicate entries are returned
			// we need [loc.name, loc.subregion, loc.country] to be unique
			// remove duplicates
			locations = locations.filter((loc, index) => {
				return (
					index ===
					locations.findIndex(
						(l) =>
							l.name === loc.name &&
							l.subregion === loc.subregion &&
							l.country === loc.country
					)
				)
			})
			setLocations(locations)
		} else {
			setLocations([])
			setNoResults(true)
		}
	}

	const selectLocation = (loc: Location) => {
		props.selectLocation(loc)
		setHasSelected(true)
		setSearchText("")
		setLocations([])
	}

	return (
		<Command
			className="rounded-lg border shadow-md bg-base-100"
			shouldFilter={false}
			onFocus={() => setHasSelected(false)}
			onBlur={() => setHasSelected(true)}
		>
			<CommandInput
				placeholder="Start typing a location name to search..."
				onValueChange={(e) => setSearchText(e)}
				value={searchText}
				autoFocus={true}
			/>
			<CommandList className={hasSelected ? "hidden" : "block"}>
				<CommandGroup
					heading="Suggestions"
					className={locations.length > 0 ? "hidden" : "block"}
				>
					{SUGGESTED_LOCATIONS.map((loc, index) => (
						<SearchResult
							key={index}
							LocationName={
								loc.name + ", " + loc.subregion + ", " + loc.country
							}
							onPress={() => {
								selectLocation(loc)
							}}
						/>
					))}
				</CommandGroup>
				<CommandSeparator />
				<CommandGroup
					heading="Search results"
					className={locations.length > 0 || noResults ? "block" : "hidden"}
				>
					{locations.map((loc, index) => (
						<SearchResult
							key={index}
							LocationName={
								loc.name + ", " + loc.subregion + ", " + loc.country
							}
							onPress={() => {
								selectLocation(loc)
							}}
						/>
					))}
					{loading && (
						<CommandItem>
							<span className="loading loading-spinner loading-sm"></span>
							<span>Loading...</span>
						</CommandItem>
					)}
					{noResults && (
						<CommandItem>
							<BiErrorCircle className="text-error mr-2 h-4 w-4" />
							<span>No results found</span>
						</CommandItem>
					)}
				</CommandGroup>
			</CommandList>
		</Command>
	)
}
