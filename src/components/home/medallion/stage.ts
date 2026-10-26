import * as THREE from "three";
import { createMedallion } from "./medallion";

/**
 * Bühne der Hero-Medaille: Renderer mit transparentem Grund, Kamera und Bewegung. Teilen sich die Seite
 * (HeroMedallion) und die Prüfansicht, damit das vorgerenderte Standbild exakt dem ersten Bild entspricht.
 */
const FOV = 30;
/** Halber Bildausschnitt: Kranzradius 1,211 plus Rand für die Drehung */
const FRAME = 1.36;

/** Langsames Pendeln um die Hochachse, ±34°; bei t = 0 steht die Medaille um −18° gedreht (Standbild). */
export const swing = (t: number) => 0.6 * Math.sin(0.4 * t - 0.55);
const TILT_X = 0.1;

export type Stage = {
  render: (seconds: number) => void;
  /** Zeigerposition relativ zur Bildmitte, je Achse −1 … 1 */
  pointer: (x: number, y: number) => void;
  resize: (pixels: number) => void;
  dispose: () => void;
};

export function createStage(canvas: HTMLCanvasElement, pixels: number): Stage {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(1);
  renderer.setSize(pixels, pixels, false);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const medallion = createMedallion(renderer);
  scene.add(medallion.group, medallion.lights);
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 20);
  camera.position.set(0, 0, FRAME / Math.tan((FOV * Math.PI) / 360));

  // Zeigerneigung, weich nachgeführt
  let targetX = 0;
  let targetY = 0;
  let tiltX = 0;
  let tiltY = 0;

  return {
    render(seconds) {
      tiltX += (targetX - tiltX) * 0.08;
      tiltY += (targetY - tiltY) * 0.08;
      medallion.group.rotation.set(TILT_X + tiltX, swing(seconds) + tiltY, 0);
      renderer.render(scene, camera);
    },
    pointer(x, y) {
      targetX = y * 0.18;
      targetY = x * 0.25;
    },
    resize(next) {
      renderer.setSize(next, next, false);
    },
    dispose() {
      medallion.dispose();
      renderer.dispose();
    },
  };
}
