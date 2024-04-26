import regression from "regression"

// Runs a linear regression and applies a certain precision
// more than npm's "regression" usually handles
export default function LinearRegression(data: any[], precision: number = 100) {
	const res = regression.linear(data.map((i: any) => [i[0], i[1] * precision]))

	return {
		predictions: res.points.map((i) => [i[0], i[1] / precision]),
		gradient: res.equation[0] / precision,
	}
}
