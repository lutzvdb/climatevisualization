import Card from "./Card"

export default function Footer() {
	return (
		<Card>
			<div className="text-center w-full text-sm text-gray-500">
				<p>
					This webapp was coded by{" "}
					<a
						target="_blank"
						rel="noreferrer"
						href="https://www.thisislutz.com"
						title="lutzvdb"
					>
						Lutz von der Burchard
					</a>
					, the source code is available on{" "}
					<a
						target="_blank"
						rel="noreferrer"
						href="https://github.com/lutzvdb/climatevisualizer"
						title="github"
					>
						github
					</a>
					. Everyone is kindly invited to contribute to this app.
				</p>
				<p className="mt-2">
					Weather data is provided by{" "}
					<a
						href="https://open-meteo.com"
						target="_blank"
						rel="noreferrer"
						title="Open Meteo"
					>
						open-meteo.com
					</a>{" "}
					and is based on{" "}
					<a
						href="https://www.ecmwf.int/en/forecasts/datasets/reanalysis-datasets/era5"
						target="_blank"
						rel="noreferrer"
						title="ERA5"
					>
						ERA5-reanalysis data
					</a>
					, which itself comes from the amazing{" "}
					<a
						href="https://climate.copernicus.eu"
						target="_blank"
						rel="noreferrer"
						title="Copernicus"
					>
						copernicus program.
					</a>
					The long-term climate projections are also supplied by open-meteo and
					are based on data from{" "}
					<a
						href="https://pcmdi.llnl.gov/CMIP6/"
						target="_blank"
						rel="noreferrer"
						title="CMIP6"
					>
						CMIP6
					</a>{" "}
					and are released unter{" "}
					<a
						href="https://creativecommons.org/licenses/by/4.0/"
						target="_blank"
						rel="noreferrer"
						title="CC BY 4.0"
					>
						CC BY 4.0
					</a>{" "}
					license. The climate change icon is created by{" "}
					<a
						href="https://www.flaticon.com/free-icons/climate-change"
						target="_blank"
						rel="noreferrer"
						title="climate change icons"
					>
						Freepik - Flaticon
					</a>
					.
				</p>
				<p className="mt-2">
					Please note that the underlying historical data is based on a ~11km
					grid model. Usually, this makes no difference as climate conditions
					don&apos;t often change that much within such small distances.
					However, in extreme situations, the data displayed can be misleading,
					especially when looking at places in small valleys. For example,
					looking at the data for Quito, Ecuador actually displays data for the
					surrounding mountains because that&apos;s just where the grid points
					fall, leading to suprising numbers – the climate in the mountains
					obviously is very different from the climate in the valley below.
				</p>
				<p className="mt-2">
					Furthermore, all climate projections are inherently unsecure as they
					are based on assumptions. Please consider the projected values with
					caution.
				</p>
			</div>
		</Card>
	)
}
