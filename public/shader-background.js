/**
 * Premium Orange Plasma Shader Background
 * Smooth, luxury, fluid plasma animation
 * Brand colors: Black (#000000) + Orange (#ef7b1b)
 * Pure vanilla WebGL — no dependencies.
 */
(function () {
    'use strict';

    const canvas = document.getElementById('shader-canvas');
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
        console.warn('WebGL not supported — falling back to static background.');
        return;
    }

    // ─── Vertex Shader ───────────────────────────────────────────
    const vsSource = `
        attribute vec4 aVertexPosition;
        void main() {
            gl_Position = aVertexPosition;
        }
    `;

    // ─── Fragment Shader — Premium Orange Plasma ─────────────────
    const fsSource = `
        precision highp float;

        uniform vec2 iResolution;
        uniform float iTime;

        // Smooth hash-based noise (no harsh patterns)
        float hash(vec2 p) {
            vec3 p3 = fract(vec3(p.xyx) * 0.1031);
            p3 += dot(p3, p3.yzx + 33.33);
            return fract((p3.x + p3.y) * p3.z);
        }

        float smoothNoise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);  // smoothstep interpolation

            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));

            return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        float fbm(vec2 p) {
            float value = 0.0;
            float amplitude = 0.5;
            float frequency = 1.0;
            for (int i = 0; i < 6; i++) {
                value += amplitude * smoothNoise(p * frequency);
                frequency *= 2.0;
                amplitude *= 0.5;
            }
            return value;
        }

        void main() {
            vec2 uv = gl_FragCoord.xy / iResolution.xy;
            float aspect = iResolution.x / iResolution.y;
            vec2 p = uv;
            p.x *= aspect;

            float t = iTime * 0.2;

            // Layered flowing distortion
            float warp1 = fbm(p * 2.5 + vec2(t * 0.4, t * 0.3));
            float warp2 = fbm(p * 3.0 + vec2(-t * 0.3, t * 0.5) + warp1 * 1.5);

            // Primary plasma intensity — remap to create contrast
            float plasma = fbm(p * 2.0 + warp2 * 2.0 + vec2(t * 0.2));

            // Create high-contrast bands with deep black valleys
            plasma = smoothstep(0.3, 0.7, plasma);
            plasma = pow(plasma, 1.8);

            // Soft radial vignette — glow from center
            float dist = distance(uv, vec2(0.5));
            float vignette = smoothstep(1.0, 0.15, dist);

            // Brand orange #ef7b1b normalized
            vec3 orange = vec3(0.937, 0.482, 0.106);
            vec3 deepOrange = vec3(0.5, 0.2, 0.04);
            vec3 black = vec3(0.0);

            // Two-tone orange blend for depth
            vec3 warmColor = mix(deepOrange, orange, plasma);
            vec3 color = mix(black, warmColor, plasma * 0.9);

            // Apply vignette
            color *= vignette;

            // Subtle ambient glow so edges aren't pure black
            color += orange * 0.015;

            gl_FragColor = vec4(color, 1.0);
        }
    `;

    // ─── Helpers ─────────────────────────────────────────────────
    function compileShader(type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    function createProgram(vs, fs) {
        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            return null;
        }
        return program;
    }

    // ─── Init ────────────────────────────────────────────────────
    const vs = compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const program = createProgram(vs, fs);
    if (!program) return;

    gl.useProgram(program);

    // Full-screen quad (triangle strip)
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1, 1, -1, -1, 1, 1, 1
    ]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, 'aVertexPosition');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, 'iTime');
    const uRes = gl.getUniformLocation(program, 'iResolution');

    // ─── Resize ──────────────────────────────────────────────────
    function resize() {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener('resize', resize);

    // ─── Render Loop ─────────────────────────────────────────────
    let animationId;
    const startTime = performance.now();

    // Pause when tab is invisible (battery / perf)
    let paused = false;
    document.addEventListener('visibilitychange', function () {
        paused = document.hidden;
        if (!paused) animationId = requestAnimationFrame(render);
    });

    function render() {
        if (paused) return;

        const elapsed = (performance.now() - startTime) / 1000;

        gl.useProgram(program);
        gl.uniform1f(uTime, elapsed);
        gl.uniform2f(uRes, canvas.width, canvas.height);

        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aPos);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        animationId = requestAnimationFrame(render);
    }

    animationId = requestAnimationFrame(render);
})();
