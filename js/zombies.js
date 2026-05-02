/* DEADMISTRY - Zombie System */
const ZOMBIE_TYPES = {
    basic: {
        name: 'Basic', color: '#558844', hp: 40, speed: 1.0,
        damage: 3, size: 18, score: 10, armor: 0
    },
    fast: {
        name: 'Fast', color: '#88aa44', hp: 25, speed: 2.2,
        damage: 2, size: 15, score: 15, armor: 0
    },
    fire: {
        name: 'Fire', color: '#ff6633', hp: 60, speed: 1.1,
        damage: 5, size: 20, score: 25, armor: 0,
        fireAura: true
    },
    ice: {
        name: 'Ice', color: '#66ccff', hp: 55, speed: 1.0,
        damage: 4, size: 20, score: 25, armor: 0,
        coldResist: true
    },
    toxic: {
        name: 'Toxic', color: '#44cc44', hp: 50, speed: 0.9,
        damage: 4, size: 19, score: 20, armor: 0,
        deathCloud: true
    },
    massive: {
        name: 'Massive', color: '#886644', hp: 300, speed: 0.4,
        damage: 20, size: 38, score: 80, armor: 0.3,
        screenShake: true
    },
    armored: {
        name: 'Armored', color: '#aaaaaa', hp: 120, speed: 0.8,
        damage: 6, size: 22, score: 40, armor: 0.5
    },
    electric: {
        name: 'Electric', color: '#ffff44', hp: 45, speed: 1.2,
        damage: 5, size: 18, score: 30, armor: 0,
        electric: true
    },
    mutator: {
        name: 'Mutator', color: '#cc44cc', hp: 80, speed: 1.0,
        damage: 5, size: 21, score: 50, armor: 0.1,
        adaptive: true
    },
    massive_fire: {
        name: 'Massive Fire', color: '#ff4400', hp: 350, speed: 0.35,
        damage: 25, size: 42, score: 100, armor: 0.3,
        fireAura: true, screenShake: true
    },
    massive_toxic: {
        name: 'Massive Toxic', color: '#33aa33', hp: 320, speed: 0.38,
        damage: 22, size: 42, score: 100, armor: 0.25,
        deathCloud: true, screenShake: true, largeToxicCloud: true
    },
    massive_armored: {
        name: 'Massive Armored', color: '#999999', hp: 500, speed: 0.3,
        damage: 30, size: 46, score: 150, armor: 0.6,
        screenShake: true
    }
};

class Zombie {
    constructor(x, y, type, wave) {
        const data = ZOMBIE_TYPES[type];
        this.x = x;
        this.y = y;
        this.type = type;
        this.hp = data.hp + wave * 3;
        this.maxHp = this.hp;
        this.baseSpeed = data.speed;
        this.speed = data.speed;
        this.damage = data.damage;
        this.size = data.size;
        this.color = data.color;
        this.score = data.score;
        this.armor = data.armor;
        this.fireAura = data.fireAura || false;
        this.coldResist = data.coldResist || false;
        this.deathCloud = data.deathCloud || false;
        this.largeToxicCloud = data.largeToxicCloud || false;
        this.electric = data.electric || false;
        this.adaptive = data.adaptive || false;
        this.screenShake = data.screenShake || false;
        this.slowTimer = 0;
        this.slowFactor = 1;
        this.poisonDPS = 0;
        this.poisonTimer = 0;
        this.burnTimer = 0;
        this.acidTimer = 0;
        this.adaptedTo = null;
        this.attackCooldown = 0;
        this.dead = false;
        this.angle = 0;
        this.frame = Math.random() * 100;
        this.armorReduced = 0;
        this.hitFlash = 0;
    }

    getSpeedMultiplier(temp, wave) {
        let mult = 1.0;
        // Wave speed modifiers
        if (wave <= 2) mult *= 0.7;
        else if (wave === 3) mult *= 0.85;
        else if (wave >= 6) mult *= 1.15;

        // Temperature speed modifiers
        if (temp <= 200) {
            if (this.coldResist) mult *= 1.2;
            else mult *= 0.5;
        } else if (temp >= 400) {
            if (this.fireAura) mult *= 1.2;
            else mult *= 0.6;
        }

        // Slow effect
        if (this.slowTimer > 0) mult *= this.slowFactor;

        return mult;
    }

    update(houseX, houseY, temp, wave, dt) {
        this.frame += dt;
        const dx = houseX - this.x;
        const dy = houseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        this.angle = Math.atan2(dy, dx);

        const speedMult = this.getSpeedMultiplier(temp, wave);
        const actualSpeed = this.baseSpeed * speedMult * 60 * dt;

        if (dist > this.size + 30) {
            this.x += (dx / dist) * actualSpeed;
            this.y += (dy / dist) * actualSpeed;
        }

        // Timers
        if (this.slowTimer > 0) this.slowTimer -= dt;
        if (this.poisonTimer > 0) {
            this.poisonTimer -= dt;
            this.takeDamage(this.poisonDPS * dt, 'poison');
        }
        if (this.burnTimer > 0) {
            this.burnTimer -= dt;
            this.takeDamage(10 * dt, 'fire');
        }
        if (this.acidTimer > 0) {
            this.acidTimer -= dt;
            this.takeDamage(15 * dt, 'acid');
        }
        if (this.hitFlash > 0) this.hitFlash -= dt;
        if (this.attackCooldown > 0) this.attackCooldown -= dt;
    }

