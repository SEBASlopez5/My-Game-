/* DEADMISTRY - Game Engine */
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.renderer = new GameRenderer(this.canvas);
        this.particles = new ParticleSystem();
        this.house = null;
        this.waveManager = null;
        this.ui = null;
        this.zombies = [];
        this.placedCompounds = [];
        this.inventory = [];
        this.moles = 100;
        this.maxMoles = 100;
        this.molesEarned = 0;
        this.score = 0;
        this.temperature = 250;
        this.pressure = 10;
        this.running = false;
        this.gameOver = false;
        this.lastTime = 0;
        this.mouseX = 0;
        this.mouseY = 0;

        this.setupInput();
    }

    init() {
        const cx = this.renderer.width / 2;
        const cy = this.renderer.height / 2;
        this.house = new House(cx, cy);
        this.waveManager = new WaveManager();
        this.ui = new GameUI(this);
        this.zombies = [];
        this.placedCompounds = [];
        this.inventory = [];
        this.moles = 100;
        this.maxMoles = 100;
        this.molesEarned = 0;
        this.score = 0;
        this.temperature = 250;
        this.pressure = 10;
        this.gameOver = false;
        this.running = true;

        // Reset UI
        document.getElementById('temp-slider').value = 250;
        document.getElementById('temp-value').textContent = '250 K';
        document.getElementById('pressure-slider').value = 10;
        document.getElementById('pressure-value').textContent = '10 ATM';
        document.getElementById('game-over').classList.add('hidden');
        this.ui.updateTempOverlay();
        this.ui.updateMoles();
        this.ui.updateInventory();

        this.waveManager.startWave(0);
        this.ui.showWaveAnnouncement('WAVE 1: BEGINNING');
    }

    setupInput() {
        this.canvas.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        this.canvas.addEventListener('click', (e) => {
            if (this.gameOver || !this.running) return;
            const x = e.clientX;
            const y = e.clientY;

            if (this.ui && this.ui.selectedCompound) {
                this.placeCompound(this.ui.selectedCompound, x, y);
            }
        });

        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (this.ui) this.ui.selectedCompound = null;
            if (this.ui) this.ui.updateInventory();
        });
    }

    addToInventory(key) {
        if (!this.inventory.includes(key)) {
            this.inventory.push(key);
        }
    }

    placeCompound(key, x, y) {
        const data = COMPOUNDS[key];
        if (!data) return;

        // Check if placing on house
        const dx = x - this.house.x;
        const dy = y - this.house.y;
        const distToHouse = Math.sqrt(dx * dx + dy * dy);

        if (distToHouse < 60) {
            this.house.addLayer(key);
            this.ui.notify(`Applied ${data.formula} to house!`);
            // Particles on house
            this.particles.emitGasCloud(this.house.x, this.house.y, data.color, 30);
        } else {
            this.placedCompounds.push({
                key: key,
                x: x,
                y: y,
                timer: 12,
                particleTimer: 0,
                hasExploded: false
            });
        }
    }

    update(dt) {
        if (this.gameOver || !this.running) return;

        dt = Math.min(dt, 0.05); // Cap dt

        // Update wave
        const spawnType = this.waveManager.update(dt, this.zombies.length);
        if (spawnType) {
            const z = spawnZombie(spawnType, this.house.x, this.house.y,
                this.renderer.width, this.renderer.height);
            z.hp += this.waveManager.currentWave * 5;
            z.maxHp = z.hp;
            this.zombies.push(z);
        }

        // Wave announcement
        if (this.waveManager.announcing) {
            this.ui.showWaveAnnouncement(
                `WAVE ${this.waveManager.currentWave + 1}: ${this.waveManager.getWaveName()}`
            );
        }

        // Wave cleared bonus
        if (this.waveManager.waveComplete) {
            this.moles = Math.min(this.maxMoles + 200, this.moles + 20);
            this.molesEarned += 20;
            this.score += 100;
            this.waveManager.waveComplete = false;
        }

        // Check win
        if (this.waveManager.allWavesComplete && this.zombies.length === 0) {
            this.gameOver = true;
            this.ui.showGameOver(true);
            return;
        }

        // Update house
        this.house.update(dt, this.temperature, this.pressure);

        // Check lose
        if (this.house.hp <= 0) {
            this.gameOver = true;
            this.ui.showGameOver(false);
            return;
        }

        // Update zombies
        for (let i = this.zombies.length - 1; i >= 0; i--) {
            const z = this.zombies[i];
            z.update(this.house.x, this.house.y, this.temperature, this.waveManager.currentWave, dt);

            // Zombie attacks house
            const distH = z.distToHouse(this.house.x, this.house.y);
            if (distH < z.size + 35 && z.canAttack()) {
                const dmg = z.attack();
                this.house.takeDamage(dmg);
                if (z.screenShake) {
                    this.house.shake(6, 0.4);
                }
                this.particles.emit(this.house.x, this.house.y, 5, {
                    color: '#ff4444', spread: 5, life: 15, size: 2
                });
            }

            // Dead zombie
            if (z.dead) {
                this.score += z.score;
                // Death effects
                if (z.deathCloud) {
                    const radius = z.largeToxicCloud ? 100 : 60;
                    this.particles.emitGasCloud(z.x, z.y, '#44cc44', radius);
                    // Damage nearby zombies? No, damage nearby area
                    this.placedCompounds.push({
                        key: 'toxic_cloud',
                        x: z.x, y: z.y,
                        timer: 4, particleTimer: 0, hasExploded: false,
                        _custom: { dmg: 5, radius: radius, color: '#44cc44', poisonDPS: 8 }
                    });
                }
                this.particles.emit(z.x, z.y, 10, {
                    color: z.color, spread: 4, life: 20, size: 3
                });
                this.zombies.splice(i, 1);
                continue;
            }
        }

        // Update placed compounds
        for (let i = this.placedCompounds.length - 1; i >= 0; i--) {
            const pc = this.placedCompounds[i];
            pc.timer -= dt;
            pc.particleTimer -= dt;

            if (pc.timer <= 0) {
                this.placedCompounds.splice(i, 1);
                continue;
            }

            // Custom toxic clouds from death effects
            if (pc._custom) {
                const c = pc._custom;
                for (const z of this.zombies) {
                    const d = Math.sqrt((z.x - pc.x) ** 2 + (z.y - pc.y) ** 2);
                    if (d < c.radius) {
                        z.applyPoison(c.poisonDPS, 2);
                    }
                }
                continue;
            }

            const data = COMPOUNDS[pc.key];
            if (!data) continue;
            const radius = getEffectiveRadius(data, this.pressure);

            // Check for explosive compounds
            if (data.explosive && !pc.hasExploded) {
                let shouldExplode = false;
                if (this.temperature >= 400) shouldExplode = true;
                // Check if there's a fire zombie nearby
                for (const z of this.zombies) {
                    if (z.fireAura) {
                        const d = Math.sqrt((z.x - pc.x) ** 2 + (z.y - pc.y) ** 2);
                        if (d < radius * 1.2) shouldExplode = true;
                    }
                }
                // Check if O2 is nearby (combustion boost)
                let o2Boost = 1;
                for (const other of this.placedCompounds) {
                    if (other.key === 'O2' && other !== pc) {
                        const d = Math.sqrt((other.x - pc.x) ** 2 + (other.y - pc.y) ** 2);
                        if (d < 150) {
                            o2Boost = 1.5;
                            shouldExplode = true;
                        }
                    }
                }

                if (shouldExplode) {
                    pc.hasExploded = true;
                    pc.timer = 0.5; // Fade out
                    const explosionDmg = data.dmgToZombie * o2Boost;
                    const explosionRadius = radius * (this.pressure >= 10 ? 1.3 : 0.8);

                    this.particles.emitExplosion(pc.x, pc.y, data.color, explosionRadius);
                    this.house.shake(4, 0.3);

                    for (const z of this.zombies) {
                        const d = Math.sqrt((z.x - pc.x) ** 2 + (z.y - pc.y) ** 2);
                        if (d < explosionRadius) {
                            const falloff = 1 - (d / explosionRadius);
                            z.takeDamage(explosionDmg * falloff, 'explosion');
                            z.applyBurn(3);
                        }
                    }

                    // House damage if too close
                    const dh = Math.sqrt((this.house.x - pc.x) ** 2 + (this.house.y - pc.y) ** 2);
                    if (dh < explosionRadius) {
                        this.house.takeDamage(explosionDmg * 0.3 * (1 - dh / explosionRadius));
                    }
                    continue;
                }
            }

            // Na + H2O reaction check
            if (pc.key === 'Na2O' && pc.timer > 1) {
                for (const other of this.placedCompounds) {
                    if (other.key === 'H2O' && other !== pc) {
                        const d = Math.sqrt((other.x - pc.x) ** 2 + (other.y - pc.y) ** 2);
                        if (d < radius + 50) {
                            pc.hasExploded = true;
                            pc.timer = 0.5;
                            this.particles.emitExplosion(pc.x, pc.y, '#ffcc00', 100);
                            this.house.shake(5, 0.3);
                            for (const z of this.zombies) {
                                const dz = Math.sqrt((z.x - pc.x) ** 2 + (z.y - pc.y) ** 2);
                                if (dz < 100) z.takeDamage(50 * (1 - dz / 100), 'explosion');
                            }
                        }
                    }
                }
            }

            // SO3 + H2O = H2SO4 effect
            if (pc.key === 'SO3' && pc.timer > 1) {
                for (const other of this.placedCompounds) {
                    if (other.key === 'H2O' && other !== pc) {
                        const d = Math.sqrt((other.x - pc.x) ** 2 + (other.y - pc.y) ** 2);
                        if (d < radius + 50) {
                            pc.key = 'H2SO4'; // Transform!
                            pc.timer = 10;
                            this.ui.notify('SO₃ + H₂O → H₂SO₄!');
                            this.particles.emitGasCloud(pc.x, pc.y, '#aaff00', 50);
                        }
                    }
                }
            }

            // Apply compound effects to zombies in range
            for (const z of this.zombies) {
                const d = Math.sqrt((z.x - pc.x) ** 2 + (z.y - pc.y) ** 2);
                if (d < radius) {
                    // Slow
                    if (data.slowFactor < 1) {
                        z.applySlow(data.slowFactor, 1);
                    }
                    // Freeze check
                    if (pc.key === 'H2O' && this.temperature <= 200 && !z.coldResist) {
                        z.applySlow(0.2, 2);
                        z.takeDamage(5 * dt, 'cold');
                    }
                    // Poison
                    if (data.poisonDPS) {
                        z.applyPoison(data.poisonDPS, 2);
                    }
                    // Direct damage (non-explosive)
                    if (data.dmgToZombie > 0 && !data.explosive) {
                        let dmg = getEffectiveDamage(data, this.temperature, this.pressure, z.type);
                        z.takeDamage(dmg * dt, data.type);
                    }
                    // Acid
                    if (data.type === 'acid') {
                        z.applyAcid(2);
                    }
                    // Armor strip
                    if (data.armorStrip) {
                        z.stripArmor(data.armorStrip * dt);
                    }
                    // NaCl shard mode at high pressure
                    if (pc.key === 'NaCl' && this.pressure >= 10) {
                        z.takeDamage(15 * dt, 'shard');
                    }
                    // Fire suppress (CO2)
                    if (data.fireSuppress) {
                        z.burnTimer = 0;
                    }
                    // NaOH acid neutralizer on ground
                    if (data.acidNeutralizer) {
                        z.acidTimer = Math.max(0, z.acidTimer - dt * 2);
                    }
                    // Electric zombie in water
                    if (z.electric && pc.key === 'H2O') {
                        // Electric zombies electrify water puddles
                        for (const z2 of this.zombies) {
                            if (z2 !== z) {
                                const d2 = Math.sqrt((z2.x - pc.x) ** 2 + (z2.y - pc.y) ** 2);
                                if (d2 < radius) {
                                    z2.takeDamage(8 * dt, 'electric');
                                }
                            }
                        }
                    }
                }
            }
        }

        // Update particles
        this.particles.update();

        // Update UI
        this.ui.updateHouseHP();
        this.ui.updateScore();
        this.ui.updateWaveInfo();
        this.ui.updateMapEffects();
        this.ui.updateNotifications(dt);
    }

    draw() {
        const ctx = this.renderer.ctx;
        this.renderer.clear();
        this.renderer.drawBackground(this.temperature);
        this.renderer.drawRain(this.temperature);
        this.renderer.drawLightningFlash();

        // Draw placed compounds
        this.renderer.drawPlacedCompounds(this.placedCompounds, this.temperature, this.pressure, this.particles);

        // Draw house
        this.house.draw(ctx, this.temperature);

        // Draw zombies
        for (const z of this.zombies) {
            z.draw(ctx);
        }

        // Draw particles
        this.particles.draw(ctx);

        // Draw placement preview
        if (this.ui && this.ui.selectedCompound && !this.gameOver) {
            const data = COMPOUNDS[this.ui.selectedCompound];
            if (data) {
                const radius = getEffectiveRadius(data, this.pressure);
                ctx.save();
                ctx.globalAlpha = 0.3;
                ctx.strokeStyle = data.color;
                ctx.setLineDash([6, 4]);
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(this.mouseX, this.mouseY, radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);

                ctx.fillStyle = data.color;
                ctx.font = 'bold 12px "Share Tech Mono"';
                ctx.textAlign = 'center';
                ctx.fillText(data.formula, this.mouseX, this.mouseY - radius - 8);
                ctx.restore();
            }
        }

        // Draw notifications
        this.ui.drawNotifications(ctx, this.renderer.width, this.renderer.height);
    }

    gameLoop(timestamp) {
        if (!this.running && !this.gameOver) return;

        const dt = this.lastTime ? (timestamp - this.lastTime) / 1000 : 0.016;
        this.lastTime = timestamp;

        this.update(dt);
        this.draw();

        requestAnimationFrame((t) => this.gameLoop(t));
    }

    start() {
        this.init();
        this.lastTime = 0;
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    stop() {
        this.running = false;
    }
}
