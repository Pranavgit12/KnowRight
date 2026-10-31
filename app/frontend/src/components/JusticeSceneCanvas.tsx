import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { motion, useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import {
  BufferGeometry,
  CatmullRomCurve3,
  ExtrudeGeometry,
  Float32BufferAttribute,
  LatheGeometry,
  MeshPhysicalMaterial,
  PMREMGenerator,
  PointsMaterial,
  Quaternion,
  Shape,
  TubeGeometry,
  Vector3,
  Vector2,
  type BufferAttribute,
  type Group,
  type PointLight,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

type Point3 = [number, number, number];

function useSilverMaterial() {
  return useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: "#d9dce0",
        metalness: 0.88,
        roughness: 0.2,
        clearcoat: 0.72,
        clearcoatRoughness: 0.16,
      }),
    [],
  );
}

function StudioEnvironment() {
  const { gl, scene } = useThree();

  useEffect(() => {
    const generator = new PMREMGenerator(gl);
    const environment = generator.fromScene(new RoomEnvironment(), 0.035);
    scene.environment = environment.texture;
    scene.background = null;
    gl.setClearColor("#000000", 0);
    return () => {
      scene.environment = null;
      environment.dispose();
      generator.dispose();
    };
  }, [gl, scene]);

  return null;
}

function Limb({
  from,
  to,
  radius,
  material,
}: {
  from: Point3;
  to: Point3;
  radius: number;
  material: MeshPhysicalMaterial;
}) {
  const transform = useMemo(() => {
    const start = new Vector3(...from);
    const end = new Vector3(...to);
    const direction = end.clone().sub(start);
    return {
      position: start.add(end).multiplyScalar(0.5),
      quaternion: new Quaternion().setFromUnitVectors(
        new Vector3(0, 1, 0),
        direction.clone().normalize(),
      ),
      length: direction.length(),
    };
  }, [from, to]);

  return (
    <mesh
      position={transform.position}
      quaternion={transform.quaternion}
      material={material}
      castShadow
    >
      <cylinderGeometry args={[radius * 0.82, radius, transform.length, 20, 1]} />
    </mesh>
  );
}

function SilverSphere({
  position,
  scale,
  material,
}: {
  position: Point3;
  scale: Point3;
  material: MeshPhysicalMaterial;
}) {
  return (
    <mesh position={position} scale={scale} material={material} castShadow>
      <sphereGeometry args={[1, 32, 24]} />
    </mesh>
  );
}

function Tube({
  points,
  radius,
  material,
}: {
  points: Point3[];
  radius: number;
  material: MeshPhysicalMaterial;
}) {
  const geometry = useMemo(() => {
    const curve = new CatmullRomCurve3(points.map((point) => new Vector3(...point)));
    return new TubeGeometry(curve, 32, radius, 8, false);
  }, [points, radius]);

  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} material={material} castShadow />;
}

const drapeFolds: Point3[][] = [
  [[-.31, .48, .24], [-.24, .12, .32], [-.22, -.45, .39], [-.49, -1.25, .48], [-.6, -1.65, .43]],
  [[-.15, .55, .28], [-.1, .02, .34], [-.05, -.6, .39], [-.2, -1.25, .5], [-.26, -1.72, .46]],
  [[.04, .52, .29], [.12, .05, .34], [.25, -.55, .37], [.12, -1.25, .49], [.03, -1.76, .46]],
  [[.22, .43, .23], [.3, -.12, .3], [.42, -.7, .33], [.45, -1.3, .43], [.34, -1.7, .42]],
  [[-.38, -.2, .28], [-.32, -.65, .36], [-.43, -1.08, .42], [-.55, -1.47, .45]],
  [[.36, -.25, .25], [.29, -.7, .33], [.2, -1.1, .4], [.1, -1.56, .46]],
];

function Pan({ x, silver, bronze }: { x: number; silver: MeshPhysicalMaterial; bronze: MeshPhysicalMaterial }) {
  const bowl = useMemo(
    () => new LatheGeometry([
      new Vector2(0, 0),
      new Vector2(.18, 0),
      new Vector2(.21, -.035),
      new Vector2(.16, -.12),
      new Vector2(.08, -.18),
      new Vector2(0, -.2),
    ], 32),
    [],
  );
  useEffect(() => () => bowl.dispose(), [bowl]);
  return (
    <group position={[x, .38, 0]}>
      <mesh position={[0, -.015, 0]} geometry={bowl} material={silver} castShadow />
      <mesh position={[0, .015, 0]} material={bronze}>
        <torusGeometry args={[.185, .018, 8, 32]} />
      </mesh>
    </group>
  );
}

