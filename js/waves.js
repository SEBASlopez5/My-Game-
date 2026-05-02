/* DEADMISTRY - Wave System */
const WAVE_CONFIG = [
    { // Wave 1
        name: 'BEGINNING',
        zombies: { basic: 8 },
        spawnInterval: 1.5,
        duration: 60
    },
    { // Wave 2
        name: 'SCOUTS',
        zombies: { basic: 10, fast: 3 },
        spawnInterval: 1.2,
        duration: 60
    },
    { // Wave 3
        name: 'GATHERING STORM',
        zombies: { basic: 12, fast: 5, toxic: 2 },
        spawnInterval: 1.0,
        duration: 60
    },
    { // Wave 4
        name: 'ELEMENTS AWAKEN',
        zombies: { basic: 10, fast: 6, fire: 3, ice: 3 },
        spawnInterval: 0.9,
        duration: 60
    },
    { // Wave 5
        name: 'HEAVY FORCE',
        zombies: { basic: 8, fast: 5, fire: 4, armored: 4, massive: 1 },
        spawnInterval: 0.8,
        duration: 60
    },
    { // Wave 6
        name: 'ELECTRIC STORM',
        zombies: { fast: 8, electric: 5, fire: 4, toxic: 3, armored: 3 },
        spawnInterval: 0.7,
        duration: 60
    },
    { // Wave 7
        name: 'ADAPTATION',
        zombies: { basic: 6, mutator: 6, armored: 5, massive: 2, toxic: 4 },
        spawnInterval: 0.7,
        duration: 60
    },
    { // Wave 8
        name: 'HEAVY ASSAULT',
        zombies: { massive: 3, massive_fire: 1, armored: 6, fire: 5, electric: 4 },
        spawnInterval: 0.6,
        duration: 60
    },
    { // Wave 9
        name: 'CHEMICAL WARFARE',
        zombies: { massive: 2, massive_toxic: 1, massive_armored: 1, mutator: 5, toxic: 6, fast: 8 },
        spawnInterval: 0.5,
        duration: 60
    },
    { // Wave 10
        name: 'APOCALYPSE',
        zombies: { basic: 10, fast: 8, fire: 6, ice: 5, toxic: 5, massive: 2, massive_fire: 1, massive_toxic: 1, massive_armored: 1, armored: 5, electric: 5, mutator: 4 },
        spawnInterval: 0.4,
        duration: 60
    }
];

class WaveManager {
    constructor() {
        this.currentWave = 0;
        this.waveTimer = 0;
        this.spawnTimer = 0;
        this.spawnQueue = [];
        this.waveActive = false;
        this.waveComplete = false;
        this.allWavesComplete = false;
        this.waveStartTime = 0;
        this.totalGameTime = 0;
        this.waveClearTimes = [];
        this.announcing = false;
        this.announceTimer = 0;
        this.betweenWaves = true;
        this.betweenWaveTimer = 3;
    }

    startWave(wave) {
        if (wave >= WAVE_CONFIG.length) {
            this.allWavesComplete = true;
            return;
        }
        this.currentWave = wave;
        const config = WAVE_CONFIG[wave];
        this.spawnQueue = [];
        for (const type in config.zombies) {
            for (let i = 0; i < config.zombies[type]; i++) {
                this.spawnQueue.push(type);
            }
        }
        // Shuffle spawn queue
        for (let i = this.spawnQueue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.spawnQueue[i], this.spawnQueue[j]] = [this.spawnQueue[j], this.spawnQueue[i]];
        }
        this.waveTimer = 0;
        this.spawnTimer = 0;
        this.waveActive = true;
        this.waveComplete = false;
        this.waveStartTime = this.totalGameTime;
        this.announcing = true;
        this.announceTimer = 2.5;
    }

    update(dt, zombiesAlive) {
        this.totalGameTime += dt;

        if (this.announcing) {
            this.announceTimer -= dt;
            if (this.announceTimer <= 0) {
                this.announcing = false;
            }
            return null;
        }

        if (this.betweenWaves) {
            this.betweenWaveTimer -= dt;
            if (this.betweenWaveTimer <= 0) {
                this.betweenWaves = false;
                this.startWave(this.currentWave);
            }
            return null;
        }

        if (!this.waveActive) return null;

        this.waveTimer += dt;
        this.spawnTimer += dt;

        const config = WAVE_CONFIG[this.currentWave];
        let spawned = null;

        if (this.spawnQueue.length > 0 && this.spawnTimer >= config.spawnInterval) {
            this.spawnTimer = 0;
            spawned = this.spawnQueue.shift();
        }

        // Check wave completion
        if (this.spawnQueue.length === 0 && zombiesAlive === 0) {
            this.waveComplete = true;
            this.waveActive = false;
            const clearTime = this.totalGameTime - this.waveStartTime;
            this.waveClearTimes.push(clearTime);

            if (this.currentWave >= WAVE_CONFIG.length - 1) {
                this.allWavesComplete = true;
            } else {
                this.currentWave++;
                this.betweenWaves = true;
                this.betweenWaveTimer = 3;
            }
        }

        // Force next wave if timer exceeds duration
        if (this.waveTimer >= config.duration && this.spawnQueue.length === 0) {
            // Don't force if zombies still alive; just wait
        }

        return spawned;
    }

    getWaveName() {
        if (this.currentWave < WAVE_CONFIG.length) {
            return WAVE_CONFIG[this.currentWave].name;
        }
        return 'COMPLETE';
    }

    getFormattedTime() {
        const mins = Math.floor(this.totalGameTime / 60);
        const secs = Math.floor(this.totalGameTime % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}
