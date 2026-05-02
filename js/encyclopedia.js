/* DEADMISTRY - Encyclopedia */
function initEncyclopedia() {
    const list = document.getElementById('enc-list');
    const detail = document.getElementById('enc-detail');

    list.innerHTML = '';
    for (const key in COMPOUNDS) {
        const data = COMPOUNDS[key];
        const item = document.createElement('div');
        item.className = 'enc-item';
        item.dataset.key = key;
        item.innerHTML = `<div class="formula" style="color:${data.color}">${data.formula}</div><div class="name">${data.name}</div>`;
        item.addEventListener('click', () => {
            document.querySelectorAll('.enc-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            showCompoundDetail(key);
        });
        list.appendChild(item);
    }
}

function showCompoundDetail(key) {
    const data = COMPOUNDS[key];
    const detail = document.getElementById('enc-detail');
    if (!data) {
        detail.innerHTML = '<p class="enc-placeholder">Compound not found</p>';
        return;
    }

    const cost = getMoleCost(data.elements);
    const elemList = Object.entries(data.elements).map(([el, count]) =>
        `<span style="color:${ELEMENTS[el].color}">${el}</span> x${count}`
    ).join(', ');

    detail.innerHTML = `
        <h3 style="color:${data.color}">${data.formula}</h3>
        <p style="color:#aaa; margin-bottom:20px; font-size:1.1rem;">${data.name}</p>

        <div class="detail-grid">
            <div class="detail-stat">
                <div class="stat-label">MOLE COST</div>
                <div class="stat-value">${cost} moles</div>
            </div>
            <div class="detail-stat">
                <div class="stat-label">TYPE</div>
                <div class="stat-value">${data.type.toUpperCase()}</div>
            </div>
            <div class="detail-stat">
                <div class="stat-label">ELEMENTS</div>
                <div class="stat-value">${elemList}</div>
            </div>
            <div class="detail-stat">
                <div class="stat-label">AREA RADIUS</div>
                <div class="stat-value">${data.areaRadius}px</div>
            </div>
            <div class="detail-stat">
                <div class="stat-label">DAMAGE TO ZOMBIE</div>
                <div class="stat-value">${data.dmgToZombie} ${data.explosive ? '(explosive)' : data.poisonDPS ? `(+${data.poisonDPS} DPS poison)` : 'DPS'}</div>
            </div>
            <div class="detail-stat">
                <div class="stat-label">SLOW FACTOR</div>
                <div class="stat-value">${data.slowFactor < 1 ? (data.slowFactor * 100) + '% speed' : 'None'}</div>
            </div>
            <div class="detail-stat">
                <div class="stat-label">HOUSE DAMAGE</div>
                <div class="stat-value">${data.houseDmg < 0 ? data.houseDmg + ' HP/s' : 'None'}</div>
            </div>
            <div class="detail-stat">
                <div class="stat-label">HOUSE HEAL</div>
                <div class="stat-value">${data.houseHeal > 0 ? '+' + data.houseHeal + ' HP/s' : 'None'}</div>
            </div>
        </div>

        <div class="detail-section" style="margin-top:24px">
            <h4>DESCRIPTION</h4>
            <p>${data.desc}</p>
        </div>
        <div class="detail-section">
            <h4>EFFECT ON ZOMBIES</h4>
            <p>${data.effectOnZombie}</p>
        </div>
        <div class="detail-section">
            <h4>EFFECT ON HOUSE</h4>
            <p>${data.effectOnHouse}</p>
        </div>
        <div class="detail-section">
            <h4>BEST TEMPERATURE</h4>
            <p>${data.bestTemp}</p>
        </div>
        <div class="detail-section">
            <h4>BEST PRESSURE</h4>
            <p>${data.bestPressure}</p>
        </div>
        <div class="detail-section">
            <h4>BEST USE</h4>
            <p>${data.bestUse}</p>
        </div>
        <div class="detail-section">
            <h4>WEAKNESS</h4>
            <p>${data.weakness}</p>
        </div>
        <div class="detail-section">
            <h4>RISKS</h4>
            <p>${data.risks}</p>
        </div>
        ${data.armorPen ? `<div class="detail-section"><h4>ARMOR PENETRATION</h4><p>${data.armorPen}x damage vs armored</p></div>` : ''}
        ${data.explosive ? `<div class="detail-section"><h4>EXPLOSIVE</h4><p>Detonates at high temp (400K+) or near fire/O₂ sources</p></div>` : ''}
        ${data.fireSuppress ? `<div class="detail-section"><h4>FIRE SUPPRESSION</h4><p>Extinguishes fire effects in the area</p></div>` : ''}
        ${data.acidNeutralizer ? `<div class="detail-section"><h4>ACID NEUTRALIZER</h4><p>Neutralizes acid effects in the area</p></div>` : ''}
    `;
}