function Sword({ silver, bronze }: { silver: MeshPhysicalMaterial; bronze: MeshPhysicalMaterial }) {
  const blade = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(-.075, .02);
    shape.lineTo(-.09, -.77);
    shape.lineTo(0, -1.24);
    shape.lineTo(.09, -.77);
    shape.lineTo(.075, .02);
    shape.closePath();
    return new ExtrudeGeometry(shape, { depth: .035, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: .018, bevelThickness: .018 });
  }, []);
  useEffect(() => () => blade.dispose(), [blade]);
  return (
    <group position={[.79, -.43, .18]} rotation={[0, 0, -.13]}>
      <mesh position={[0, -.9, 0]} geometry={blade} material={silver} castShadow />
      <mesh position={[0, .02, .035]} castShadow>
        <cylinderGeometry args={[.035, .028, .3, 16]} />
        <meshPhysicalMaterial color="#333438" metalness={.75} roughness={.28} />
      </mesh>
      <mesh position={[0, -.13, .035]} rotation={[0, 0, Math.PI / 2]} material={bronze} castShadow>
        <cylinderGeometry args={[.045, .045, .3, 16]} />
      </mesh>
      <SilverSphere position={[0, .2, .035]} scale={[.07, .07, .07]} material={silver} />
      <mesh position={[0, -.27, .035]} material={silver}>
        <cylinderGeometry args={[.045, .045, .08, 16]} />
      </mesh>
    </group>
  );
}

