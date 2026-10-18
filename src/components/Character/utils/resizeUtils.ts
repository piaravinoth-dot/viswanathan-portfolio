import * as THREE from "three";
import {ScrollTrigger} from "gsap/ScrollTrigger";

export default function handleResize(renderer: THREE.WebGLRenderer,camera: THREE.PerspectiveCamera,canvasDiv: React.RefObject<HTMLDivElement>) {
  const box = canvasDiv.current?.getBoundingClientRect();
  if (!box?.width || !box.height) return;
  renderer.setSize(box.width,box.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
  camera.aspect = box.width/box.height;
  camera.updateProjectionMatrix();
  // Refresh positions only. A renderer resize must not kill the page's ScrollSmoother.
  ScrollTrigger.refresh();
}
