'use client';

import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { useAspect, useTexture } from '@react-three/drei';
import { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

// Texture maps per l'effetto glitch
const TEXTUREMAP = { src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop' };
const DEPTHMAP = { src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&grayscale' };

extend({ MeshBasicNodeMaterial: THREE.MeshBasicMaterial } as any);

// Declare Three.js elements for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        ref?: React.Ref<THREE.Mesh>;
        scale?: [number, number, number];
        material?: THREE.Material;
        position?: [number, number, number];
        rotation?: [number, number, number];
      };
      planeGeometry: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        args?: [number, number];
      };
    }
  }
}

// Post Processing component semplificato
const PostProcessing = ({
  strength = 1,
  threshold = 1,
}: {
  strength?: number;
  threshold?: number;
}) => {
  const { gl, scene, camera } = useThree();
  
  useFrame(() => {
    // Effetto glow semplice
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = strength;
  });

  return null;
};

const WIDTH = 300;
const HEIGHT = 300;

const Scene = () => {
  const [rawMap, depthMap] = useTexture([TEXTUREMAP.src, DEPTHMAP.src]);
  const meshRef = useRef<THREE.Mesh>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (rawMap && depthMap) {
      setVisible(true);
    }
  }, [rawMap, depthMap]);

  const { material, uniforms } = useMemo(() => {
    const uPointer = useRef(new THREE.Vector2(0, 0));
    const uProgress = useRef(0);

    const strength = 0.01;

    // Shader material per l'effetto glitch
    const material = new THREE.ShaderMaterial({
      uniforms: {
        tMap: { value: rawMap },
        tDepthMap: { value: depthMap },
        uPointer: { value: uPointer.current },
        uProgress: { value: uProgress.current },
        uTime: { value: 0 },
        uOpacity: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tMap;
        uniform sampler2D tDepthMap;
        uniform vec2 uPointer;
        uniform float uProgress;
        uniform float uTime;
        uniform float uOpacity;
        varying vec2 vUv;

        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        float noise(vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);
          
          float a = random(i);
          float b = random(i + vec2(1.0, 0.0));
          float c = random(i + vec2(0.0, 1.0));
          float d = random(i + vec2(1.0, 1.0));
          
          vec2 u = f * f * (3.0 - 2.0 * f);
          
          return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        void main() {
          vec2 uv = vUv;
          
          // Aspect ratio correction
          float aspect = ${WIDTH}.0 / ${HEIGHT}.0;
          uv.x *= aspect;
          
          // Glitch effect
          float depth = texture2D(tDepthMap, vUv).r;
          float flow = 1.0 - smoothstep(0.0, 0.02, abs(depth - uProgress));
          
          // Pointer interaction
          vec2 pointerEffect = uPointer * strength * depth;
          uv += pointerEffect;
          
          // Tiling pattern
          vec2 tiledUv = mod(uv * 120.0, 2.0) - 1.0;
          float dist = length(tiledUv);
          float dotPattern = smoothstep(0.5, 0.49, dist) * noise(uv * 60.0);
          
          // Red glitch mask
          vec3 mask = vec3(dotPattern * flow * 10.0, 0.0, 0.0);
          
          // Final color with screen blend
          vec4 texColor = texture2D(tMap, vUv);
          vec3 finalColor = mix(texColor.rgb, texColor.rgb + mask, flow);
          
          gl_FragColor = vec4(finalColor, uOpacity);
        }
      `,
      transparent: true,
    });

    return {
      material,
      uniforms: {
        uPointer: material.uniforms.uPointer,
        uProgress: material.uniforms.uProgress,
        uOpacity: material.uniforms.uOpacity,
        uTime: material.uniforms.uTime,
      },
    };
  }, [rawMap, depthMap]);

  const [w, h] = useAspect(WIDTH, HEIGHT);

  useFrame(({ clock, pointer }) => {
    uniforms.uPointer.value = pointer;
    uniforms.uProgress.value = (Math.sin(clock.getElapsedTime() * 0.5) * 0.5 + 0.5);
    uniforms.uTime.value = clock.getElapsedTime();
    
    // Fade in effect
    if (meshRef.current && material) {
      const currentOpacity = (material as THREE.ShaderMaterial).uniforms.uOpacity.value;
      const targetOpacity = visible ? 1 : 0;
      (material as THREE.ShaderMaterial).uniforms.uOpacity.value = THREE.MathUtils.lerp(
        currentOpacity,
        targetOpacity,
        0.07
      );
    }
  });

  const scaleFactor = 0.40;
  return (
    <mesh ref={meshRef} scale={[w * scaleFactor, h * scaleFactor, 1]} material={material}>
      <planeGeometry />
    </mesh>
  );
};

export const HeroFuturistic = () => {
  const titleWords = 'TACTICAL STRENGTH'.split(' ');
  const subtitle = 'La tua scheda di allenamento digitale di nuova generazione.';
  const [visibleWords, setVisibleWords] = useState(0);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [delays, setDelays] = useState<number[]>([]);
  const [subtitleDelay, setSubtitleDelay] = useState(0);

  useEffect(() => {
    setDelays(titleWords.map(() => Math.random() * 0.07));
    setSubtitleDelay(Math.random() * 0.1);
  }, [titleWords.length]);

  useEffect(() => {
    if (visibleWords < titleWords.length) {
      const timeout = setTimeout(() => setVisibleWords(visibleWords + 1), 600);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => setSubtitleVisible(true), 800);
      return () => clearTimeout(timeout);
    }
  }, [visibleWords, titleWords.length]);

  return (
    <div className="h-screen relative overflow-hidden bg-black">
      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInSubtitle {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes exploreBtn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        
        .fade-in-subtitle {
          animation: fadeInSubtitle 0.8s ease-out forwards;
        }
        
        .explore-btn {
          animation: exploreBtn 0.8s ease-out forwards;
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 12px 24px;
          border-radius: 50px;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 100;
        }
        
        .explore-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateX(-50%) translateY(-2px);
        }
        
        .explore-arrow {
          transition: transform 0.3s ease;
        }
        
        .explore-btn:hover .explore-arrow {
          transform: translateY(2px);
        }
      `}</style>

      {/* Text Content */}
      <div className="absolute inset-0 z-20 pointer-events-none px-6 md:px-10 flex items-center justify-center">
        <div className="text-center max-w-4xl">
          <div className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-4">
            <div className="flex flex-col md:flex-row justify-center items-center gap-2 md:gap-6 text-white">
              {titleWords.map((word, index) => (
                <div
                  key={index}
                  className={index < visibleWords ? 'fade-in' : ''}
                  style={{ 
                    animationDelay: `${index * 0.13 + (delays[index] || 0)}s`, 
                    opacity: index < visibleWords ? 1 : 0 
                  }}
                >
                  {word}
                </div>
              ))}
            </div>
          </div>
          <div className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-medium text-gray-300 max-w-2xl mx-auto">
            <div
              className={subtitleVisible ? 'fade-in-subtitle' : ''}
              style={{ 
                animationDelay: `${titleWords.length * 0.13 + 0.2 + subtitleDelay}s`, 
                opacity: subtitleVisible ? 1 : 0 
              }}
            >
              {subtitle}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Button */}
      <button
        className="explore-btn"
        style={{ animationDelay: '2.2s' }}
        onClick={() => {
          document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        Inizia l'allenamento
        <span className="explore-arrow">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" className="arrow-svg">
            <path d="M11 5V17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path d="M6 12L11 17L16 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </span>
      </button>

      {/* Three.js Canvas */}
      <Canvas
        flat
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
      >
        <PostProcessing fullScreenEffect={true} />
        <Scene />
      </Canvas>
    </div>
  );
};

export default HeroFuturistic;
