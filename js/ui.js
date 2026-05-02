/* DEADMISTRY - UI System */
class GameUI {
    constructor(game) {
        this.game = game;
        this.selectedElement = null;
        this.selectedSubscript = 1;
        this.currentFormula = {};
        this.selectedCompound = null;
        this.notifications = [];
        this.setupElementPicker();
        this.setupControls();
    }

    setupElementPicker() {
        const picker = document.getElementById('element-picker');
        picker.innerHTML = '';
        for (const sym of ELEMENT_ORDER) {
            const el = ELEMENTS[sym];
            const btn = document.createElement('button');
            btn.className = 'el-btn';
            btn.textContent = sym;
            btn.style.borderColor = el.color;
            btn.style.color = el.color;
            btn.addEventListener('click', () => this.selectElement(sym, btn));
            picker.appendChild(btn);
        }

        // Elements list in mole panel
        const list = document.getElementById('elements-list');
        list.innerHTML = '';
        for (const sym of ELEMENT_ORDER) {
            const el = ELEMENTS[sym];
            const entry = document.createElement('div');
            entry.className = 'element-entry';
            entry.innerHTML = `<span class="element-dot" style="background:${el.color}">${sym}</span> ${el.name}`;
            list.appendChild(entry);
        }
    }

    setupControls() {
        // Subscript buttons
        const subBtns = document.querySelectorAll('.sub-btn');
        subBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const val = parseInt(btn.textContent.replace('+', ''));
                this.selectedSubscript = val;
                subBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Add element button
        document.getElementById('btn-add-element').addEventListener('click', () => this.addElementToFormula());

        // Create compound button
        document.getElementById('btn-create-compound').addEventListener('click', () => this.createCompound());

        // Clear formula
        document.getElementById('btn-clear-formula').addEventListener('click', () => this.clearFormula());

        // Sliders
        document.getElementById('temp-slider').addEventListener('input', (e) => {
            this.game.temperature = parseInt(e.target.value);
            document.getElementById('temp-value').textContent = this.game.temperature + ' K';
            this.updateTempOverlay();
        });

        document.getElementById('pressure-slider').addEventListener('input', (e) => {
            this.game.pressure = parseInt(e.target.value);
            document.getElementById('pressure-value').textContent = this.game.pressure + ' ATM';
        });
    }

