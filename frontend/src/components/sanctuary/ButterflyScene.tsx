import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ButterflyFallback } from './ButterflyFallback';

interface ButterflySceneProps {
  className?: string;
  /** Called when WebGL is unavailable so the page can adjust decorative copy. */
  onUnavailable?: () => void;
}

interface BurstParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function makeWingTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Deep violet base with a luminous cyan / magenta edge.
  const base = ctx.createLinearGradient(0, 512, 512, 0);
  base.addColorStop(0, 'rgba(255, 245, 255, 0.96)');
  base.addColorStop(0.18, 'rgba(255, 176, 245, 0.92)');
  base.addColorStop(0.46, 'rgba(167, 89, 255, 0.88)');
  base.addColorStop(0.72, 'rgba(104, 92, 238, 0.78)');
  base.addColorStop(0.9, 'rgba(66, 218, 255, 0.72)');
  base.addColorStop(1, 'rgba(42, 25, 92, 0.18)');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 512, 512);

  // Fine translucent veins radiating from the wing root.
  ctx.lineCap = 'round';
  for (let i = 0; i < 9; i += 1) {
    const spread = (i / 8) * 190;
    ctx.beginPath();
    ctx.moveTo(18, 488);
    ctx.bezierCurveTo(130, 400 - spread * 0.35, 280, 310 - spread * 0.5, 500, 86 + spread * 0.25);
    ctx.strokeStyle = `rgba(235, 246, 255, ${0.14 + i * 0.014})`;
    ctx.lineWidth = i % 3 === 0 ? 2.2 : 1;
    ctx.stroke();
  }

  // Delicate cross-veins.
  for (let i = 0; i < 16; i += 1) {
    const y = 120 + i * 22;
    ctx.beginPath();
    ctx.moveTo(80 + i * 8, y);
    ctx.quadraticCurveTo(240 + i * 4, y - 30, 430, y - 64);
    ctx.strokeStyle = 'rgba(248, 240, 255, 0.09)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  // Luminous stardust inside the wing.
  for (let i = 0; i < 190; i += 1) {
    const x = 20 + ((i * 73) % 470);
    const y = 20 + ((i * 137) % 470);
    const radius = 0.35 + ((i * 17) % 14) / 14;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = i % 4 === 0 ? 'rgba(255, 210, 250, 0.55)' : 'rgba(220, 245, 255, 0.36)';
    ctx.fill();
  }

  // Bright root glow.
  const root = ctx.createRadialGradient(12, 500, 0, 12, 500, 150);
  root.addColorStop(0, 'rgba(255, 255, 255, 0.96)');
  root.addColorStop(0.4, 'rgba(255, 205, 250, 0.55)');
  root.addColorStop(1, 'rgba(255, 205, 250, 0)');
  ctx.fillStyle = root;
  ctx.fillRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function makeGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const glow = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    glow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    glow.addColorStop(0.2, 'rgba(255, 186, 250, 0.55)');
    glow.addColorStop(0.52, 'rgba(148, 100, 255, 0.24)');
    glow.addColorStop(1, 'rgba(80, 40, 160, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 256, 256);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createWingGeometry(): THREE.ShapeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0.02, 0.04);
  // Leading edge sweeping up to a soft pointed apex.
  shape.bezierCurveTo(0.2, 0.58, 0.5, 1.02, 0.94, 1.1);
  shape.bezierCurveTo(1.2, 1.15, 1.36, 1.02, 1.38, 0.82);
  // Scalloped outer margin back toward the wing root.
  shape.bezierCurveTo(1.36, 0.62, 1.2, 0.52, 1.14, 0.4);
  shape.bezierCurveTo(1.06, 0.26, 0.7, 0.12, 0.32, 0.04);
  shape.bezierCurveTo(0.2, 0.01, 0.08, 0, 0.02, 0.04);
  const geometry = new THREE.ShapeGeometry(shape, 40);
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  if (box) {
    const position = geometry.attributes.position;
    const uv = new Float32Array(position.count * 2);
    for (let i = 0; i < position.count; i += 1) {
      uv[i * 2] = (position.getX(i) - box.min.x) / (box.max.x - box.min.x);
      uv[i * 2 + 1] = (position.getY(i) - box.min.y) / (box.max.y - box.min.y);
    }
    geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  }
  return geometry;
}

function createHindWingGeometry(): THREE.ShapeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0.02, -0.02);
  shape.bezierCurveTo(0.26, -0.36, 0.56, -0.78, 0.92, -0.82);
  shape.bezierCurveTo(1.14, -0.85, 1.16, -0.64, 1.0, -0.46);
  // A restrained swallowtail point.
  shape.bezierCurveTo(0.94, -0.38, 0.98, -0.3, 0.86, -0.24);
  shape.bezierCurveTo(0.64, -0.14, 0.28, 0.03, 0.02, -0.02);
  const geometry = new THREE.ShapeGeometry(shape, 40);
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  if (box) {
    const position = geometry.attributes.position;
    const uv = new Float32Array(position.count * 2);
    for (let i = 0; i < position.count; i += 1) {
      uv[i * 2] = (position.getX(i) - box.min.x) / (box.max.x - box.min.x);
      uv[i * 2 + 1] = (position.getY(i) - box.min.y) / (box.max.y - box.min.y);
    }
    geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  }
  return geometry;
}

