import {
	createSignal,
	type Component,
	createEffect,
	on,
} from "solid-js";
import { Point, Projectile, RenderView, Velocity } from "./Components/render";

const App: Component = () => {
	const proj = new Projectile(new Point(0, 0), new Velocity(30, 90));
	const [persist, setPersist] = createSignal(
		localStorage.getItem("persist") == "true"
	);
	createEffect(
		on(
			persist,
			() => {
				localStorage.setItem("persist", persist().toString());
			},
			{ defer: true }
		)
	);
	return (
		<div>
			<button onClick={() => setPersist((p) => !p)}>Persist path</button>
			<RenderView
				projectile={proj}
				hDist={proj.predictHorizontal()}
				vDist={proj.predictVertical()}
				canvasDimensions={{ width: 1500, height: 900 }}
				persist={persist()}
			/>
		</div>
	);
};

export default App;