    selectElement(sym, btn) {
        document.querySelectorAll('.el-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedElement = sym;
    }

    addElementToFormula() {
        if (!this.selectedElement) {
            this.notify('Select an element first!');
            return;
        }
        const elCount = Object.keys(this.currentFormula).length;
        if (!(this.selectedElement in this.currentFormula) && elCount >= 3) {
            this.notify('Max 3 different elements per compound!');
            return;
        }
        if (this.currentFormula[this.selectedElement]) {
            const newVal = this.currentFormula[this.selectedElement] + this.selectedSubscript;
            if (newVal > 4) {
                this.notify('Max subscript is 4!');
                return;
            }
            this.currentFormula[this.selectedElement] = newVal;
        } else {
            if (this.selectedSubscript > 4) {
                this.notify('Max subscript is 4!');
                return;
            }
            this.currentFormula[this.selectedElement] = this.selectedSubscript;
        }
        this.updateFormulaPreview();
    }

    clearFormula() {
        this.currentFormula = {};
        this.updateFormulaPreview();
    }

    updateFormulaPreview() {
        const preview = document.getElementById('formula-preview');
        const costEl = document.getElementById('mole-cost-preview');
        const selEls = document.getElementById('selected-elements');

        if (Object.keys(this.currentFormula).length === 0) {
            preview.innerHTML = '<span style="color:#666">Select elements...</span>';
            costEl.textContent = 'Cost: 0 moles';
            selEls.innerHTML = '';
            return;
        }

        const display = formulaToDisplay(this.currentFormula);
        const cost = getMoleCost(this.currentFormula);
        preview.innerHTML = display;
        costEl.textContent = `Cost: ${cost} moles`;

        selEls.innerHTML = '';
        for (const el in this.currentFormula) {
            const tag = document.createElement('span');
            tag.className = 'selected-el';
            const subMap = {1:'₁',2:'₂',3:'₃',4:'₄'};
            tag.innerHTML = `${el}${this.currentFormula[el] > 1 ? subMap[this.currentFormula[el]] : ''} <span class="remove-el" data-el="${el}">x</span>`;
            tag.querySelector('.remove-el').addEventListener('click', () => {
                delete this.currentFormula[el];
                this.updateFormulaPreview();
            });
            selEls.appendChild(tag);
        }
    }

    createCompound() {
        const validation = validateFormula(this.currentFormula);
        if (!validation.valid) {
            this.notify(validation.reason);
            return;
        }

        const cost = getMoleCost(this.currentFormula);
        if (cost > this.game.moles) {
            this.notify('Not enough moles!');
            return;
        }

        const key = formulaToKey(this.currentFormula);
        const compound = getCompoundData(key);

        // Check if it's a valid known compound or single element
        if (!compound) {
            // Allow single elements
            if (Object.keys(this.currentFormula).length === 1) {
                const el = Object.keys(this.currentFormula)[0];
                const sub = this.currentFormula[el];
                const singleKey = el + (sub > 1 ? sub : '');
                if (getCompoundData(singleKey)) {
                    this.game.moles -= cost;
                    this.game.addToInventory(singleKey);
                    this.clearFormula();
                    this.updateMoles();
                    this.updateInventory();
                    this.notify(`Created ${COMPOUNDS[singleKey].formula}!`);
                    return;
                }
            }
            this.notify('Unknown compound! Try a valid formula.');
            return;
        }

        this.game.moles -= cost;
        this.game.addToInventory(key);
        this.clearFormula();
        this.updateMoles();
        this.updateInventory();
        this.notify(`Created ${compound.formula}!`);
    }

    updateMoles() {
        document.getElementById('moles-count').textContent = `${Math.floor(this.game.moles)}/${this.game.maxMoles}`;
    }

    updateHouseHP() {
        const hp = Math.floor(this.game.house.hp);
        const max = this.game.house.maxHp;
        document.getElementById('house-hp-text').textContent = `${hp}/${max}`;
        const pct = (hp / max) * 100;
        const bar = document.getElementById('hp-bar-inner');
        bar.style.width = pct + '%';
        if (pct > 60) bar.style.background = 'linear-gradient(to right, #44aa44, #66ff66)';
        else if (pct > 30) bar.style.background = 'linear-gradient(to right, #aaaa44, #ffff44)';
        else bar.style.background = 'linear-gradient(to right, #aa4444, #ff4444)';
    }

    updateScore() {
        document.getElementById('score-value').textContent = Math.floor(this.game.score);
    }

    updateWaveInfo() {
        const wm = this.game.waveManager;
        document.getElementById('level-title').textContent = `LEVEL ${wm.currentWave + 1}: ${wm.getWaveName()}`;
        document.getElementById('round-info').textContent = `Round ${wm.currentWave + 1}: ${wm.getFormattedTime()}`;
    }

    updateMapEffects() {
        const temp = this.game.temperature;
        const pressure = this.game.pressure;
        const effects = [];
        if (temp <= 200) effects.push('Water freezes < 200K');
        if (temp >= 400) effects.push('High heat: fire reactions boosted');
        if (pressure >= 15) effects.push('High pressure: explosions stronger');
        if (pressure <= 3) effects.push('Low pressure: gases spread wide');
        document.getElementById('map-effects-bar').textContent =
            effects.length ? 'CURRENT MAP EFF: ' + effects.join('; ') : '';
    }

    updateTempOverlay() {
        const temp = this.game.temperature;
        const overlay = document.getElementById('temp-overlay');
        if (temp <= 200) {
            const intensity = (200 - temp) / 200;
            overlay.style.background = `rgba(100,150,255,${intensity * 0.15})`;
        } else if (temp >= 400) {
            const intensity = (temp - 400) / 100;
            overlay.style.background = `rgba(255,100,30,${intensity * 0.12})`;
        } else {
            overlay.style.background = 'transparent';
        }
    }

    updateInventory() {
        const bar = document.getElementById('inventory-bar');
        bar.innerHTML = '';
        for (const key of this.game.inventory) {
            const data = COMPOUNDS[key];
            if (!data) continue;
            const item = document.createElement('div');
            item.className = 'inv-item' + (this.selectedCompound === key ? ' active' : '');
            item.innerHTML = `<div class="inv-formula" style="color:${data.color}">${data.formula}</div><div class="inv-name">${data.name}</div>`;
            item.addEventListener('click', () => {
                this.selectedCompound = (this.selectedCompound === key) ? null : key;
                this.updateInventory();
            });
            bar.appendChild(item);
        }
    }

    showWaveAnnouncement(text) {
        const el = document.getElementById('wave-announce');
        el.querySelector('.wave-text').textContent = text;
        el.classList.remove('hidden');
        setTimeout(() => el.classList.add('hidden'), 2500);
    }

    showGameOver(won) {
        const overlay = document.getElementById('game-over');
        overlay.classList.remove('hidden');
        const title = document.getElementById('game-result-title');
        title.textContent = won ? 'VICTORY!' : 'DEFEATED';
        title.className = won ? 'win' : 'lose';

        const stats = document.getElementById('game-result-stats');
        stats.innerHTML = `
            <div>Score: ${Math.floor(this.game.score)}</div>
            <div>Waves Survived: ${this.game.waveManager.currentWave + (won ? 1 : 0)}/10</div>
            <div>Time: ${this.game.waveManager.getFormattedTime()}</div>
            <div>House HP: ${Math.floor(this.game.house.hp)}/${this.game.house.maxHp}</div>
            <div>Moles Spent: ${this.game.maxMoles - Math.floor(this.game.moles) + this.game.molesEarned}</div>
        `;
    }

    notify(msg) {
        this.notifications.push({ msg, timer: 3 });
    }

    drawNotifications(ctx, canvasW, canvasH) {
        for (let i = this.notifications.length - 1; i >= 0; i--) {
            const n = this.notifications[i];
            const y = canvasH - 140 - i * 30;
            ctx.save();
            ctx.fillStyle = `rgba(0,0,0,0.7)`;
            ctx.fillRect(canvasW / 2 - 150, y - 10, 300, 24);
            ctx.fillStyle = '#ffcc00';
            ctx.font = '12px "Share Tech Mono"';
            ctx.textAlign = 'center';
            ctx.fillText(n.msg, canvasW / 2, y + 4);
            ctx.restore();
        }
    }

    updateNotifications(dt) {
        for (let i = this.notifications.length - 1; i >= 0; i--) {
            this.notifications[i].timer -= dt;
            if (this.notifications[i].timer <= 0) {
                this.notifications.splice(i, 1);
            }
        }
    }
}
