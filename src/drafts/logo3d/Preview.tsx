"use client";

import { useEffect, useRef } from "react";

/**
 * Prüfansicht für das 3D-Logo (img2threejs-Durchgänge): rendert das Modell auf dem Hero-Grund #141414 aus
 * einem per URL gewählten Blickwinkel (?az=0&el=0, ortho=1, stripped=1, envi=…) und setzt window.__medallionReady.
 * ?src=stage rendert das Standbild der Hero-Bühne. Die generierte img2threejs-Rohfassung ist durch
 * src/components/home/medallion ersetzt.
 */
export function Preview() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let disposed = false;
    const params = new URLSearchParams(location.search);
    const az = Number(params.get("az") ?? 0);
    const el = Number(params.get("el") ?? 0);
    const src = params.get("src") ?? "production";
    (async () => {
      const THREE = await import("three");
      if (disposed) return; // StrictMode: der erste Effektlauf wird sofort verworfen
      if (src === "stage") {
        // Standbild der Hero-Bühne bei t (Standard 0) mit transparentem Grund – Quelle für medaille-*.webp
        const { createStage } = await import("@/components/home/medallion/stage");
        const size = Number(params.get("size") ?? 480);
        const canvas = document.createElement("canvas");
        canvas.style.width = canvas.style.height = `${size}px`;
        const stage = createStage(canvas, size);
        host.current?.appendChild(canvas);
        stage.render(Number(params.get("t") ?? 0));
        (window as unknown as { __medallionReady: boolean }).__medallionReady = true;
        return;
      }
      const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
      const size = Number(params.get("size") ?? 900);
      renderer.setSize(size, size);
      renderer.setPixelRatio(1);
      renderer.setClearColor(0x141414, 1);
      host.current?.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const ortho = params.get("ortho") === "1";
      // Orthografisch wie die frontale Referenz: Ausschnitt = Kranzdurchmesser 2 × 1,211 (Referenz-Crop 1820/1817 px)
      const half = (1.211 * 1820) / 1817;
      const camera = ortho
        ? new THREE.OrthographicCamera(-half, half, half, -half, 0.01, 100)
        : new THREE.PerspectiveCamera(30, 1, 0.01, 100);
      const { createMedallion } = await import("@/components/home/medallion/medallion");
      const medallion = createMedallion(renderer);
      const model = medallion.group;
      scene.add(medallion.lights);
      scene.add(model);
      const envi = params.get("envi");
      if (envi) {
        // Abstimmhilfe: Umgebungsstärke aller Materialien überschreiben
        model.traverse((o) => {
          const mesh = o as import("three").Mesh;
          if (mesh.isMesh)
            (mesh.material as import("three").MeshStandardMaterial).envMapIntensity = Number(envi);
        });
      }
      if (params.get("stripped") === "1") {
        // Map-stripped: nur Grundfarben, keine Texturen/Umgebung – prüft Form und Tonwerte ohne Materialtricks
        model.traverse((o) => {
          const mesh = o as import("three").Mesh;
          if (!mesh.isMesh) return;
          const old = mesh.material as import("three").MeshStandardMaterial;
          const base = old.userData.baseColor ?? old.color;
          mesh.material = new THREE.MeshStandardMaterial({ color: base, metalness: 0, roughness: 0.8 });
        });
        scene.add(new THREE.AmbientLight(0xffffff, 1.5));
      }
      const box = new THREE.Box3().setFromObject(model);
      const c = ortho ? new THREE.Vector3(0, 0, 0) : box.getCenter(new THREE.Vector3());
      const dim = Math.max(...box.getSize(new THREE.Vector3()).toArray()) * 1.08;
      const fov = "fov" in camera ? camera.fov : 30;
      const dist = ortho ? 10 : dim / 2 / Math.tan((fov * Math.PI) / 360);
      const a = (az * Math.PI) / 180;
      const e = (el * Math.PI) / 180;
      camera.position.set(
        c.x + dist * Math.sin(a) * Math.cos(e),
        c.y + dist * Math.sin(e),
        c.z + dist * Math.cos(a) * Math.cos(e),
      );
      camera.lookAt(c);
      renderer.render(scene, camera);
      Object.assign(window, { __scene: scene, __renderer: renderer, __camera: camera });
      if (!disposed) (window as unknown as { __medallionReady: boolean }).__medallionReady = true;
    })();
    return () => {
      disposed = true;
    };
  }, []);
  return <div ref={host} className="w-fit bg-ink" />;
}
