import * as THREE from "three";
import { RGBELoader } from "three-stdlib";
import { gsap } from "gsap";

const setLighting = (scene: THREE.Scene) => {
  let disposed = false;
  const tweens: gsap.core.Tween[] = [];
  const directionalLight = new THREE.DirectionalLight(0xf6a66b, 0);
  directionalLight.intensity = 0;
  directionalLight.position.set(-0.47, -0.32, -1);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  scene.add(directionalLight);

  const pointLight = new THREE.PointLight(0xf18e65, 0, 100, 3);
  pointLight.position.set(3, 12, 4);
  pointLight.castShadow = true;
  scene.add(pointLight);

  scene.environmentIntensity = 0;
  new RGBELoader()
    .setPath("https://cdn.jsdelivr.net/gh/akashrmalhotra/3d-portfolio@main/public/models/")
    .load("char_enviorment.hdr", function (texture) {
      if (disposed) { texture.dispose(); return; }
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = texture;
      scene.environmentRotation.set(5.76, 85.85, 1);
    });

  function setPointLight(screenLight: any) {
    if (screenLight?.material?.opacity > 0.9) {
      pointLight.intensity = screenLight.material.emissiveIntensity * 20;
    } else {
      pointLight.intensity = 0;
    }
  }
  const duration = 2;
  const ease = "power2.inOut";
  function turnOnLights() {
    tweens.push(gsap.to(scene, {
      environmentIntensity: 0.64,
      duration: duration,
      ease: ease,
    }));
    tweens.push(gsap.to(directionalLight, {
      intensity: 1,
      duration: duration,
      ease: ease,
    }));
    tweens.push(gsap.to(".character-rim", {
      y: "55%",
      opacity: 1,
      delay: 0.2,
      duration: 2,
    }));
  }

  return { setPointLight, turnOnLights, dispose: () => {disposed=true;tweens.forEach(tween=>tween.kill());scene.environment?.dispose();scene.environment=null;directionalLight.dispose();pointLight.dispose();} };
};

export default setLighting;
