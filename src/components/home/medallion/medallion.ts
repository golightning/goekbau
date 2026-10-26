import * as THREE from "three";
import { RELIEF } from "./shapes";

/**
 * GÖK-Logo als 3D-Medaille (Produktionsfassung des img2threejs-Durchgangs, Spec: object-sculpt-spec.json).
 * Maße relativ zum Scheibenradius 1: Kranz aus 100 Speichen bis 1,211, Relief 0,035 hoch auf der Scheibe.
 * Tonwerte wie im Original: helle gebürstete Scheibe, dunkleres Relief, mittelgrauer Kranz.
 */
export const RING_OUTER = 1.211;
const RING_INNER = 1.003;
const BARS = 100;
const DISC_DEPTH = 0.08;
const RELIEF_DEPTH = 0.035;
const ENV_INTENSITY = 1.6;

/** Gold der Marke (bronze-300) für das Streiflicht an Kanten und Speichen. */
const GOLD = 0xe2c398;

export type Medallion = {
  group: THREE.Group;
  lights: THREE.Group;
  environment: THREE.Texture;
  dispose: () => void;
};

export function createMedallion(renderer: THREE.WebGLRenderer): Medallion {
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const disposables: { dispose: () => void }[] = [];
  const keep = <T extends { dispose: () => void }>(item: T) => (disposables.push(item), item);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const studio = studioEnvironment();
  const environment = keep(pmrem.fromScene(studio, 0.04).texture);
  studio.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.geometry.dispose();
      (o.material as THREE.Material).dispose();
    }
  });
  pmrem.dispose();

  const brushed = keep(brushedTexture());
  const material = (color: number, roughness: number, grain: boolean) => {
    const m = keep(
      new THREE.MeshStandardMaterial({
        color,
        metalness: 1,
        roughness,
        roughnessMap: grain ? brushed : null,
        // Umgebung am Material statt an der Szene: nur so greift envMapIntensity (three ≥ r163)
        envMap: environment,
        envMapIntensity: ENV_INTENSITY,
      }),
    );
    m.userData.baseColor = color;
    return m;
  };
  const discMaterial = material(0xe8e8e8, 0.28, true);
  const reliefMaterial = material(0xa2a2a2, 0.34, true);
  const ringMaterial = material(0xb8b8b8, 0.42, false);

  const group = new THREE.Group();
  group.name = "goek-medallion";

  const discShape = new THREE.Shape().absarc(0, 0, 1, 0, Math.PI * 2, false);
  const discGeometry = keep(
    new THREE.ExtrudeGeometry(discShape, {
      depth: DISC_DEPTH - 0.012,
      bevelEnabled: true,
      bevelThickness: 0.006,
      bevelSize: 0.006,
      bevelOffset: -0.006,
      bevelSegments: 2,
      curveSegments: 128,
    }),
  );
  discGeometry.translate(0, 0, -DISC_DEPTH / 2 + 0.006);
  const disc = new THREE.Mesh(discGeometry, discMaterial);
  disc.name = "disc";
  group.add(disc);

  // Kranz: eine keilförmige Speiche, 100-fach instanziert; Speiche 0 liegt mittig auf der x-Achse
  const half = (Math.PI / BARS) * 0.5;
  const bar = new THREE.Shape()
    .moveTo(RING_INNER * Math.cos(-half), RING_INNER * Math.sin(-half))
    .lineTo(RING_OUTER * Math.cos(-half), RING_OUTER * Math.sin(-half))
    .lineTo(RING_OUTER * Math.cos(half), RING_OUTER * Math.sin(half))
    .lineTo(RING_INNER * Math.cos(half), RING_INNER * Math.sin(half))
    .closePath();
  const barGeometry = keep(
    new THREE.ExtrudeGeometry(bar, {
      depth: 0.04,
      bevelEnabled: true,
      bevelThickness: 0.004,
      bevelSize: 0.003,
      bevelOffset: -0.003,
      bevelSegments: 1,
    }),
  );
  barGeometry.translate(0, 0, -0.024);
  const ring = new THREE.InstancedMesh(barGeometry, ringMaterial, BARS);
  ring.name = "sunburst-ring";
  const turn = new THREE.Matrix4();
  for (let i = 0; i < BARS; i += 1) ring.setMatrixAt(i, turn.makeRotationZ((i / BARS) * Math.PI * 2));
  group.add(ring);

  const relief = new THREE.Group();
  relief.name = "relief";
  for (const part of RELIEF) {
    const shape = new THREE.Shape(part.outer.map(([x, y]) => new THREE.Vector2(x, y)));
    shape.holes = part.holes.map((h) => new THREE.Path(h.map(([x, y]) => new THREE.Vector2(x, y))));
    const geometry = keep(
      new THREE.ExtrudeGeometry(shape, {
        depth: RELIEF_DEPTH - 0.008,
        bevelEnabled: true,
        bevelThickness: 0.004,
        bevelSize: 0.005,
        bevelOffset: -0.005,
        bevelSegments: 2,
      }),
    );
    geometry.translate(0, 0, DISC_DEPTH / 2);
    const mesh = new THREE.Mesh(geometry, reliefMaterial);
    mesh.name = part.name;
    relief.add(mesh);
  }
  group.add(relief);
  group.userData.sculptRuntime = {
    spec: "goek-logo-medallion",
    pivot: "disc-centre",
    parts: ["disc", "sunburst-ring", "relief"],
  };

  const lights = new THREE.Group();
  lights.add(new THREE.AmbientLight(0xffffff, 0.15));
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(-2, 3, 4);
  const rim = new THREE.DirectionalLight(GOLD, 3);
  rim.position.set(3, 1.5, -1.5);
  lights.add(key, rim);

  return {
    group,
    lights,
    environment,
    dispose: () => disposables.forEach((d) => d.dispose()),
  };
}

