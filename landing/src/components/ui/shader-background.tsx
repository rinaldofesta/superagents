"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

interface ShaderPlaneProps {
  vertexShader: string;
  fragmentShader: string;
  uniforms: { [key: string]: { value: unknown } };
}

const ShaderPlane = ({
  vertexShader,
  fragmentShader,
  uniforms,
}: ShaderPlaneProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size, invalidate } = useThree();

  // Use setInterval at 30fps instead of rAF (lower CPU usage)
  useEffect(() => {
    const startTime = performance.now() / 1000;

    const interval = setInterval(() => {
      const now = performance.now() / 1000;
      const elapsed = now - startTime;

      if (meshRef.current) {
        const material = meshRef.current.material as THREE.ShaderMaterial;
        material.uniforms.u_time.value = elapsed;
        material.uniforms.u_resolution.value.set(size.width, size.height, 1.0);
      }

      invalidate(); // Request a single render
    }, 33); // ~30fps - better performance while still smooth

    return () => clearInterval(interval);
  }, [size, invalidate]);

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.FrontSide}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
};

interface ShaderBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

const ShaderBackground = ({ className, children }: ShaderBackgroundProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `;

  // Orange-tinted shader matching PlayNew #ff4d00
  const fragmentShader = `
    precision highp float;
    varying vec2 vUv;
    uniform float u_time;
    uniform vec3 u_resolution;

    float lightImpulses(vec2 v, float time) {
        float streak = 0.0;

        for (int j = 0; j < 4; j++) {
            float seed = float(j) * 1.37;
            float phase = dot(v, normalize(vec2(sin(seed*12.3), cos(seed*4.7))));
            float speed = 0.4 + fract(sin(seed*77.7)*43758.5);

            float pulse = exp(-30.0 * pow(fract(phase*0.2 + time*speed) - 0.5, 2.0));

            streak += pulse;
        }

        return streak;
    }

    vec4 getScene(vec2 fragCoord, vec2 resolution) {
        float i = .13, a;
        vec2 r = resolution;

        vec2 p = (fragCoord+fragCoord - r) / r.y / .9;
        vec2 d = vec2(-1,1);
        vec2 b = p - i*d;
        vec2 c = p * mat2(1, 1, d/(.1 + i/dot(b,b)));
        vec2 v = c * mat2(cos(.5*log(a=dot(c,c))))/i;
        vec2 w = vec2(0.0);

        for(; i++<9.; w += 1.1+sin(v))
            v += 0.9* sin(v.yx/i+u_time) / i + .3;

        i = length(5.0);

        // Orange color base: #ff4d00 = rgb(1.0, 0.3, 0.0)
        vec3 orangeColor = vec3(1.0, 0.3, 0.0);

        float intensity = 0.9 - exp( -exp( c.x )
                       /  length(w)
                       / ( 2. + i*i/4. - i )
                       / ( .5 + 1. / a )
                       / ( .03 + abs( length(p)-.7 ) )
                 );

        vec3 base = orangeColor * intensity * 0.15;

        float streak = lightImpulses(v, u_time);
        base += orangeColor * streak * 0.02;

        // Dark background: #0a0a0a
        vec3 bgColor = vec3(0.04, 0.04, 0.04);

        return vec4(bgColor + base, 1.0);
    }

    void mainImage(out vec4 fragColor, in vec2 fragCoord)
    {
        vec2 r = u_resolution.xy;
        vec2 uv = fragCoord / r;

        float ChromaticAberration = 8.0;
        vec2 texel = 1.0 / r;
        vec2 coords = (uv - 0.5) * 2.0;
        float coordDot = dot(coords, coords);
        vec2 precompute = ChromaticAberration * coordDot * coords;

        vec2 uvR = uv - texel * precompute;
        vec2 uvB = uv + texel * precompute;

        vec2 fragCoordR = uvR * r;
        vec2 fragCoordB = uvB * r;

        vec4 colR = getScene(fragCoordR, r);
        vec4 colG = getScene(fragCoord , r);
        vec4 colB = getScene(fragCoordB, r);

        // Subtle chromatic aberration with orange tones
        fragColor = vec4(colR.r, colG.g * 0.8, colB.b * 0.3, 1.0);
    }

    void main() {
        vec4 fragColor;
        vec2 fragCoord = vUv * u_resolution.xy;
        mainImage(fragColor, fragCoord);
        gl_FragColor = fragColor;
    }
  `;

  const shaderUniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector3(1, 1, 1) },
    }),
    []
  );

  // Mobile fallback or SSR - static background for better performance and no overflow
  // isMobile is undefined on SSR, true on mobile, false on desktop
  if (isMobile !== false) {
    return (
      <div className={cn("relative overflow-hidden w-full max-w-full", className)}>
        <div className="absolute inset-0 bg-[#0a0a0a]" />
        {children && <div className="relative z-10">{children}</div>}
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden w-full max-w-full", className)}>
      <div 
        className="absolute inset-0 overflow-hidden" 
        style={{ 
          backgroundColor: '#0a0a0a',
          width: '100%',
          height: '100%',
          maxWidth: '100vw'
        }}
      >
        <Canvas 
          dpr={[0.5, 0.75]} 
          frameloop="demand" 
          style={{ 
            display: 'block',
            width: '100%', 
            height: '100%',
            maxWidth: '100%'
          }}
        >
          <ShaderPlane
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={shaderUniforms}
          />
        </Canvas>
      </div>
      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
};

export { ShaderBackground };
