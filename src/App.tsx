import {
	createSignal,
	type Component,
	createEffect,
	on,
	untrack,
} from "solid-js";
import { Point, Projectile, RenderView, Velocity } from "./Components/render";
import { throttle } from "@solid-primitives/scheduled";
const App: Component = () => {
	const [persist, setPersist] = createSignal(
		localStorage.getItem("persist") == "true"
	);
	const [cE, setCe] = createSignal<number>(
		parseInt(localStorage.getItem("collision_elasticity") ?? "100")
	);
	const proj = new Projectile(
		new Point(0, 0),
		new Velocity(30, 90),
		undefined,
		cE() / 100
	);
	createEffect(
		on(
			cE,
			() => {
				proj.c_elasticity = cE() / 100;
			},
			{ defer: true }
		)
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
	createEffect(
		on(
			cE,
			throttle(
				() => localStorage.setItem("collision_elasticity", cE().toString()),
				500
			),
			{ defer: true }
		)
	);
	return (
		<div class="h-full w-full flex flex-row">
			<RenderView
				projectile={proj}
				hDist={proj.predictHorizontal()}
				vDist={proj.predictVertical()}
				canvasDimensions={{ width: 1500, height: 900 }}
				persist={persist()}
			/>
			<div class="flex flex-col w-full">
				<button onClick={() => setPersist((p) => !p)}>Persist path</button>
				Collision Elastisity: {cE()}%
				<input
					type="range"
					onInput={(a) => setCe(parseInt(a.target.value))}
					min="0"
					max="100"
					value={untrack(cE)}
				/>
				<span>
					(x, y): ({proj.pos.x.toFixed(2)}, {proj.pos.y.toFixed(2)})
				</span>
			</div>
		</div>
	);
};

export default App;
