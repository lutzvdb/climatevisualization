export default function Card(props: { children: React.ReactNode }) {
	return (
		<div className="bg-base-200 rounded-xl p-4 flex flex-col gap-y-4 w-full">
			{props.children}
		</div>
	)
}