function JusticeModel({ reducedMotion, mobile }: { reducedMotion: boolean; mobile: boolean }) {
  const root = useRef<Group>(null);
  const upper = useRef<Group>(null);
  const scale = useRef<Group>(null);
  const leftPan = useRef<Group>(null);
  const rightPan = useRef<Group>(null);
  const shimmerLight = useRef<PointLight>(null);
  const silver = useSilverMaterial();
  const bronze = useMemo(
    () => new MeshPhysicalMaterial({ color: "#a66b32", metalness: .91, roughness: .23, clearcoat: .72, clearcoatRoughness: .16 }),
    [],
  );
  const darkMetal = useMemo(
    () => new MeshPhysicalMaterial({ color: "#222429", metalness: .48, roughness: .38 }),
    [],
  );
  const cloth = useMemo(
    () => new MeshPhysicalMaterial({ color: "#c5c8cd", metalness: .76, roughness: .27, clearcoat: .55 }),
    [],
  );
  const folds = useMemo(
    () => new MeshPhysicalMaterial({ color: "#f0f1f3", metalness: .9, roughness: .16, clearcoat: .85 }),
    [],
  );
  const gown = useMemo(
    () => new LatheGeometry([
      new Vector2(.15, -1.85), new Vector2(.34, -1.77), new Vector2(.49, -1.52),
      new Vector2(.43, -1.24), new Vector2(.35, -.88), new Vector2(.32, -.48),
      new Vector2(.36, -.1), new Vector2(.4, .26), new Vector2(.34, .55),
      new Vector2(.28, .76), new Vector2(.2, .82),
    ], 64),
    [],
  );
  const swordGeometry = useMemo(() => {
    const positions = new Float32Array(90 * 3);
    for (let i = 0; i < 90; i += 1) {
      const angle = i * 2.399963;
      const radius = .6 + ((i * 37) % 100) / 100 * 1.35;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = ((i * 73) % 100) / 100 * 4 - 1.8;
      positions[i * 3 + 2] = Math.sin(angle) * radius * .55;
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    return geometry;
  }, []);
  const dustMaterial = useMemo(
    () => new PointsMaterial({ color: "#b77a2c", size: .022, transparent: true, opacity: .46, sizeAttenuation: true }),
    [],
  );
  const scrollBlend = useRef(0);

  useEffect(() => {
    if (!root.current || reducedMotion) return;
    const entrance = gsap.fromTo(
      root.current.scale,
      { x: .92, y: .92, z: .92 },
      { x: 1.06, y: 1.06, z: 1.06, duration: 1.65, ease: "power3.out", delay: .12 },
    );
    return () => { entrance.kill(); };
  }, [reducedMotion]);

  useEffect(() => () => {
    gown.dispose();
    swordGeometry.dispose();
    dustMaterial.dispose();
    silver.dispose();
    bronze.dispose();
    cloth.dispose();
    folds.dispose();
    darkMetal.dispose();
  }, [gown, swordGeometry, dustMaterial, silver, bronze, cloth, folds, darkMetal]);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    if (reducedMotion) return;
    if (root.current) {
      const progress = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1);
      scrollBlend.current += (progress - scrollBlend.current) * Math.min(delta * 2, 1);
      root.current.rotation.y = Math.sin(time * .31) * .045 + scrollBlend.current * -.09 + state.pointer.x * .045;
      root.current.rotation.x = state.pointer.y * -.025;
      root.current.position.y = -.035 + Math.sin(time * .8) * .022 - scrollBlend.current * .12;
    }
    if (shimmerLight.current) {
      shimmerLight.current.position.x = 1.7 + Math.sin(time * .26) * 1.2;
      shimmerLight.current.position.y = 2.75 + Math.cos(time * .22) * .3;
    }
    if (upper.current) upper.current.rotation.y = Math.sin(time * .42) * .045;
    if (scale.current) scale.current.rotation.z = Math.sin(time * .72) * .035;
    const swing = Math.sin(time * 1.05) * .055;
    if (leftPan.current) leftPan.current.rotation.z = swing;
    if (rightPan.current) rightPan.current.rotation.z = Math.sin(time * 1.05 + .4) * .055;
    const dust = swordGeometry.getAttribute("position") as BufferAttribute;
    if (!mobile) {
      for (let i = 0; i < dust.count; i += 1) {
        const baseY = ((i * 73) % 100) / 100 * 4 - 1.8;
        dust.setY(i, baseY + Math.sin(time * .28 + i) * .035);
      }
      dust.needsUpdate = true;
    }
  });

  return (
    <group ref={root} position={[0, 0, 0]} scale={1.06}>
      <mesh position={[0, -1.94, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[.78, 64]} />
        <meshStandardMaterial color="#d9d4ca" roughness={.48} metalness={.22} />
      </mesh>
      <pointLight ref={shimmerLight} position={[1.7, 2.75, 2.4]} color="#f2c27d" intensity={28} distance={5} decay={2} />

      <mesh geometry={gown} material={cloth} castShadow receiveShadow />
      {drapeFolds.map((points, index) => (
        <Tube key={`fold-${index}`} points={points} radius={index % 2 ? .021 : .029} material={folds} />
      ))}
      <Tube points={[[-.32, .48, .22], [-.12, .37, .32], [.13, .38, .32], [.36, .51, .2]]} radius={.052} material={bronze} />
      <Tube points={[[-.37, -.05, .31], [-.18, -.12, .37], [.07, -.1, .37], [.36, .02, .28]]} radius={.027} material={silver} />
      {[-.25, -.08, .09, .26].map((x) => (
        <SilverSphere key={x} position={[x, -.08, .39]} scale={[.045, .045, .022]} material={silver} />
      ))}

      <Limb from={[-.2, -.93, .12]} to={[-.3, -1.8, .25]} radius={.16} material={silver} />
      <Limb from={[.14, -.92, .1]} to={[.29, -1.75, .23]} radius={.15} material={silver} />
      <SilverSphere position={[-.3, -1.79, .37]} scale={[.19, .075, .3]} material={silver} />
      <SilverSphere position={[.29, -1.74, .35]} scale={[.18, .07, .29]} material={silver} />

      <group ref={upper} position={[0, 0, 0]}>
        <Limb from={[0, .68, 0]} to={[0, .94, 0]} radius={.12} material={silver} />
        <SilverSphere position={[0, 1.31, .08]} scale={[.24, .31, .22]} material={silver} />
        <SilverSphere position={[0, 1.48, .07]} scale={[.235, .22, .21]} material={silver} />
        <SilverSphere position={[0, 1.17, .16]} scale={[.14, .09, .12]} material={silver} />
        <SilverSphere position={[0, 1.48, -.12]} scale={[.29, .3, .23]} material={silver} />
        <SilverSphere position={[-.12, 1.66, -.12]} scale={[.16, .11, .16]} material={silver} />
        <SilverSphere position={[.1, 1.69, -.13]} scale={[.16, .11, .16]} material={silver} />
        <SilverSphere position={[-.23, 1.41, -.01]} scale={[.07, .11, .08]} material={silver} />
        <SilverSphere position={[.23, 1.41, -.01]} scale={[.07, .11, .08]} material={silver} />
        <SilverSphere position={[-.11, 1.39, .19]} scale={[.11, .085, .07]} material={silver} />
        <SilverSphere position={[.11, 1.39, .19]} scale={[.11, .085, .07]} material={silver} />
        <Limb from={[0, 1.57, .22]} to={[0, 1.39, .32]} radius={.045} material={silver} />
        <SilverSphere position={[0, 1.37, .33]} scale={[.05, .035, .045]} material={silver} />
        <Tube points={[[-.075, 1.29, .27], [0, 1.275, .3], [.075, 1.29, .27]]} radius={.014} material={silver} />
        <Tube points={[[-.22, 1.8, -.02], [-.16, 1.93, -.13], [0, 1.98, -.2], [.16, 1.93, -.13], [.23, 1.8, -.02]]} radius={.033} material={folds} />
        <Tube points={[[-.2, 1.78, .01], [-.12, 1.9, -.06], [0, 1.94, -.12], [.13, 1.9, -.06], [.2, 1.78, .01]]} radius={.023} material={silver} />
        <Tube points={[[-.2, 1.58, -.1], [-.33, 1.39, -.13], [-.33, 1.08, -.11], [-.24, .9, -.06]]} radius={.055} material={silver} />
        <Tube points={[[.18, 1.6, -.1], [.31, 1.4, -.14], [.32, 1.12, -.11], [.22, .95, -.05]]} radius={.052} material={silver} />
        <Tube points={[[-.19, 1.75, -.13], [-.27, 1.57, -.22], [-.31, 1.28, -.2]]} radius={.025} material={folds} />
        <Tube points={[[.16, 1.78, -.13], [.27, 1.57, -.22], [.31, 1.3, -.2]]} radius={.025} material={folds} />

        <mesh position={[0, 1.51, .245]} rotation={[0, 0, -.02]} castShadow>
          <boxGeometry args={[.43, .105, .055]} />
          <meshPhysicalMaterial color="#17191d" metalness={.3} roughness={.3} clearcoat={.85} />
        </mesh>
        <Tube points={[[-.21, 1.51, .23], [-.27, 1.53, .12], [-.26, 1.56, -.03], [-.21, 1.59, -.19]]} radius={.027} material={darkMetal} />
        <Tube points={[[.21, 1.51, .23], [.27, 1.53, .12], [.26, 1.56, -.03], [.21, 1.59, -.19]]} radius={.027} material={darkMetal} />
        <Tube points={[[-.22, 1.56, .25], [-.15, 1.6, .28], [-.1, 1.55, .29]]} radius={.012} material={darkMetal} />
        <Tube points={[[.22, 1.56, .25], [.15, 1.6, .28], [.1, 1.55, .29]]} radius={.012} material={darkMetal} />
        <SilverSphere position={[0, 1.4, .262]} scale={[.025, .04, .02]} material={silver} />

        <Limb from={[-.34, .62, 0]} to={[-.58, .92, .04]} radius={.105} material={silver} />
        <SilverSphere position={[-.58, .92, .04]} scale={[.11, .11, .11]} material={silver} />
        <Limb from={[-.58, .92, .04]} to={[-.79, 1.63, .04]} radius={.078} material={silver} />
        <SilverSphere position={[-.79, 1.65, .04]} scale={[.09, .11, .09]} material={silver} />
        <SilverSphere position={[-.78, 1.76, .04]} scale={[.095, .105, .095]} material={silver} />
        <Limb from={[-.78, 1.76, .04]} to={[-.83, 1.87, .04]} radius={.035} material={silver} />

        <Limb from={[.34, .62, 0]} to={[.56, .23, .03]} radius={.105} material={silver} />
        <SilverSphere position={[.56, .23, .03]} scale={[.105, .105, .1]} material={silver} />
        <Limb from={[.56, .23, .03]} to={[.78, -.35, .12]} radius={.074} material={silver} />
        <SilverSphere position={[.78, -.38, .16]} scale={[.085, .11, .08]} material={silver} />
        <Sword silver={silver} bronze={bronze} />

        <group ref={scale} position={[-.78, 1.55, .02]}>
          <group position={[.78, -1.55, -.02]}>
            <Limb from={[-1.42, 1.43, .02]} to={[-.17, 1.43, .02]} radius={.022} material={bronze} />
            <SilverSphere position={[-.78, 1.43, .02]} scale={[.065, .065, .065]} material={silver} />
            <Limb from={[-.78, 1.4, .02]} to={[-.78, 1.18, .02]} radius={.018} material={silver} />
            <Limb from={[-1.35, 1.4, .02]} to={[-1.35, 1.16, .02]} radius={.012} material={silver} />
            <Limb from={[-.21, 1.4, .02]} to={[-.21, 1.16, .02]} radius={.012} material={silver} />
            <Tube points={[[-1.35, 1.17, .02], [-1.23, .68, .02], [-1.07, .48, .02]]} radius={.011} material={silver} />
            <Tube points={[[-1.35, 1.17, .02], [-1.46, .7, .02], [-1.61, .48, .02]]} radius={.011} material={silver} />
            <Tube points={[[-.21, 1.17, .02], [-.08, .68, .02], [.08, .48, .02]]} radius={.011} material={silver} />
            <Tube points={[[-.21, 1.17, .02], [-.32, .7, .02], [-.47, .48, .02]]} radius={.011} material={silver} />
            <group ref={leftPan} position={[-1.35, 1.16, .02]}>
              <group position={[1.35, -1.16, -.02]}><Pan x={-1.35} silver={silver} bronze={bronze} /></group>
            </group>
            <group ref={rightPan} position={[-.21, 1.16, .02]}>
              <group position={[.21, -1.16, -.02]}><Pan x={-.21} silver={silver} bronze={bronze} /></group>
            </group>
          </group>
        </group>
      </group>

      {!mobile && <points geometry={swordGeometry} material={dustMaterial} />}
      <ContactShadows position={[0, -1.96, 0]} opacity={.24} scale={4.5} blur={2.2} far={3.5} />
    </group>
  );
}