    takeDamage(dmg, type) {
        let effectiveDmg = dmg;
        const effectiveArmor = Math.max(0, this.armor - this.armorReduced);
        effectiveDmg *= (1 - effectiveArmor);

        if (this.adaptive && this.adaptedTo === type) {
            effectiveDmg *= 0.4;
        }
        if (this.adaptive && type && type !== this.adaptedTo) {
            this.adaptedTo = type;
        }

        this.hp -= effectiveDmg;
        this.hitFlash = 0.15;
        if (this.hp <= 0) {
            this.hp = 0;
            this.dead = true;
        }
    }

    applySlow(factor, duration) {
        this.slowFactor = Math.min(this.slowFactor, factor);
        this.slowTimer = Math.max(this.slowTimer, duration);
    }

    applyPoison(dps, duration) {
        this.poisonDPS = Math.max(this.poisonDPS, dps);
        this.poisonTimer = Math.max(this.poisonTimer, duration);
    }

    applyBurn(duration) {
        if (!this.fireAura) this.burnTimer = Math.max(this.burnTimer, duration);
    }

    applyAcid(duration) {
        this.acidTimer = Math.max(this.acidTimer, duration);
    }

    stripArmor(amount) {
        this.armorReduced = Math.min(this.armor, this.armorReduced + amount);
    }

    canAttack() {
        return this.attackCooldown <= 0;
    }

    attack() {
        this.attackCooldown = this.type.includes('massive') ? 2.0 : 1.0;
        return this.damage;
    }

    distToHouse(hx, hy) {
        const dx = hx - this.x;
        const dy = hy - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle + Math.PI / 2);

        const flash = this.hitFlash > 0;
        const s = this.size;
        const walk = Math.sin(this.frame * 6) * 3;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(0, s * 0.7, s * 0.8, s * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();

        // Legs (walking animation)
        const legColor = flash ? '#ccc' : shadeColor(this.color, -40);
        ctx.fillStyle = legColor;
        ctx.fillRect(-s * 0.35, s * 0.15, s * 0.22, s * 0.55 + walk * 0.3);
        ctx.fillRect(s * 0.13, s * 0.15, s * 0.22, s * 0.55 - walk * 0.3);

        // Arms
        const armColor = flash ? '#ddd' : shadeColor(this.color, -20);
        ctx.fillStyle = armColor;
        const armSwing = Math.sin(this.frame * 5) * 0.3;
        ctx.save();
        ctx.translate(-s * 0.65, -s * 0.15);
        ctx.rotate(armSwing - 0.3);
        ctx.fillRect(-3, 0, s * 0.2, s * 0.6);
        ctx.restore();
        ctx.save();
        ctx.translate(s * 0.65, -s * 0.15);
        ctx.rotate(-armSwing + 0.3);
        ctx.fillRect(-s * 0.2 + 3, 0, s * 0.2, s * 0.6);
        ctx.restore();

        // Torso
        const bodyColor = flash ? '#ffffff' : this.color;
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.55, s * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();

        // Torn clothing detail
        ctx.strokeStyle = flash ? '#aaa' : shadeColor(this.color, -25);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-s * 0.3, s * 0.1);
        ctx.lineTo(-s * 0.1, s * 0.35);
        ctx.lineTo(s * 0.15, s * 0.2);
        ctx.stroke();

        // Head
        const headColor = flash ? '#eee' : shadeColor(this.color, 15);
        ctx.fillStyle = headColor;
        ctx.beginPath();
        ctx.arc(0, -s * 0.45, s * 0.35, 0, Math.PI * 2);
        ctx.fill();

