import * as THREE from "three";
import { DRACOLoader, GLTF, GLTFLoader } from "three-stdlib";
import { decryptFile } from "./decrypt";

const setCharacter = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  isCancelled: () => boolean = () => false
) => {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("https://cdn.jsdelivr.net/gh/akashrmalhotra/3d-portfolio@main/public/draco/");
  loader.setDRACOLoader(dracoLoader);

  const loadCharacter = () => {
    return new Promise<GLTF | null>(async (resolve, reject) => {
      try {
        const encryptedBlob = await decryptFile(
          "https://cdn.jsdelivr.net/gh/akashrmalhotra/3d-portfolio@main/public/models/character.enc",
          "MyCharacter12"
        );
        if (isCancelled()) { dracoLoader.dispose(); resolve(null); return; }
        const blobUrl = URL.createObjectURL(new Blob([encryptedBlob]));

        let character: THREE.Object3D;
        loader.load(
          blobUrl,
          async (gltf) => {
            character = gltf.scene;
            try {
            if (isCancelled()) { resolve(gltf); return; }
            await renderer.compileAsync(character, camera, scene);
            character.traverse((child: any) => {
              if (child.isMesh) {
                // These baked light/shadow planes have opaque black pixels and
                // can cover the character and page at the close-up camera angle.
                // Lighting comes from the scene lights and CSS rim instead.
                if (child.name === "screenlight" || child.name === "ground" || (window.matchMedia("(max-width: 1024px)").matches && (child.name === "Plane004" || child.name === "Plane.004"))) {
                  child.visible = false;
                }
                const mesh = child as THREE.Mesh;

                // Change clothing colors to match site theme
                if (mesh.material) {
                  if (mesh.name === "BODY.SHIRT") { // The shirt mesh
                    const newMat = (mesh.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
                    newMat.color = new THREE.Color("#27201f");
                    mesh.material = newMat;
                  } else if (mesh.name === "Pant") {
                    const newMat = (mesh.material as THREE.Material).clone() as THREE.MeshStandardMaterial;
                    newMat.color = new THREE.Color("#000000");
                    mesh.material = newMat;
                  }
                }

                child.castShadow = true;
                child.receiveShadow = true;
                mesh.frustumCulled = true;
              }
            });
            resolve(gltf);
            for (const name of ["footR", "footL"]) {
              const foot = character.getObjectByName(name);
              if (foot) foot.position.y = 3.36;
            }

            // Monitor scale is handled by GsapScroll.ts animations

            } catch (error) { reject(error); }
            finally { URL.revokeObjectURL(blobUrl); dracoLoader.dispose(); }
          },
          undefined,
          (error) => {
            console.error("Error loading GLTF model:", error);
            URL.revokeObjectURL(blobUrl);
            dracoLoader.dispose();
            reject(error);
          }
        );
      } catch (err) {
        reject(err);
        console.error(err);
      }
    });
  };

  return { loadCharacter };
};

export default setCharacter;
