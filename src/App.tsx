import { createSignal, type Component, untrack } from "solid-js";
import { Point, Projectile, RenderView, Velocity } from "./Components/render";

const App: Component = () => {
	const proj = new Projectile(new Point(0, 0), new Velocity(30, 90));
	console.log(proj.predictHorizontal(), proj.predictVertical());
	return (
		<RenderView
			projectile={proj}
			hDist={proj.predictHorizontal()}
			vDist={proj.predictVertical()}
			canvasDimensions={{ width: 1500, height: 900 }}
		/>
	);
};

export default App;
