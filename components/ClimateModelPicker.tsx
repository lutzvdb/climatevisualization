interface singleClimateModel {
	specifier: string
	country: string
	link: string
}
export const climateModels: singleClimateModel[] = [
	{
		specifier: "CMCC_CM2_VHR4",
		country: "Italy",
		link: "https://www.wdc-climate.de/ui/cmip6?input=CMIP6.HighResMIP.CMCC.CMCC-CM2-VHR4",
	},
	{
		specifier: "FGOALS_f3_H",
		country: "China",
		link: "https://www.wdc-climate.de/ui/cmip6?input=CMIP6.HighResMIP.CAS.FGOALS-f3-H",
	},
	{
		specifier: "HiRAM_SIT_HR",
		country: "Taiwan",
		link: "https://www.wdc-climate.de/ui/cmip6?input=CMIP6.HighResMIP.AS-RCEC.HiRAM-SIT-HR",
	},
	{
		specifier: "MRI_AGCM3_2_S",
		country: "Japan",
		link: "https://www.wdc-climate.de/ui/cmip6?input=CMIP6.HighResMIP.MRI.MRI-AGCM3-2-S.highresSST-present",
	},
	{
		specifier: "EC_Earth3P_HR",
		country: "Europe",
		link: "https://www.wdc-climate.de/ui/cmip6?input=CMIP6.HighResMIP.EC-Earth-Consortium.EC-Earth3P-HR",
	},
	{
		specifier: "MPI_ESM1_2_XR",
		country: "Germany",
		link: "https://www.wdc-climate.de/ui/cmip6?input=CMIP6.HighResMIP.MPI-M.MPI-ESM1-2-XR",
	},
	{
		specifier: "NICAM16_8S",
		country: "Japan",
		link: "https://www.wdc-climate.de/ui/cmip6?input=CMIP6.HighResMIP.MIROC.NICAM16-8S",
	},
]

export default function ClimateModelPicker(props: {
	climateModel: string
	setClimateModel: Function
}) {
	return (
		<div>
			{/* <!-- The button to open modal --> */}
			<label
				htmlFor="climateModelModal"
				className="btn btn-sm btn-outline btn-secondary"
			>
				Change the climate model
			</label>
			<input type="checkbox" id="climateModelModal" className="modal-toggle" />
			<div className="modal">
				<div className="modal-box">
					<h3 className="font-bold text-lg mb-4">Choose a climate model</h3>
					<p>
						Multiple climate modles for long-term forecasts are available. They
						differ in their assumptions and therefore yield different outcomes.
						Some models don&apos;t offer projections for rainfall or snowfall,
						however all models provide predictions for temperature.
					</p>
					<p className="my-4">Available models are:</p>
					<div className="mt-4 overflow-x-auto">
						<table className="table w-full">
							<thead>
								<tr>
									<th />
									<th>Name</th>
									<th>Origin</th>
									<th>Link</th>
								</tr>
							</thead>
							<tbody>
								{climateModels.map((mdl, i) => (
									<tr
										className={
											props.climateModel == mdl.specifier ? "font-bold" : ""
										}
										key={i}
									>
										<td>{i + 1}</td>
										<td>
											<a
												href={"#"}
												onClick={() => {
													props.setClimateModel(mdl.specifier)
												}}
											>
												<label
													htmlFor="climateModelModal"
													className="cursor-pointer"
												>
													{mdl.specifier}
												</label>
											</a>
										</td>
										<td>{mdl.country}</td>
										<td>
											<a
												href={mdl.link}
												title={mdl.specifier}
												target="_blank"
												rel="noreferrer"
											>
												More info
											</a>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<div className="modal-action">
						<label
							htmlFor="climateModelModal"
							className="btn btn-outline btn-success min-w-44"
						>
							Ok
						</label>
					</div>
				</div>
			</div>
		</div>
	)
}
