/* DEADMISTRY - Particle System */
class Particle {
    constructor(x, y, opts = {}) {
        this.x = x;
        this.y = y;
        this.vx = opts.vx || (Math.random() - 0.5) * 2;
        this.vy = opts.vy || (Math.random() - 0.5) * 2;
        this.life = opts.life || 60;
        this.maxLife = this.life;
        this.size = opts.size || 3;
        this.color = opts.color || '#ffffff';
        this.alpha = opts.alpha || 1;
        this.fadeRate = opts.fadeRate || 0.02;
        this.gravity = opts.gravity || 0;
        this.shrink = opts.shrink || false;
        this.type = opts.type || 'default';
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.life--;
        this.alpha = Math.max(0, this.alpha - this.fadeRate);
        if (this.shrink) this.size *= 0.98;
    }

    isDead() { return this.life <= 0 || this.alpha <= 0; }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        if (this.type === 'gas') {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'spark') {
            ctx.fillRect(this.x - 1, this.y - 1, 2, 2);
        } else if (this.type === 'shard') {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - this.size);
            ctx.lineTo(this.x + this.size * 0.5, this.y + this.size);
            ctx.lineTo(this.x - this.size * 0.5, this.y + this.size);
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    add(p) { this.particles.push(p); }

    emit(x, y, count, opts) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, {
                ...opts,
                vx: (opts.vx || 0) + (Math.random() - 0.5) * (opts.spread || 3),
                vy: (opts.vy || 0) + (Math.random() - 0.5) * (opts.spread || 3),
                life: (opts.life || 40) + Math.random() * 20,
                size: (opts.size || 3) + Math.random() * 2
            }));
        }
    }

    emitExplosion(x, y, color, radius) {
        const count = Math.floor(radius * 0.5);
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 5;
            this.particles.push(new Particle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 30 + Math.random() * 30,
                size: 2 + Math.random() * 4,
                color: color,
                fadeRate: 0.03,
                type: Math.random() > 0.5 ? 'spark' : 'default',
                gravity: 0.05
            }));
        }
        // Flash
        this.particles.push(new Particle(x, y, {
            vx: 0, vy: 0, life: 8,
            size: radius * 0.6, color: '#ffffff',
            fadeRate: 0.12, type: 'default'
        }));
    }

    emitGasCloud(x, y, color, radius) {
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * radius * 0.5;
            this.particles.push(new Particle(
                x + Math.cos(angle) * dist,
                y + Math.sin(angle) * dist,
                {
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    life: 60 + Math.random() * 40,
                    size: 8 + Math.random() * 12,
                    color: color,
                    alpha: 0.3,
                    fadeRate: 0.005,
                    type: 'gas'
                }
            ));
        }
    }

    emitFrost(x, y, radius) {
        for (let i = 0; i < 6; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * radius;
            this.particles.push(new Particle(
                x + Math.cos(angle) * dist,
                y + Math.sin(angle) * dist,
                {
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: -0.5 - Math.random() * 0.5,
                    life: 40 + Math.random() * 20,
                    size: 1 + Math.random() * 2,
                    color: '#aaddff',
                    fadeRate: 0.02,
                    type: 'shard'
                }
            ));
        }
    }

    emitFire(x, y) {
        for (let i = 0; i < 4; i++) {
            const colors = ['#ff4400', '#ff8800', '#ffcc00', '#ff6600'];
            this.particles.push(new Particle(x + (Math.random()-0.5)*10, y, {
                vx: (Math.random() - 0.5) * 1,
                vy: -1 - Math.random() * 2,
                life: 20 + Math.random() * 15,
                size: 3 + Math.random() * 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                fadeRate: 0.04,
                shrink: true,
                type: 'default'
            }));
        }
    }

    emitAcid(x, y, color) {
        for (let i = 0; i < 3; i++) {
            this.particles.push(new Particle(x + (Math.random()-0.5)*20, y + (Math.random()-0.5)*20, {
                vx: (Math.random() - 0.5) * 0.5,
                vy: -0.3 - Math.random() * 0.5,
                life: 30 + Math.random() * 20,
                size: 2 + Math.random() * 3,
                color: color || '#44ff44',
                fadeRate: 0.02,
                type: 'default'
            }));
        }
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].isDead()) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        for (const p of this.particles) {
            p.draw(ctx);
        }
    }

    get count() { return this.particles.length; }
}
