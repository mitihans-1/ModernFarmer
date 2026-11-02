import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ChevronDown, ChevronUp, RotateCw, ZoomIn, Eye, Sparkles, Layers } from 'lucide-react';
import { Language } from '../types';

interface ThreeAgriViewerProps {
  initialModel?: 'teff' | 'coffee' | 'tractor';
  language: Language;
  onClose?: () => void;
}

export const ThreeAgriViewer: React.FC<ThreeAgriViewerProps> = ({
  initialModel = 'teff',
  language,
  onClose,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeModel, setActiveModel] = useState<'teff' | 'coffee' | 'tractor'>(initialModel);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [explodeFactor, setExplodeFactor] = useState(0);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);

  // References across render loop
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number>(0);
  const explodePartsRef = useRef<{ mesh: THREE.Object3D; originalY: number; explodeDir: THREE.Vector3; name: string }[]>([]);

  // Labels by language
  const labels = {
    teff: {
      am: 'የማኛ ጤፍ እሸት (የአዳማ/ቢሾፍቱ)',
      om: 'Xaafii Maganaa (Ada’aa)',
      ti: 'ናይ ማኛ ጣፍ እሸት',
      en: 'Magna White Teff Grain Sheaf',
    },
    coffee: {
      am: 'የሲዳማ ኦርጋኒክ ቡና ቅርንጫፍ',
      om: 'Buna Qulqulluu Sidaamaa',
      ti: 'ናይ ሲዳማ ኦርጋኒክ ቡን ጨንፈር',
      en: 'Sidama Washed Specialty Coffee Branch',
    },
    tractor: {
      am: 'የአርሶ አደር ትራክተር እና የዲስክ ማረሻ',
      om: 'Tiraaktarii fi Maarashaa Qonnaa',
      ti: 'ትራክተርን ናይ ዲስክ መሕረሲን',
      en: 'AgriTractor & 3-Disc Rotary Plough',
    },
  };

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // Detect Software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 1. Scene & Canvas
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x131713);
    scene.fog = new THREE.FogExp2(0x131713, 0.04);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(3.5, 2.5, 4.5);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // 4. Studio Environment Lighting
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3-Point Lighting Rig
    const keyLight = new THREE.DirectionalLight(0xfff3db, 2.2);
    keyLight.position.set(4, 7, 3);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.HemisphereLight(0x768875, 0x221c16, 1.2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xd9b779, 1.4);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    // Ground Contact Shadow Disc
    const groundGeo = new THREE.PlaneGeometry(8, 8);
    const groundCanvas = document.createElement('canvas');
    groundCanvas.width = 256;
    groundCanvas.height = 256;
    const ctx = groundCanvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 120);
    grad.addColorStop(0, 'rgba(0,0,0,0.7)');
    grad.addColorStop(0.5, 'rgba(0,0,0,0.3)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
    const groundTex = new THREE.CanvasTexture(groundCanvas);
    groundTex.colorSpace = THREE.SRGBColorSpace;

    const groundMat = new THREE.MeshBasicMaterial({
      map: groundTex,
      transparent: true,
      depthWrite: false,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    scene.add(ground);

    // 5. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Prevent going under floor
    controls.minDistance = 1.5;
    controls.maxDistance = 12;
    controls.target.set(0, 1, 0);
    controlsRef.current = controls;

    // 6. Build Procedural Composite Models
    const modelRoot = new THREE.Group();
    scene.add(modelRoot);
    modelGroupRef.current = modelRoot;

    buildModel(activeModel, modelRoot);

    // 7. Animation Loop with Exponential Damping
    let lastTime = performance.now();
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (controlsRef.current) {
        controlsRef.current.autoRotate = autoRotate;
        controlsRef.current.autoRotateSpeed = 1.2;
        controlsRef.current.update();
      }

      // Smooth idle floating/sway for agricultural life
      if (modelGroupRef.current && activeModel !== 'tractor') {
        const sway = Math.sin(now * 0.0015) * 0.02;
        modelGroupRef.current.rotation.y += sway * 0.05;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [activeModel]);

  // Update exploded parts when slider changes
  useEffect(() => {
    explodePartsRef.current.forEach((item) => {
      const targetY = item.originalY + item.explodeDir.y * explodeFactor * 0.8;
      const targetX = item.explodeDir.x * explodeFactor * 0.8;
      const targetZ = item.explodeDir.z * explodeFactor * 0.8;
      item.mesh.position.y = targetY;
      item.mesh.position.x = targetX;
      item.mesh.position.z = targetZ;
    });
  }, [explodeFactor]);

  // Procedural 3D Model Factory (Strictly 3–12 Part Procedural Composites)
  function buildModel(type: 'teff' | 'coffee' | 'tractor', group: THREE.Group) {
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }
    explodePartsRef.current = [];

    if (type === 'teff') {
      // TEFF GRAIN PANICLE (8-part composite)
      // 1. Soil Pot/Ground Mound
      const soilGeo = new THREE.CylinderGeometry(0.7, 0.9, 0.25, 24);
      const soilMat = new THREE.MeshStandardMaterial({
        color: 0x3d2817,
        roughness: 0.9,
        metalness: 0.05,
      });
      const soil = new THREE.Mesh(soilGeo, soilMat);
      soil.position.y = 0.125;
      soil.castShadow = true;
      soil.receiveShadow = true;
      group.add(soil);
      explodePartsRef.current.push({
        mesh: soil,
        originalY: 0.125,
        explodeDir: new THREE.Vector3(0, -0.4, 0),
        name: 'Soil Foundation',
      });

      // 2. Base Clump Stalks
      const baseStalkGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.8, 12);
      const stalkMat = new THREE.MeshStandardMaterial({
        color: 0xb5a065,
        roughness: 0.45,
        metalness: 0.1,
      });
      const baseStalk = new THREE.Mesh(baseStalkGeo, stalkMat);
      baseStalk.position.y = 0.65;
      group.add(baseStalk);

      // 3. Main Culm Stem (Teff Stalk)
      const stemGeo = new THREE.CylinderGeometry(0.035, 0.07, 1.4, 12);
      const stem = new THREE.Mesh(stemGeo, stalkMat);
      stem.position.y = 1.7;
      group.add(stem);
      explodePartsRef.current.push({
        mesh: stem,
        originalY: 1.7,
        explodeDir: new THREE.Vector3(0, 0.2, 0),
        name: 'Main Culm (Stem)',
      });

      // 4. Teff Nodes / Ring Rings
      for (let i = 0; i < 3; i++) {
        const nodeGeo = new THREE.TorusGeometry(0.06 - i * 0.01, 0.015, 8, 16);
        const nodeMat = new THREE.MeshStandardMaterial({
          color: 0x8c7940,
          roughness: 0.6,
        });
        const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
        nodeMesh.rotation.x = Math.PI / 2;
        nodeMesh.position.y = 1.1 + i * 0.45;
        group.add(nodeMesh);
      }

      // 5. Sheaf Leaf Blades (Arched procedural blades)
      const leafMat = new THREE.MeshStandardMaterial({
        color: 0xc4b374,
        roughness: 0.5,
        side: THREE.DoubleSide,
      });
      for (let i = 0; i < 4; i++) {
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(Math.cos(i * 1.5) * 0.4, 0.3, Math.sin(i * 1.5) * 0.4),
          new THREE.Vector3(Math.cos(i * 1.5) * 0.7, -0.2, Math.sin(i * 1.5) * 0.7)
        );
        const leafGeo = new THREE.TubeGeometry(curve, 16, 0.02, 6, false);
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        leaf.position.y = 1.2 + i * 0.15;
        group.add(leaf);
      }

      // 6. Feathery Panicle Branchlets & Spikelets (Magna Grain Seeds)
      const panicleGroup = new THREE.Group();
      panicleGroup.position.y = 2.4;
      const grainMat = new THREE.MeshStandardMaterial({
        color: 0xf5deb3, // Warm wheat/cream for white teff
        roughness: 0.35,
        metalness: 0.15,
      });

      // 36 procedural grain clusters branching out
      for (let j = 0; j < 28; j++) {
        const angle = (j / 28) * Math.PI * 6;
        const heightNorm = j / 28;
        const radius = Math.sin(heightNorm * Math.PI) * 0.35;
        const grainMesh = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.12, 6), grainMat);
        grainMesh.position.set(
          Math.cos(angle) * radius,
          heightNorm * 0.9,
          Math.sin(angle) * radius
        );
        grainMesh.rotation.x = 0.3 * Math.sin(angle);
        grainMesh.rotation.z = -0.3 * Math.cos(angle);
        panicleGroup.add(grainMesh);
      }
      group.add(panicleGroup);
      explodePartsRef.current.push({
        mesh: panicleGroup,
        originalY: 2.4,
        explodeDir: new THREE.Vector3(0, 0.6, 0),
        name: 'Magna Grain Panicle (Spikelets)',
      });

    } else if (type === 'coffee') {
      // SIDAMA SPECIALTY COFFEE BRANCH (10-part composite)
      // 1. Wood Stem Branch
      const branchCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.1, 0),
        new THREE.Vector3(0.1, 0.9, 0.05),
        new THREE.Vector3(-0.08, 1.7, -0.05),
        new THREE.Vector3(0.02, 2.3, 0.02),
      ]);
      const branchGeo = new THREE.TubeGeometry(branchCurve, 24, 0.05, 8, false);
      const branchMat = new THREE.MeshStandardMaterial({
        color: 0x4a3525,
        roughness: 0.85,
        metalness: 0.05,
      });
      const branch = new THREE.Mesh(branchGeo, branchMat);
      branch.castShadow = true;
      group.add(branch);
      explodePartsRef.current.push({
        mesh: branch,
        originalY: 0,
        explodeDir: new THREE.Vector3(0, -0.2, 0),
        name: 'Lignified Wood Branch',
      });

      // 2. Glossy Emerald Arabica Leaves
      const leafMat = new THREE.MeshStandardMaterial({
        color: 0x1d5e2e,
        roughness: 0.25,
        metalness: 0.1,
        side: THREE.DoubleSide,
      });

      const leafPositions = [
        { pos: new THREE.Vector3(0.05, 1.1, 0), rot: [0.2, 0.8, -0.3] },
        { pos: new THREE.Vector3(-0.06, 1.25, 0.05), rot: [-0.1, -0.9, 0.4] },
        { pos: new THREE.Vector3(0.03, 1.6, -0.04), rot: [0.3, 1.8, -0.2] },
        { pos: new THREE.Vector3(-0.04, 1.85, 0.02), rot: [-0.2, -1.9, 0.3] },
      ];

      leafPositions.forEach((lp, idx) => {
        const leafGroup = new THREE.Group();
        leafGroup.position.copy(lp.pos);
        leafGroup.rotation.set(lp.rot[0], lp.rot[1], lp.rot[2]);

        // Leaf blade shape
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.quadraticCurveTo(0.15, 0.3, 0, 0.7);
        shape.quadraticCurveTo(-0.15, 0.3, 0, 0);
        const lMesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), leafMat);
        lMesh.rotation.x = -Math.PI / 4;
        leafGroup.add(lMesh);
        group.add(leafGroup);

        explodePartsRef.current.push({
          mesh: leafGroup,
          originalY: lp.pos.y,
          explodeDir: new THREE.Vector3(lp.pos.x * 2, 0.2, lp.pos.z * 2),
          name: `Glossy Arabica Leaf #${idx + 1}`,
        });
      });

      // 3. Ripe Crimson Cherries (Clusters)
      const cherryMat = new THREE.MeshStandardMaterial({
        color: 0x9e121b, // Ripe deep crimson red
        roughness: 0.18,
        metalness: 0.1,
      });
      const calyxMat = new THREE.MeshStandardMaterial({
        color: 0x22110c,
        roughness: 0.7,
      });

      const clusterGroup = new THREE.Group();
      clusterGroup.position.set(0, 1.45, 0);

      // Node ring of 12 ripe cherries
      for (let c = 0; c < 12; c++) {
        const a = (c / 12) * Math.PI * 2;
        const cherrySphere = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 16), cherryMat);
        cherrySphere.position.set(Math.cos(a) * 0.14, (c % 3) * 0.05 - 0.05, Math.sin(a) * 0.14);
        cherrySphere.castShadow = true;

        // Calyx disc on tip
        const calyx = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.02, 8), calyxMat);
        calyx.position.set(Math.cos(a) * 0.07, 0, Math.sin(a) * 0.07);
        cherrySphere.add(calyx);

        clusterGroup.add(cherrySphere);
      }
      group.add(clusterGroup);
      explodePartsRef.current.push({
        mesh: clusterGroup,
        originalY: 1.45,
        explodeDir: new THREE.Vector3(0, 0.5, 0),
        name: 'Ripe Red Cherries (1st Grade Cluster)',
      });

    } else if (type === 'tractor') {
      // AGRICULTURAL TRACTOR & DISC PLOUGH (12-part composite)
      // 1. Chassis Engine Hood
      const hoodMat = new THREE.MeshStandardMaterial({
        color: 0x1b5e20, // Agricultural Green
        roughness: 0.25,
        metalness: 0.6,
      });
      const hoodGeo = new THREE.BoxGeometry(0.8, 0.6, 1.4);
      const hood = new THREE.Mesh(hoodGeo, hoodMat);
      hood.position.set(0, 0.85, 0.4);
      hood.castShadow = true;
      group.add(hood);
      explodePartsRef.current.push({
        mesh: hood,
        originalY: 0.85,
        explodeDir: new THREE.Vector3(0, 0.4, 0.3),
        name: 'Diesel Engine Hood & Front Grille',
      });

      // 2. Cab Frame & Canopy Roof
      const cabMat = new THREE.MeshStandardMaterial({
        color: 0xd4a373, // Ochre Cab Roof
        roughness: 0.3,
        metalness: 0.2,
      });
      const cabRoof = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 0.9), cabMat);
      cabRoof.position.set(0, 1.7, -0.5);
      group.add(cabRoof);

      // Cab Pillars
      const pillarMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.2 });
      for (let px of [-0.4, 0.4]) {
        for (let pz of [-0.9, -0.1]) {
          const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.8), pillarMat);
          pillar.position.set(px, 1.3, pz);
          group.add(pillar);
        }
      }
      explodePartsRef.current.push({
        mesh: cabRoof,
        originalY: 1.7,
        explodeDir: new THREE.Vector3(0, 0.6, 0),
        name: 'Protective Safety ROPS Canopy',
      });

      // 3. Exhaust Vertical Stack
      const exhaust = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.9),
        pillarMat
      );
      exhaust.position.set(0.35, 1.4, 0.8);
      group.add(exhaust);

      // 4. Large Rear Tractor Wheels (Deep Lug Treads)
      const tireMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.8,
        metalness: 0.05,
      });
      const rimMat = new THREE.MeshStandardMaterial({
        color: 0xbc6c25,
        roughness: 0.3,
        metalness: 0.5,
      });

      for (let side of [-1, 1]) {
        const wheelGroup = new THREE.Group();
        wheelGroup.position.set(side * 0.58, 0.65, -0.6);

        const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.35, 24), tireMat);
        tire.rotation.z = Math.PI / 2;
        tire.castShadow = true;
        wheelGroup.add(tire);

        const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.37, 16), rimMat);
        rim.rotation.z = Math.PI / 2;
        wheelGroup.add(rim);

        group.add(wheelGroup);
        explodePartsRef.current.push({
          mesh: wheelGroup,
          originalY: 0.65,
          explodeDir: new THREE.Vector3(side * 0.8, 0, 0),
          name: `Rear Traction Lug Wheel (${side > 0 ? 'Right' : 'Left'})`,
        });
      }

      // 5. Front Steer Wheels
      for (let side of [-1, 1]) {
        const fWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.22, 20), tireMat);
        fWheel.rotation.z = Math.PI / 2;
        fWheel.position.set(side * 0.52, 0.4, 0.8);
        fWheel.castShadow = true;
        group.add(fWheel);
        explodePartsRef.current.push({
          mesh: fWheel,
          originalY: 0.4,
          explodeDir: new THREE.Vector3(side * 0.7, 0, 0.2),
          name: `Front Steer Wheel (${side > 0 ? 'Right' : 'Left'})`,
        });
      }

      // 6. Attached 3-Point Hitch & 3-Disc Rotary Plough
      const ploughGroup = new THREE.Group();
      ploughGroup.position.set(0, 0.45, -1.3);

      const hitchBeam = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 0.5), pillarMat);
      ploughGroup.add(hitchBeam);

      const discMat = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        roughness: 0.2,
        metalness: 0.9,
      });

      for (let d = -1; d <= 1; d++) {
        const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 16), discMat);
        disc.rotation.x = Math.PI / 3;
        disc.rotation.y = d * 0.25;
        disc.position.set(d * 0.26, 0.05, -d * 0.18);
        disc.castShadow = true;
        ploughGroup.add(disc);
      }
      group.add(ploughGroup);
      explodePartsRef.current.push({
        mesh: ploughGroup,
        originalY: 0.45,
        explodeDir: new THREE.Vector3(0, -0.2, -0.8),
        name: 'Heavy 3-Disc Rotary Plough Assembly',
      });
    }
  }

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
      controlsRef.current.target.set(0, 1, 0);
    }
  };

  return (
    <div className="relative w-full h-[520px] rounded-[24px] overflow-hidden bg-slate-900 border border-slate-800 shadow-[0_10px_40px_rgba(15,23,42,0.12)] flex flex-col">
      {/* Top Header Badge */}
      <div className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="bg-[#0F172A]/90 border border-slate-700/80 rounded-xl px-3.5 py-1.5 shadow-md pointer-events-auto flex items-center gap-2 backdrop-blur-xs">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold text-white">
            {labels[activeModel][language] || labels[activeModel].en}
          </span>
          <span className="text-[11px] text-slate-400">· 3D Inspection</span>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="bg-[#0F172A]/90 hover:bg-slate-800 text-slate-300 hover:text-white px-3.5 py-1.5 rounded-xl border border-slate-700/80 text-xs font-medium pointer-events-auto transition-colors"
          >
            Close 3D
          </button>
        )}
      </div>

      {/* 3D WebGL Canvas Viewport */}
      <div ref={mountRef} className="w-full flex-1 cursor-grab active:cursor-grabbing" />

      {/* Selected Part Callout Badge */}
      {selectedPart && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-blue-950/90 border border-blue-500/50 text-blue-200 px-3.5 py-1 rounded-full text-xs font-medium shadow-lg backdrop-blur-sm pointer-events-none">
          Inspecting: {selectedPart}
        </div>
      )}

      {/* Collapsible Unified Bottom Control Dock */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-30 w-[94%] max-w-xl transition-all duration-300 ${
          isCollapsed ? 'translate-y-[calc(100%-36px)]' : 'translate-y-0'
        }`}
      >
        {/* Collapse / Expand Toggle Button */}
        <div className="flex justify-center mb-1">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-1.5 bg-[#0F172A]/95 hover:bg-slate-800 text-slate-300 text-[11px] font-medium px-3.5 py-1 rounded-full border border-slate-700 shadow-md transition-colors cursor-pointer"
          >
            {isCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" /> Show Controls
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" /> Minimize Dock
              </>
            )}
          </button>
        </div>

        {/* Dock Panel */}
        <div className="bg-[#0F172A]/95 border border-slate-800 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md">
          {/* Top Row: Model Selection */}
          <div className="grid grid-cols-3 gap-1.5 mb-2.5">
            <button
              onClick={() => {
                setActiveModel('teff');
                setSelectedPart(null);
                setExplodeFactor(0);
              }}
              className={`py-1.5 px-2 rounded-xl text-xs font-medium transition-all text-center truncate cursor-pointer ${
                activeModel === 'teff'
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              🌾 Magna Teff
            </button>
            <button
              onClick={() => {
                setActiveModel('coffee');
                setSelectedPart(null);
                setExplodeFactor(0);
              }}
              className={`py-1.5 px-2 rounded-xl text-xs font-medium transition-all text-center truncate cursor-pointer ${
                activeModel === 'coffee'
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              ☕ Sidama Coffee
            </button>
            <button
              onClick={() => {
                setActiveModel('tractor');
                setSelectedPart(null);
                setExplodeFactor(0);
              }}
              className={`py-1.5 px-2 rounded-xl text-xs font-medium transition-all text-center truncate cursor-pointer ${
                activeModel === 'tractor'
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              🚜 Agri Tractor
            </button>
          </div>

          {/* Bottom Row: Controls */}
          <div className="flex items-center justify-between gap-3 text-xs text-slate-300 pt-1 border-t border-slate-800/80">
            {/* Explode / Deconstruct Slider */}
            <div className="flex items-center gap-2 flex-1">
              <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-[11px] text-slate-400 shrink-0">Deconstruct</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={explodeFactor}
                onChange={(e) => setExplodeFactor(parseFloat(e.target.value))}
                className="w-full accent-[#2563EB] h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`p-1.5 rounded-lg border text-[11px] flex items-center gap-1 transition-colors cursor-pointer ${
                  autoRotate
                    ? 'border-[#2563EB] bg-blue-950/60 text-blue-300'
                    : 'border-slate-700 bg-slate-800 text-slate-400'
                }`}
                title="Toggle Auto-Rotation"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Spin</span>
              </button>

              <button
                onClick={resetCamera}
                className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                title="Reset Camera Target"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