/**
 * Studio-Umgebung für die Metallreflexe: Kuppel mit Helligkeitsverlauf (oben hell, unten dunkel), eine weiße
 * Softbox oben links, ein Glanzstreifen und ein goldener Lichtstreifen seitlich hinten, der die Kanten und Speichen anstreift.
 * Gleichmäßiger als RoomEnvironment, damit die Medaille beim Drehen nicht ins Dunkle kippt.
 */
function studioEnvironment(): THREE.Scene {
  const scene = new THREE.Scene();
  const dome = new THREE.SphereGeometry(10, 32, 16);
  const position = dome.getAttribute("position");
  const shade: number[] = [];
  for (let i = 0; i < position.count; i += 1) {
    const y = position.getY(i) / 10;
    const v = y > 0 ? 0.45 + 0.55 * Math.sqrt(y) : 0.45 + 0.4 * y;
    shade.push(v, v, v);
  }
  dome.setAttribute("color", new THREE.Float32BufferAttribute(shade, 3));
  scene.add(new THREE.Mesh(dome, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
  const softbox = (w: number, h: number, color: number, intensity: number, at: [number, number, number]) => {
    const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity) });
    const box = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
    box.position.set(...at);
    box.lookAt(0, 0, 0);
    scene.add(box);
  };
  softbox(6, 4, 0xffffff, 3, [-4, 5, 6]);
  // schmaler Glanzstreifen: wandert beim Drehen als Lichtkante über die gebürstete Scheibe
  softbox(12, 0.7, 0xffffff, 5, [0, 3.5, 5]);
  softbox(4, 10, GOLD, 7, [7, 1, -2]);
  return scene;
}

/** Feine waagerechte Schleifspuren als Rauheitskarte (berechnet statt Bilddatei: kein zusätzlicher Download). */
function brushedTexture(): THREE.DataTexture {
  const size = 512;
  const value = new Float32Array(size * size).fill(205);
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  for (let i = 0; i < 3000; i += 1) {
    const v = 160 + Math.floor(rand() * 95);
    const x = Math.floor(rand() * size);
    const row = Math.floor(rand() * size) * size;
    const length = Math.floor(size * (0.2 + rand() * 0.8));
    // waagerecht umlaufend, damit die Kachel nahtlos ist
    for (let k = 0; k < length; k += 1) {
      const at = row + ((x + k) % size);
      value[at] = value[at]! * 0.75 + v * 0.25;
    }
  }
  const data = new Uint8Array(size * size * 4);
  value.forEach((v, i) => data.fill(Math.round(v), i * 4, i * 4 + 3).fill(255, i * 4 + 3, i * 4 + 4));
  const texture = new THREE.DataTexture(data, size, size);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}