/**
 * A genuine WebGL butterfly built from custom wing geometry, translucent
 * canvas-painted wing textures, a dimensional body, antennae, and particles.
 * If WebGL is unavailable the caller receives a visual fallback instead.
 */
export const ButterflyScene: React.FC<ButterflySceneProps> = ({ className = '', onUnavailable }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const pointerRef = useRef({ x: 0, y: 0 });
  const hoverRef = useRef(false);
  const burstRef = useRef(false);
  const unavailableRef = useRef(onUnavailable);
  unavailableRef.current = onUnavailable;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = prefersReducedMotion();
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
      if (!renderer.getContext()) throw new Error('WebGL context unavailable');
    } catch {
      setFailed(true);
      unavailableRef.current?.();
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.pointerEvents = 'none';
    mount.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 40);
    camera.position.set(0, 0, 6.1);

    scene.add(new THREE.AmbientLight(0xbda7ff, 1.5));
    const keyLight = new THREE.PointLight(0xffa8ee, 16, 14, 2);
    keyLight.position.set(1.4, 1.2, 2.6);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0x6fe8ff, 14, 14, 2);
    rimLight.position.set(-2.4, -0.7, 1.6);
    scene.add(rimLight);

    const butterfly = new THREE.Group();
    butterfly.position.y = 0.05;
    butterfly.scale.setScalar(0.84);
    scene.add(butterfly);

    const glowTexture = makeGlowTexture();
    const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture,
        transparent: true,
        opacity: 0.54,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    glow.scale.set(4.3, 4.3, 1);
    butterfly.add(glow);

    const wingTexture = makeWingTexture();
    const wingMaterial = new THREE.MeshBasicMaterial({
      map: wingTexture,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const wingGlowMaterial = new THREE.MeshBasicMaterial({
      map: wingTexture,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const foreGeometry = createWingGeometry();
    const hindGeometry = createHindWingGeometry();
    const leftWing = new THREE.Group();
    const rightWing = new THREE.Group();
    leftWing.scale.x = -1;
    butterfly.add(leftWing, rightWing);

    const addWing = (group: THREE.Group, geometry: THREE.ShapeGeometry, y: number, z: number) => {
      const mesh = new THREE.Mesh(geometry, wingMaterial);
      mesh.position.set(0, y, z);
      const glowMesh = new THREE.Mesh(geometry, wingGlowMaterial);
      glowMesh.position.set(0, y, z + 0.012);
      glowMesh.scale.setScalar(1.018);
      // EdgesGeometry keeps only the silhouette of this flat shape, which gives
      // the wing a delicate luminous outline instead of a soft blob.
      const outline = new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry, 1),
        new THREE.LineBasicMaterial({ color: 0xf0ddff, transparent: true, opacity: 0.22 })
      );
      outline.position.set(0, y, z + 0.02);
      group.add(mesh, glowMesh, outline);
    };

    addWing(leftWing, foreGeometry, 0.05, 0);
    addWing(leftWing, hindGeometry, -0.02, -0.02);
    addWing(rightWing, foreGeometry, 0.05, 0);
    addWing(rightWing, hindGeometry, -0.02, -0.02);

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x2b174c,
      emissive: 0x8f5cff,
      emissiveIntensity: 0.7,
      roughness: 0.35,
      metalness: 0.15
    });
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.072, 0.62, 6, 14), bodyMaterial);
    body.position.y = -0.02;
    butterfly.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.088, 16, 16), bodyMaterial);
    head.position.y = 0.37;
    butterfly.add(head);

    const antennaMaterial = new THREE.MeshBasicMaterial({ color: 0xf4ddff, transparent: true, opacity: 0.75 });
    const addAntenna = (direction: 1 | -1) => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.37, 0),
        new THREE.Vector3(0.09 * direction, 0.55, 0.02),
        new THREE.Vector3(0.2 * direction, 0.68, 0.06),
        new THREE.Vector3(0.27 * direction, 0.72, 0.1)
      ]);
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.006, 5, false), antennaMaterial);
      butterfly.add(tube);
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      tip.position.set(0.27 * direction, 0.72, 0.1);
      butterfly.add(tip);
    };
    addAntenna(1);
    addAntenna(-1);

    // Ambient stardust around the butterfly.
    const particleCount = 120;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i += 1) {
      const radius = 1.2 + Math.random() * 2.3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.cos(phi) * 0.72;
      particlePositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta) * 0.55;
      const palette = [
        [1.0, 0.78, 0.98],
        [0.7, 0.9, 1.0],
        [0.88, 0.76, 1.0],
        [1.0, 0.9, 0.8]
      ];
      const color = palette[i % palette.length];
      particleColors[i * 3] = color[0];
      particleColors[i * 3 + 1] = color[1];
      particleColors[i * 3 + 2] = color[2];
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.028,
      vertexColors: true,
      transparent: true,
      opacity: 0.68,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    butterfly.add(particles);

    // Click burst, deliberately restrained.
    const burstCount = 56;
    const burstPositions = new Float32Array(burstCount * 3);
    const burstGeometry = new THREE.BufferGeometry();
    burstGeometry.setAttribute('position', new THREE.BufferAttribute(burstPositions, 3));
    const burstMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: 0xffd7fb,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const burstPoints = new THREE.Points(burstGeometry, burstMaterial);
    butterfly.add(burstPoints);
    const burstParticles: BurstParticle[] = [];
    let burstLife = 0;

    const resetBurst = () => {
      burstParticles.length = 0;
      for (let i = 0; i < burstCount; i += 1) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const speed = 0.25 + Math.random() * 0.8;
        burstParticles.push({
          position: new THREE.Vector3(0, 0, 0.1),
          velocity: new THREE.Vector3(
            Math.sin(phi) * Math.cos(theta) * speed,
            Math.cos(phi) * speed,
            Math.sin(phi) * Math.sin(theta) * speed * 0.55
          )
        });
      }
      burstLife = 1;
      burstMaterial.opacity = 0.9;
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      pointerRef.current.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointerRef.current.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    const onPointerEnter = () => { hoverRef.current = true; };
    const onPointerLeave = () => { hoverRef.current = false; };
    const onPointerDown = () => { burstRef.current = true; };
    mount.addEventListener('pointermove', onPointerMove);
    mount.addEventListener('pointerenter', onPointerEnter);
    mount.addEventListener('pointerleave', onPointerLeave);
    mount.addEventListener('pointerdown', onPointerDown);

    const resize = () => {
      const width = mount.clientWidth || 1;
      const height = mount.clientHeight || 1;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    const clock = new THREE.Clock();
    let frame = 0;
    let disposed = false;

    const render = () => {
      if (disposed) return;
      frame = requestAnimationFrame(render);
      const elapsed = clock.getElapsedTime();

      if (burstRef.current) {
        resetBurst();
        burstRef.current = false;
      }

      if (!reduced) {
        butterfly.position.y = Math.sin(elapsed * 0.62) * 0.11;
        butterfly.rotation.z = Math.sin(elapsed * 0.4) * 0.025;
        butterfly.rotation.y += (pointerRef.current.x * 0.22 - butterfly.rotation.y) * 0.025;
        butterfly.rotation.x += (pointerRef.current.y * 0.12 - butterfly.rotation.x) * 0.025;

        const flap = Math.sin(elapsed * 2.25) * 0.22;
        leftWing.rotation.y = 0.18 + flap;
        rightWing.rotation.y = -0.18 - flap;
        particles.rotation.y = elapsed * 0.055;
        particles.rotation.z = Math.sin(elapsed * 0.2) * 0.08;

        const targetGlow = hoverRef.current ? 0.8 : 0.54;
        glow.material.opacity += (targetGlow - glow.material.opacity) * 0.06;
        const targetWing = hoverRef.current ? 0.98 : 0.88;
        wingMaterial.opacity += (targetWing - wingMaterial.opacity) * 0.06;
      } else {
        leftWing.rotation.y = 0.22;
        rightWing.rotation.y = -0.22;
      }

      if (burstLife > 0) {
        burstLife = Math.max(0, burstLife - 0.018);
        const positions = burstGeometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < burstParticles.length; i += 1) {
          const particle = burstParticles[i];
          particle.position.addScaledVector(particle.velocity, 0.016);
          particle.velocity.multiplyScalar(0.988);
          positions.setXYZ(i, particle.position.x, particle.position.y, particle.position.z);
        }
        positions.needsUpdate = true;
        burstMaterial.opacity = burstLife * 0.85;
      }

      renderer.render(scene, camera);
    };

    render();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      mount.removeEventListener('pointermove', onPointerMove);
      mount.removeEventListener('pointerenter', onPointerEnter);
      mount.removeEventListener('pointerleave', onPointerLeave);
      mount.removeEventListener('pointerdown', onPointerDown);
      scene.traverse(object => {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(material)) material.forEach(item => item.dispose());
        else material?.dispose();
      });
      wingTexture.dispose();
      glowTexture.dispose();
      renderer.dispose();
      if (canvas.parentNode === mount) mount.removeChild(canvas);
    };
  }, []);

  if (failed) return <ButterflyFallback className={className} />;

  return (
    <div
      ref={mountRef}
      className={`butterfly-scene ${className}`}
      role="img"
      aria-label="Interactive luminous 3D butterfly. Move your pointer to shift the light; click to release a small trail of particles."
    />
  );
};

export default ButterflyScene;
