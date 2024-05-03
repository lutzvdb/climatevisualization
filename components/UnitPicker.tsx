export default function UnitPicker(props: { unit: string; setUnit: Function }) {
	return (
		<form>
			<div className="flex flex-row w-full">
				<div className="flex gap-2 items-center">
					<span className="text-sm font-medium text-gray-900 dark:text-gray-300">
						Metric
					</span>
					<label className="relative inline-flex items-center cursor-pointer">
						<input
							type="checkbox"
							value=""
							className="sr-only peer"
							checked={props.unit == "F"}
							onChange={(e) => props.setUnit(e.target.checked ? "F" : "C")}
						/>
						<div className="w-11 h-6 bg-base-300 peer-focus:outline-none rounded-full peer dark:bg-base-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 " />
					</label>
					<span className="text-sm font-medium text-gray-900 dark:text-gray-300">
						Imperial
					</span>
				</div>
			</div>
		</form>
	)
}
