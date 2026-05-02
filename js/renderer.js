/* DEADMISTRY - Renderer */
class GameRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    drawBackground(temp) {
        const ctx = this.ctx;
        // Base ground
        const grad = ctx.createRadialGradient(
            this.width / 2, this.height / 2, 50,
            this.width / 2, this.height / 2, this.width * 0.7
        );

        if (temp <= 200) {
            grad.addColorStop(0, '#2a3a30');
            grad.addColorStop(0.4, '#1a2a25');
            grad.addColorStop(1, '#0a1510');
        } else if (temp >= 400) {
            grad.addColorStop(0, '#3a2a20');
            grad.addColorStop(0.4, '#2a1a15');
            grad.addColorStop(1, '#150a05');
        } else {
            grad.addColorStop(0, '#2a3328');
            grad.addColorStop(0.4, '#1a2318');
            grad.addColorStop(1, '#0a0f08');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.width, this.height);

        // Ground texture - grass patches
        ctx.fillStyle = 'rgba(40,60,35,0.3)';
        const seed = 42;
        for (let i = 0; i < 60; i++) {
            const px = ((seed * (i + 1) * 7) % this.width);
            const py = ((seed * (i + 1) * 13) % this.height);
            ctx.beginPath();
            ctx.ellipse(px, py, 15 + (i % 10), 8 + (i % 6), (i * 0.5), 0, Math.PI * 2);
            ctx.fill();
        }

        // Grid lines (subtle)
        ctx.strokeStyle = 'rgba(255,255,255,0.02)';
        ctx.lineWidth = 1;
        for (let x = 0; x < this.width; x += 80) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
            ctx.stroke();
        }
        for (let y = 0; y < this.height; y += 80) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
            ctx.stroke();
        }

        // Vignette
        const vGrad = ctx.createRadialGradient(
            this.width / 2, this.height / 2, this.width * 0.3,
            this.width / 2, this.height / 2, this.width * 0.8
        );
        vGrad.addColorStop(0, 'transparent');
        vGrad.addColorStop(1, 'rgba(0,0,0,0.5)');
        ctx.fillStyle = vGrad;
        ctx.fillRect(0, 0, this.width, this.height);
    }

    drawPlacedCompounds(placedCompounds, temp, pressure, particles) {
        const ctx = this.ctx;
        for (const pc of placedCompounds) {
            if (pc.timer <= 0) continue;
            const data = COMPOUNDS[pc.key];
            if (!data) continue;
            const alpha = Math.min(1, pc.timer / 3);
            const radius = getEffectiveRadius(data, pressure);

            ctx.save();
            ctx.globalAlpha = alpha * 0.3;

            // Ground hazard circle
            const grd = ctx.createRadialGradient(pc.x, pc.y, 0, pc.x, pc.y, radius);
            grd.addColorStop(0, data.color);
            grd.addColorStop(1, 'transparent');
            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.arc(pc.x, pc.y, radius, 0, Math.PI * 2);
            ctx.fill();

            // Border ring
            ctx.globalAlpha = alpha * 0.5;
            ctx.strokeStyle = data.color;
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);
            ctx.beginPath();
            ctx.arc(pc.x, pc.y, radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            // Label
            ctx.globalAlpha = alpha * 0.8;
            ctx.fillStyle = data.color;
            ctx.font = 'bold 11px "Share Tech Mono"';
            ctx.textAlign = 'center';
            ctx.fillText(data.formula, pc.x, pc.y - radius - 5);

            ctx.restore();

            // Particle effects based on type
            if (pc.particleTimer <= 0) {
                pc.particleTimer = 0.3;
                if (data.type === 'gas' || data.poisonDPS) {
                    particles.emitGasCloud(pc.x, pc.y, data.color, radius * 0.5);
                }
                if (data.type === 'acid') {
                    particles.emitAcid(pc.x, pc.y, data.color);
                }
                if (data.explosive && temp >= 350) {
                    particles.emitFire(pc.x, pc.y);
                }
                if (pc.key === 'H2O' && temp <= 200) {
                    particles.emitFrost(pc.x, pc.y, radius);
                }
            }
        }
    }

    drawRain(temp) {
        if (temp > 350) return;
        const ctx = this.ctx;
        ctx.strokeStyle = temp <= 200 ? 'rgba(180,220,255,0.15)' : 'rgba(150,180,220,0.1)';
        ctx.lineWidth = 1;
        const t = Date.now() * 0.001;
        for (let i = 0; i < 80; i++) {
            const x = (i * 73 + t * 50) % this.width;
            const y = (i * 47 + t * 200) % this.height;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x - 2, y + 8 + (temp <= 200 ? 0 : 4));
            ctx.stroke();
        }
    }

    drawLightningFlash() {
        const ctx = this.ctx;
        if (Math.random() < 0.001) {
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.fillRect(0, 0, this.width, this.height);
        }
    }
}
