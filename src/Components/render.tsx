/* @refresh reload */
import {
	Accessor,
	Signal,
	batch,
	createEffect,
	createMemo,
	createSignal,
	on,
	onCleanup,
	untrack,
} from "solid-js";
const G = 9.81;
const r = 50;
/**
 * Point class
 * Both properties are reactive
 */
export class Point {
	private sX: Signal<number>;
	private sY: Signal<number>;
	constructor(x: number, y: number) {
		this.sX = createSignal(x);
		this.sY = createSignal(y);
	}
	get x() {
		return this.sX[0]();
	}
	set x(x) {
		this.sX[1](x);
	}
	get y() {
		return this.sY[0]();
	}
	set y(y) {
		this.sY[1](y);
	}
}
export class Velocity {
	x: number;
	y: number;
	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
	get magnitude() {
		return Math.sqrt(this.x ** 2 + this.y ** 2);
	}
	get angle() {
		return Math.atan(this.y / this.x);
	}
}
type Opts = { mass: number; c_drag: number };
export class Projectile {
	pos: Point;
	velocity: Velocity;
	opts?: Opts;
	constructor(pos: Point, v: Velocity, opts?: Opts) {
		this.pos = pos;
		this.velocity = v;
		this.opts = opts;
	}
	predictVertical() {
		const u = this.velocity.y;
		const s = u ** 2 / (2 * G);
		return untrack(() => this.pos.y) + s;
	}
	predictHorizontal() {
		const s = this.predictVertical();
		const t = Math.sqrt((2 * s) / G);
		const total = 2 * t;
		return total * this.velocity.x;
	}
	/**
	 * The predicted distances that the projectile will travel
	 */
	predicted() {
		return { x: this.predictHorizontal(), y: this.predictVertical() };
	}
	/**
	 * Advance the position of the projectile by a given time
	 * @param t Time (s)
	 */
	advance(t: number) {
		// Assume no velocity loss in the x direction
		batch(() => {
			this.pos.x += this.velocity.x * t;
			const dY = this.velocity.y * t + 0.5 * -G * t ** 2;
			this.pos.y += dY;
			const acceleration = -(G * t);
			this.velocity.y += acceleration;
		});
	}
}
type RenderViewProps = {
	projectile: Projectile;
	canvasDimensions: { width: number; height: number };
	hDist: number;
	vDist: number;
	persist?: boolean;
};
const elSize = (el: Accessor<HTMLElement | undefined>) => {
	const [size, setSize] = createSignal<{ x: number; y: number } | null>(null);
	createEffect(() => {
		const e = el();
		if (!e) return;
		e.onresize = () => {
			setSize({ x: e.offsetWidth, y: e.offsetHeight });
		};
		setSize({ x: e.offsetWidth, y: e.offsetHeight });
		onCleanup(() => (e.onresize = null));
	});
	return size;
};
export const RenderView = (props: RenderViewProps) => {
	const [el, setEl] = createSignal<HTMLCanvasElement>();
	const size = elSize(el);
	// The number of pixels per metre
	const scale = createMemo(() => {
		const s = size();
		if (!s) return;
		const sizes = {
			x: (s.x - 4 * r) / props.hDist,
			y: (s.y - 2 * r) / props.vDist,
		};
		return sizes;
	});
	// The main render method
	createEffect(() => {
		const { x, y } = props.projectile.pos;
		const s = untrack(scale);
		if (!s) return;
		const c = el();
		const ctx = c?.getContext("2d");
		if (!ctx || !c) return;
		if (!props.persist) {
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		}
		ctx.beginPath();
		const vP = ctx.canvas.height - y * s.y - r;
		const hP = x + r;
		ctx.arc(hP * s.x, vP, r, 0, 2 * Math.PI);
		ctx.fill();
		ctx.stroke();
	});
	const interval = 1 / 24;
	const i = setInterval(() => {
		props.projectile.advance(interval);
	}, interval * 1000);
	createEffect(
		on(
			() => props.projectile.pos.y,
			(y) => {
				if (!y) return;
				if (y <= 0) {
					props.projectile.velocity = new Velocity(-30, 90);
				}
			},
			{ defer: true }
		)
	);
	return (
		<canvas
			width={props.canvasDimensions.width}
			height={props.canvasDimensions.height}
			ref={setEl}
		/>
	);
};