export function JusticeScene({ className }: { className: string }) {
  const reducedMotion = useReducedMotion() ?? false;
  const [mobile, setMobile] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const sceneElement = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 620px)");
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const element = sceneElement.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { rootMargin: "120px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  return (
    <motion.div
      ref={sceneElement}
      className={`justice-scene ${className}`}
      initial={reducedMotion ? false : { opacity: 0, y: 24, scale: .97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: .9, ease: [.2, .75, .25, 1], delay: .08 }}
      role="img"
      aria-label="Custom-built animated 3D Lady Justice statue in silver and bronze, blindfolded and holding balance scales and a sword."
    >
      <Canvas
        shadows
        dpr={mobile ? 1 : [1, 1.5]}
        camera={{ position: [0, .08, 8.6], fov: 34 }}
        gl={{ antialias: !mobile, alpha: true, powerPreference: mobile ? "low-power" : "high-performance" }}
        frameloop={reducedMotion || !isInView || !pageVisible ? "demand" : "always"}
        fallback={<p className="justice-scene-fallback">3D scene unavailable in this browser.</p>}
      >
        <StudioEnvironment />
        <ambientLight intensity={.68} />
        <hemisphereLight args={["#ffffff", "#73757a", 1.5]} />
        <directionalLight position={[-4, 6, 5]} intensity={3.3} color="#fff4df" castShadow shadow-mapSize={[1024, 1024]} />
        <directionalLight position={[4, 2, -3]} intensity={2.4} color="#d3e2ff" />
        <pointLight position={[1.5, 3.5, 4]} intensity={125} color="#fffaf0" />
        <pointLight position={[-3, 1.2, 1]} intensity={68} color="#efaa55" />
        <JusticeModel reducedMotion={reducedMotion} mobile={mobile} />
      </Canvas>
      <span className="justice-scene-caption" aria-hidden="true">A symbol of balance, rendered in motion.</span>
    </motion.div>
  );
}
