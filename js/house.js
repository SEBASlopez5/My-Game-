/* DEADMISTRY - House System */
class House {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 100;
        this.height = 80;
        this.hp = 1000;
        this.maxHp = 1000;
        this.layers = []; // Active compound layers on the house
        this.shakeTimer = 0;
        this.shakeIntensity = 0;
    }

    addLayer(compoundKey) {
        const data = COMPOUNDS[compoundKey];
        if (!data) return;
        const existing = this.layers.find(l => l.key === compoundKey);
        if (existing) {
            existing.timer = 15; // Refresh duration
            return;
        }
        this.layers.push({
            key: compoundKey,
            data: data,
            timer: 15, // 15 seconds duration
            alpha: 1
        });
    }

    update(dt, temp, pressure) {
        // Process layers
        for (let i = this.layers.length - 1; i >= 0; i--) {
            const layer = this.layers[i];
            layer.timer -= dt;
            layer.alpha = Math.min(1, layer.timer / 3);

            // Heal/damage from layers
            if (layer.data.houseHeal > 0) {
                let heal = layer.data.houseHeal;
                // Best healing at 201-399K
                if (temp >= 201 && temp <= 399) heal *= 1.0;
                else heal *= 0.6;
                this.hp = Math.min(this.maxHp, this.hp + heal * dt);
            }
            if (layer.data.houseDmg < 0) {
                this.hp += layer.data.houseDmg * dt;
            }

            if (layer.timer <= 0) {
                this.layers.splice(i, 1);
            }
        }

        // Screen shake
        if (this.shakeTimer > 0) {
            this.shakeTimer -= dt;
        }

        this.hp = Math.max(0, Math.min(this.maxHp, this.hp));
    }

    shake(intensity, duration) {
        this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
        this.shakeTimer = Math.max(this.shakeTimer, duration);
    }

    takeDamage(dmg) {
        this.hp -= dmg;
        this.shake(3, 0.2);
        if (this.hp < 0) this.hp = 0;
    }

    getShakeOffset() {
        if (this.shakeTimer <= 0) return { x: 0, y: 0 };
        return {
            x: (Math.random() - 0.5) * this.shakeIntensity * 2,
            y: (Math.random() - 0.5) * this.shakeIntensity * 2
        };
    }

    hasLayer(key) {
        return this.layers.some(l => l.key === key);
    }

    draw(ctx, temp) {
        const shake = this.getShakeOffset();
        const sx = this.x + shake.x;
        const sy = this.y + shake.y;
        const w = this.width;
        const h = this.height;

        // Draw layers BEHIND house
        this.drawLayersBehind(ctx, sx, sy, w, h, temp);

        // House shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(sx, sy + h * 0.55, w * 0.7, h * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // House base (walls)
        const wallGrad = ctx.createLinearGradient(sx - w/2, sy - h/3, sx + w/2, sy + h/3);
        wallGrad.addColorStop(0, '#c8b090');
        wallGrad.addColorStop(1, '#a08060');
        ctx.fillStyle = wallGrad;
        ctx.fillRect(sx - w/2, sy - h/3, w, h * 0.7);

        // Wall detail lines
        ctx.strokeStyle = '#8a7050';
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
            const ly = sy - h/3 + (h * 0.7 / 4) * (i + 1);
            ctx.beginPath();
            ctx.moveTo(sx - w/2, ly);
            ctx.lineTo(sx + w/2, ly);
            ctx.stroke();
        }

        // Roof
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.moveTo(sx - w * 0.6, sy - h/3);
        ctx.lineTo(sx, sy - h * 0.8);
        ctx.lineTo(sx + w * 0.6, sy - h/3);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#6B3010';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sx - w * 0.6, sy - h/3);
        ctx.lineTo(sx, sy - h * 0.8);
        ctx.lineTo(sx + w * 0.6, sy - h/3);
        ctx.stroke();

        // Chimney
        ctx.fillStyle = '#7a5530';
        ctx.fillRect(sx + w * 0.15, sy - h * 0.85, 12, h * 0.3);

        // Door
        ctx.fillStyle = '#5a3a1a';
        ctx.fillRect(sx - 8, sy + h * 0.05, 16, h * 0.32);
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.arc(sx + 4, sy + h * 0.2, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Windows with warm glow
        const windowGlow = this.hp > 200 ? 'rgba(255,200,80,0.8)' : 'rgba(255,80,40,0.6)';
        const windowPositions = [
            [-w * 0.28, -h * 0.1, 14, 12],
            [w * 0.16, -h * 0.1, 14, 12],
            [-w * 0.28, h * 0.13, 14, 12],
            [w * 0.16, h * 0.13, 14, 12],
        ];
        for (const [wx, wy, ww, wh] of windowPositions) {
            ctx.fillStyle = windowGlow;
            ctx.fillRect(sx + wx, sy + wy, ww, wh);
            ctx.strokeStyle = '#5a3a1a';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(sx + wx, sy + wy, ww, wh);
            // Cross pane
            ctx.beginPath();
            ctx.moveTo(sx + wx + ww/2, sy + wy);
            ctx.lineTo(sx + wx + ww/2, sy + wy + wh);
            ctx.moveTo(sx + wx, sy + wy + wh/2);
            ctx.lineTo(sx + wx + ww, sy + wy + wh/2);
            ctx.stroke();
        }

        // Fence posts
        ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 1;
        for (let i = -4; i <= 4; i++) {
            const fx = sx + i * (w * 0.3);
            if (Math.abs(fx - sx) < w * 0.55) continue;
            ctx.beginPath();
            ctx.moveTo(fx, sy + h * 0.3);
            ctx.lineTo(fx, sy + h * 0.5);
            ctx.stroke();
        }

        // Draw layers ON TOP of house
        this.drawLayersOnTop(ctx, sx, sy, w, h, temp);
    }

    drawLayersBehind(ctx, sx, sy, w, h, temp) {
        for (const layer of this.layers) {
            const a = layer.alpha * 0.4;
            if (layer.key === 'H2O') {
                if (temp <= 200) {
                    // Ice shell behind
                    ctx.strokeStyle = `rgba(150,220,255,${a})`;
                    ctx.lineWidth = 6;
                    ctx.beginPath();
                    ctx.ellipse(sx, sy, w * 0.75, h * 0.65, 0, Math.PI * 0.6, Math.PI * 1.4);
                    ctx.stroke();
                }
            }
        }
    }

    drawLayersOnTop(ctx, sx, sy, w, h, temp) {
        for (const layer of this.layers) {
            const a = layer.alpha;
            ctx.save();

            if (layer.key === 'H2O') {
                if (temp <= 200) {
                    // Ice shell
                    ctx.strokeStyle = `rgba(150,220,255,${a * 0.7})`;
                    ctx.lineWidth = 5;
                    ctx.setLineDash([8, 4]);
                    ctx.beginPath();
                    ctx.ellipse(sx, sy, w * 0.72, h * 0.62, 0, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.setLineDash([]);

                    // Frost particles
                    ctx.fillStyle = `rgba(200,240,255,${a * 0.5})`;
                    for (let i = 0; i < 8; i++) {
                        const ang = (Date.now() * 0.001 + i * 0.8) % (Math.PI * 2);
                        const r = w * 0.65 + Math.sin(Date.now() * 0.003 + i) * 5;
                        ctx.beginPath();
                        ctx.arc(sx + Math.cos(ang) * r, sy + Math.sin(ang) * r * 0.85, 2, 0, Math.PI * 2);
                        ctx.fill();
                    }
                } else {
                    // Water layer
                    ctx.fillStyle = `rgba(68,136,255,${a * 0.25})`;
                    ctx.beginPath();
                    ctx.ellipse(sx, sy + h * 0.2, w * 0.7, h * 0.35, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = `rgba(68,136,255,${a * 0.5})`;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            } else if (layer.key === 'NaCl') {
                // Crystal shell
                ctx.strokeStyle = `rgba(255,255,255,${a * 0.6})`;
                ctx.lineWidth = 3;
                ctx.setLineDash([4, 6]);
                ctx.beginPath();
                ctx.ellipse(sx, sy, w * 0.68, h * 0.58, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);

                // Crystal particles
                ctx.fillStyle = `rgba(255,255,255,${a * 0.7})`;
                for (let i = 0; i < 12; i++) {
                    const ang = (i / 12) * Math.PI * 2;
                    const r = w * 0.6 + Math.sin(Date.now() * 0.002 + i) * 3;
                    ctx.fillRect(sx + Math.cos(ang) * r - 1, sy + Math.sin(ang) * r * 0.85 - 1, 3, 3);
                }
            } else {
                // Generic compound glow
                ctx.strokeStyle = layer.data.glowColor || `rgba(0,255,0,${a * 0.4})`;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.ellipse(sx, sy, w * 0.7, h * 0.6, 0, 0, Math.PI * 2);
                ctx.stroke();
            }

            ctx.restore();
        }
    }
}