        // Head outline
        ctx.strokeStyle = flash ? '#999' : shadeColor(this.color, -30);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, -s * 0.45, s * 0.35, 0, Math.PI * 2);
        ctx.stroke();

        // Eyes
        const eyeColor = this.type === 'fire' ? '#ff2200' :
            this.type === 'electric' ? '#ffff00' :
            this.type === 'ice' ? '#00ddff' :
            this.type === 'toxic' ? '#44ff00' :
            this.type === 'mutator' ? '#ff00ff' : '#ff3300';
        const eyeGlow = this.type === 'fire' ? 'rgba(255,0,0,0.4)' :
            this.type === 'electric' ? 'rgba(255,255,0,0.4)' : 'rgba(255,0,0,0.3)';
        ctx.fillStyle = eyeGlow;
        ctx.beginPath();
        ctx.arc(-s * 0.13, -s * 0.5, s * 0.14, 0, Math.PI * 2);
        ctx.arc(s * 0.13, -s * 0.5, s * 0.14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = eyeColor;
        ctx.beginPath();
        ctx.arc(-s * 0.13, -s * 0.5, s * 0.08, 0, Math.PI * 2);
        ctx.arc(s * 0.13, -s * 0.5, s * 0.08, 0, Math.PI * 2);
        ctx.fill();

        // Mouth
        ctx.strokeStyle = flash ? '#666' : shadeColor(this.color, -50);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, -s * 0.35, s * 0.12, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Armor plates for armored type
        if (this.armor > 0.3) {
            ctx.strokeStyle = '#888';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, s * 0.5, -0.8, 0.8);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, 0, s * 0.5, Math.PI - 0.8, Math.PI + 0.8);
            ctx.stroke();
            ctx.fillStyle = 'rgba(150,150,150,0.3)';
            ctx.fillRect(-s * 0.4, -s * 0.3, s * 0.8, s * 0.6);
        }

        // Fire aura
        if (this.fireAura) {
            const flicker = Math.sin(this.frame * 10) * 3;
            ctx.strokeStyle = 'rgba(255,100,0,0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, s * 0.7 + flicker, 0, Math.PI * 2);
            ctx.stroke();
            // Fire particles on body
            ctx.fillStyle = 'rgba(255,80,0,0.4)';
            for (let i = 0; i < 4; i++) {
                const fa = (this.frame * 8 + i * 1.5) % (Math.PI * 2);
                const fr = s * 0.4;
                ctx.beginPath();
                ctx.arc(Math.cos(fa) * fr, Math.sin(fa) * fr - s * 0.2, 3 + Math.sin(this.frame * 12 + i) * 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Ice crystals for ice type
        if (this.coldResist) {
            ctx.strokeStyle = 'rgba(100,200,255,0.6)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 5; i++) {
                const ia = (i / 5) * Math.PI * 2;
                const ir = s * 0.6;
                ctx.beginPath();
                ctx.moveTo(Math.cos(ia) * s * 0.4, Math.sin(ia) * s * 0.4);
                ctx.lineTo(Math.cos(ia) * ir, Math.sin(ia) * ir);
                ctx.stroke();
            }
        }

        // Toxic drip for toxic type
        if (this.deathCloud) {
            ctx.fillStyle = 'rgba(68,204,68,0.4)';
            const drip = (this.frame * 2) % 1;
            ctx.beginPath();
            ctx.arc(-s * 0.2, s * 0.3 + drip * s * 0.5, 2, 0, Math.PI * 2);
            ctx.arc(s * 0.15, s * 0.2 + ((drip + 0.5) % 1) * s * 0.5, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Electric sparks
        if (this.electric) {
            ctx.strokeStyle = 'rgba(255,255,0,0.7)';
            ctx.lineWidth = 1.5;
            for (let i = 0; i < 4; i++) {
                const a = (this.frame * 5 + i * 1.6) % (Math.PI * 2);
                const r1 = s * 0.5;
                const r2 = s * 0.8;
                const mid = (r1 + r2) / 2;
                ctx.beginPath();
                ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
                ctx.lineTo(Math.cos(a + 0.2) * mid + (Math.random()-0.5)*4, Math.sin(a + 0.2) * mid + (Math.random()-0.5)*4);
                ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
                ctx.stroke();
            }
        }

        // Mutator glow
        if (this.adaptive) {
            const pulse = (Math.sin(this.frame * 3) + 1) * 0.15;
            ctx.fillStyle = `rgba(204,68,204,${pulse})`;
            ctx.beginPath();
            ctx.arc(0, -s * 0.1, s * 0.7, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();

        // HP bar (drawn without rotation)
        if (this.hp < this.maxHp) {
            ctx.save();
            ctx.translate(this.x, this.y);
            const barW = this.size * 2.2;
            const barH = 4;
            const barY = -this.size - 10;
            ctx.fillStyle = '#222';
            ctx.fillRect(-barW/2, barY, barW, barH);
            ctx.strokeStyle = '#444';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(-barW/2, barY, barW, barH);
            const hpPct = this.hp / this.maxHp;
            ctx.fillStyle = hpPct > 0.5 ? '#44ff44' : hpPct > 0.25 ? '#ffaa00' : '#ff3333';
            ctx.fillRect(-barW/2, barY, barW * hpPct, barH);
            ctx.restore();
        }
    }
}

function shadeColor(color, percent) {
    const num = parseInt(color.replace('#',''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

function spawnZombie(type, houseX, houseY, canvasW, canvasH) {
    const side = Math.floor(Math.random() * 4);
    let x, y;
    const margin = 50;
    switch(side) {
        case 0: x = -margin; y = Math.random() * canvasH; break;
        case 1: x = canvasW + margin; y = Math.random() * canvasH; break;
        case 2: x = Math.random() * canvasW; y = -margin; break;
        case 3: x = Math.random() * canvasW; y = canvasH + margin; break;
    }
    return new Zombie(x, y, type, 1);
}
