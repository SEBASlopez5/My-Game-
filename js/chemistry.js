/* DEADMISTRY - Chemistry System */
const ELEMENTS = {
    H:  { symbol: 'H',  name: 'Hydrogen', color: '#ffffff', atomicNum: 1 },
    O:  { symbol: 'O',  name: 'Oxygen',   color: '#ff4444', atomicNum: 8 },
    N:  { symbol: 'N',  name: 'Nitrogen', color: '#4488ff', atomicNum: 7 },
    C:  { symbol: 'C',  name: 'Carbon',   color: '#888888', atomicNum: 6 },
    Na: { symbol: 'Na', name: 'Sodium',   color: '#ffaa00', atomicNum: 11 },
    Cl: { symbol: 'Cl', name: 'Chlorine', color: '#44ff44', atomicNum: 17 },
    Fe: { symbol: 'Fe', name: 'Iron',     color: '#cc6633', atomicNum: 26 },
    S:  { symbol: 'S',  name: 'Sulfur',   color: '#ffff44', atomicNum: 16 }
};

const ELEMENT_ORDER = ['H','O','N','C','Na','Cl','Fe','S'];

const COMPOUNDS = {
    'H2O': {
        formula: 'H₂O', name: 'Water', elements: {H:2,O:1}, moleCost: 3,
        color: '#4488ff', glowColor: 'rgba(68,136,255,0.4)',
        type: 'liquid', desc: 'Slows zombies. Freezes at low temp. Defense layer on house.',
        effectOnZombie: 'Slows movement by 40%. Frozen at <200K.',
        effectOnHouse: 'Creates water/ice layer. -1 HP/s due to moisture.',
        bestTemp: '0-200K (freeze), 201-399K (wet slow)',
        bestPressure: '1-8 ATM (coating), 8-20 ATM (dense ice)',
        bestUse: 'Early control, freezing lanes, house coating.',
        weakness: 'Cold zombies, fire pressure.',
        dmgToZombie: 0, slowFactor: 0.6, areaRadius: 80,
        houseDmg: -1, houseHeal: 0,
        tempBehavior: { freezeBelow: 200, evapAbove: 450 },
        risks: 'Slightly damages house over time. Empowers ice zombies at low temp.'
    },
    'H2': {
        formula: 'H₂', name: 'Hydrogen Gas', elements: {H:2}, moleCost: 2,
        color: '#eeeeff', glowColor: 'rgba(200,200,255,0.3)',
        type: 'gas', desc: 'Extremely flammable. Explodes when ignited.',
        effectOnZombie: 'Explosion deals heavy area damage.',
        effectOnHouse: 'Dangerous - can damage house if detonated nearby.',
        bestTemp: '400-500K', bestPressure: '10-20 ATM',
        bestUse: 'Explosive fuel gas for clustered zombies.',
        weakness: 'Unstable and dangerous if misused.',
        dmgToZombie: 80, slowFactor: 1, areaRadius: 100,
        houseDmg: 0, houseHeal: 0, explosive: true,
        risks: 'Can chain-react with oxygen. Dangerous near house.'
    },
    'O2': {
        formula: 'O₂', name: 'Oxygen', elements: {O:2}, moleCost: 2,
        color: '#aaddff', glowColor: 'rgba(170,220,255,0.3)',
        type: 'gas', desc: 'Supports combustion. Makes fire reactions stronger.',
        effectOnZombie: 'Boosts nearby fire/explosion damage by 50%.',
        effectOnHouse: 'No direct effect.',
        bestTemp: '400-500K', bestPressure: '8-20 ATM',
        bestUse: 'Combustion booster for fuel gases.',
        weakness: 'Makes battlefield more dangerous.',
        dmgToZombie: 0, slowFactor: 1, areaRadius: 90,
        houseDmg: 0, houseHeal: 0, combustionBoost: 1.5,
        risks: 'Feeds fire zombies if temperature is high.'
    },
    'N2': {
        formula: 'N₂', name: 'Nitrogen', elements: {N:2}, moleCost: 2,
        color: '#6677aa', glowColor: 'rgba(100,120,170,0.2)',
        type: 'gas', desc: 'Mostly inert. Neutral filler gas.',
        effectOnZombie: 'Minimal direct effect. Dilutes other gases.',
        effectOnHouse: 'No effect.',
        bestTemp: '201-399K', bestPressure: '1-8 ATM',
        bestUse: 'Stabilizer or low-threat atmospheric layer.',
        weakness: 'Weak on its own.',
        dmgToZombie: 0, slowFactor: 1, areaRadius: 70,
        houseDmg: 0, houseHeal: 0,
        risks: 'None. Very safe but not very useful alone.'
    },
    'CH4': {
        formula: 'CH₄', name: 'Methane', elements: {C:1,H:4}, moleCost: 5,
        color: '#88ff88', glowColor: 'rgba(136,255,136,0.4)',
        type: 'gas', desc: 'Highly flammable. Strong explosion potential.',
        effectOnZombie: 'Explosion deals massive area damage.',
        effectOnHouse: 'Dangerous near house.',
        bestTemp: '250-500K', bestPressure: '10-20 ATM',
        bestUse: 'Early/mid-game explosion weapon at chokepoints.',
        weakness: 'Cold zones and poor ignition.',
        dmgToZombie: 100, slowFactor: 1, areaRadius: 120,
        houseDmg: 0, houseHeal: 0, explosive: true,
        risks: 'Can damage house if placed too close and ignited.'
    },
    'CO': {
        formula: 'CO', name: 'Carbon Monoxide', elements: {C:1,O:1}, moleCost: 2,
        color: '#aa88aa', glowColor: 'rgba(170,136,170,0.3)',
        type: 'gas', desc: 'Toxic gas. Dangerous over time.',
        effectOnZombie: 'Deals 8 DPS poison damage.',
        effectOnHouse: 'No direct effect.',
        bestTemp: '201-399K', bestPressure: '1-6 ATM',
        bestUse: 'Toxic DPS in narrow corridors.',
        weakness: 'Open areas dilute it.',
        dmgToZombie: 8, slowFactor: 1, areaRadius: 70, poisonDPS: 8,
        houseDmg: 0, houseHeal: 0,
        risks: 'Ineffective in wide open areas.'
    },
    'CO2': {
        formula: 'CO₂', name: 'Carbon Dioxide', elements: {C:1,O:2}, moleCost: 3,
        color: '#99aacc', glowColor: 'rgba(150,170,200,0.3)',
        type: 'gas', desc: 'Suppresses fire. Area control.',
        effectOnZombie: 'Slight slow. Counters fire zones.',
        effectOnHouse: 'Can extinguish fire damage.',
        bestTemp: '201-399K', bestPressure: '1-8 ATM',
        bestUse: 'Fire suppression and area control.',
        weakness: 'Not a direct damage chemical.',
        dmgToZombie: 2, slowFactor: 0.9, areaRadius: 80,
        houseDmg: 0, houseHeal: 0, fireSuppress: true,
        risks: 'Low offensive value.'
    },
    'NH3': {
        formula: 'NH₃', name: 'Ammonia', elements: {N:1,H:3}, moleCost: 4,
        color: '#44ffaa', glowColor: 'rgba(68,255,170,0.4)',
        type: 'gas', desc: 'Toxic gas. Area denial and poison control.',
        effectOnZombie: 'Deals 12 DPS poison + slight slow.',
        effectOnHouse: 'Corrosive over time if applied.',
        bestTemp: '201-399K', bestPressure: '1-6 ATM spread, 6-10 ATM tight',
        bestUse: 'Toxic cloud for swarms and lane denial.',
        weakness: 'Less effective against massive enemies.',
        dmgToZombie: 12, slowFactor: 0.85, areaRadius: 85, poisonDPS: 12,
        houseDmg: -0.5, houseHeal: 0,
        risks: 'Can corrode house slightly.'
    },
    'HCl': {
        formula: 'HCl', name: 'Hydrochloric Acid', elements: {H:1,Cl:1}, moleCost: 2,
        color: '#44ff44', glowColor: 'rgba(68,255,68,0.5)',
        type: 'acid', desc: 'Strong against armored zombies.',
        effectOnZombie: 'Deals 20 DPS. +50% vs armored.',
        effectOnHouse: 'Corrosive. -2 HP/s.',
        bestTemp: '201-399K', bestPressure: '6-15 ATM',
        bestUse: 'Anti-armor acid at chokepoints.',
        weakness: 'Damages house. Weaker vs fast enemies.',
        dmgToZombie: 20, slowFactor: 0.8, areaRadius: 60, armorPen: 1.5,
        houseDmg: -2, houseHeal: 0,
        risks: 'Damages house if placed on it.'
    },
    'NaCl': {
        formula: 'NaCl', name: 'Salt', elements: {Na:1,Cl:1}, moleCost: 2,
        color: '#ffffff', glowColor: 'rgba(255,255,255,0.4)',
        type: 'solid', desc: 'Healing crystal layer on house. Shard damage at high pressure.',
        effectOnZombie: 'Minor slow. At >10 ATM, shard damage (15 DPS).',
        effectOnHouse: 'Heals +2 HP/s. Creates protective crystal shell.',
        bestTemp: '201-399K (heal), 0-200K (brittle shell)',
        bestPressure: '1-8 ATM (heal), 10-20 ATM (shard mode)',
        bestUse: 'House defense and healing.',
        weakness: 'Toxic/mutator zombies reduce healing.',
        dmgToZombie: 5, slowFactor: 0.9, areaRadius: 50,
        houseDmg: 0, houseHeal: 2,
        risks: 'Healing reduced by toxic enemies.'
    },
    'Na2O': {
        formula: 'Na₂O', name: 'Sodium Oxide', elements: {Na:2,O:1}, moleCost: 3,
        color: '#ffcc44', glowColor: 'rgba(255,200,68,0.4)',
        type: 'solid', desc: 'Reactive base. Dangerous when exposed to water.',
        effectOnZombie: 'Deals 15 DPS. Reacts with water for explosion.',
        effectOnHouse: 'Risky if water is nearby.',
        bestTemp: '201-500K', bestPressure: '6-15 ATM',
        bestUse: 'Reactive trap near water zones.',
        weakness: 'Can trigger unwanted reactions.',
        dmgToZombie: 15, slowFactor: 1, areaRadius: 70,
        houseDmg: 0, houseHeal: 0, reactsWithWater: true,
        risks: 'Violent reaction with water. Place carefully.'
    },
    'NaOH': {
        formula: 'NaOH', name: 'Sodium Hydroxide', elements: {Na:1,O:1,H:1}, moleCost: 3,
        color: '#aaffee', glowColor: 'rgba(170,255,238,0.3)',
        type: 'base', desc: 'Strong base. Neutralizes acids.',
        effectOnZombie: 'Deals 10 DPS. Burns on contact.',
        effectOnHouse: 'Can neutralize acid damage.',
        bestTemp: '201-399K', bestPressure: '1-8 ATM',
        bestUse: 'Counter acid zones and corrosion.',
        weakness: 'Not a strong direct damage tool.',
        dmgToZombie: 10, slowFactor: 0.95, areaRadius: 60,
        houseDmg: 0, houseHeal: 0, acidNeutralizer: true,
        risks: 'Caustic. Handle with care.'
    },
    'SO2': {
        formula: 'SO₂', name: 'Sulfur Dioxide', elements: {S:1,O:2}, moleCost: 3,
        color: '#cccc44', glowColor: 'rgba(200,200,68,0.4)',
        type: 'gas', desc: 'Toxic gas cloud. Area denial.',
        effectOnZombie: 'Deals 10 DPS poison + slow.',
        effectOnHouse: 'Corrosive. -1 HP/s.',
        bestTemp: '0-200K (linger), 201-399K (balanced)',
        bestPressure: '1-6 ATM',
        bestUse: 'Toxic cloud for area denial.',
        weakness: 'Diluted in open areas.',
        dmgToZombie: 10, slowFactor: 0.8, areaRadius: 80, poisonDPS: 10,
        houseDmg: -1, houseHeal: 0,
        risks: 'Corrodes house slowly.'
    },
    'SO3': {
        formula: 'SO₃', name: 'Sulfur Trioxide', elements: {S:1,O:3}, moleCost: 4,
        color: '#dddd66', glowColor: 'rgba(220,220,100,0.4)',
        type: 'gas', desc: 'Acid precursor. Reacts with water for stronger acid.',
        effectOnZombie: 'Deals 18 DPS. Creates acid puddle with water.',
        effectOnHouse: 'Corrosive. -2 HP/s.',
        bestTemp: '201-399K', bestPressure: '6-15 ATM',
        bestUse: 'Combine with water for H₂SO₄ effect.',
        weakness: 'Risky near house.',
        dmgToZombie: 18, slowFactor: 0.85, areaRadius: 70,
        houseDmg: -2, houseHeal: 0,
        risks: 'Creates dangerous acid zones with water.'
    },
    'H2SO4': {
        formula: 'H₂SO₄', name: 'Sulfuric Acid', elements: {H:2,S:1,O:4}, moleCost: 7,
        color: '#aaff00', glowColor: 'rgba(170,255,0,0.5)',
        type: 'acid', desc: 'Very strong acid. Best anti-armor weapon.',
        effectOnZombie: 'Deals 35 DPS. +80% vs armored/massive.',
        effectOnHouse: 'Very corrosive. -4 HP/s.',
        bestTemp: '201-399K', bestPressure: '8-20 ATM',
        bestUse: 'Strongest acid for armored/massive zombies.',
        weakness: 'Expensive and dangerous to own defenses.',
        dmgToZombie: 35, slowFactor: 0.7, areaRadius: 70, armorPen: 1.8,
        houseDmg: -4, houseHeal: 0,
        risks: 'Highly corrosive to house. Expensive.'
    },
    'Fe2O3': {
        formula: 'Fe₂O₃', name: 'Iron Oxide (Rust)', elements: {Fe:2,O:3}, moleCost: 5,
        color: '#cc6633', glowColor: 'rgba(200,100,50,0.4)',
        type: 'solid', desc: 'Weakens armor. Slows heavy zombies.',
        effectOnZombie: 'Removes 30% armor. Slows massive zombies.',
        effectOnHouse: 'No direct effect.',
        bestTemp: '400-500K (fire armor zones), 201-399K',
        bestPressure: '1-8 ATM',
        bestUse: 'Armor weakening support.',
        weakness: 'Weak against fast mobs.',
        dmgToZombie: 8, slowFactor: 0.7, areaRadius: 65, armorStrip: 0.3,
        houseDmg: 0, houseHeal: 0,
        risks: 'Not very damaging alone.'
    },
    'H2S': {
        formula: 'H₂S', name: 'Hydrogen Sulfide', elements: {H:2,S:1}, moleCost: 3,
        color: '#99cc44', glowColor: 'rgba(150,200,68,0.4)',
        type: 'gas', desc: 'Toxic and flammable. Dangerous gas.',
        effectOnZombie: 'Deals 15 DPS poison. Can ignite for explosion.',
        effectOnHouse: 'Corrosive. -1 HP/s.',
        bestTemp: '201-399K', bestPressure: '6-15 ATM',
        bestUse: 'Toxic flammable ambush in kill corridors.',
        weakness: 'Unstable and risky.',
        dmgToZombie: 15, slowFactor: 0.9, areaRadius: 75, poisonDPS: 15,
        houseDmg: -1, houseHeal: 0, explosive: true,
        risks: 'Can ignite unexpectedly.'
    },
    'NO2': {
        formula: 'NO₂', name: 'Nitrogen Dioxide', elements: {N:1,O:2}, moleCost: 3,
        color: '#ff8844', glowColor: 'rgba(255,136,68,0.4)',
        type: 'gas', desc: 'Corrosive and toxic gas zone.',
        effectOnZombie: 'Deals 14 DPS + corrodes armor.',
        effectOnHouse: 'Corrosive. -1.5 HP/s.',
        bestTemp: '201-399K', bestPressure: '1-6 ATM',
        bestUse: 'Corrosive toxic zone for enemy lanes.',
        weakness: 'Diluted by open space.',
        dmgToZombie: 14, slowFactor: 0.85, areaRadius: 75, armorPen: 1.3,
        houseDmg: -1.5, houseHeal: 0, poisonDPS: 14,
        risks: 'Corrodes nearby structures.'
    },
    'HNO3': {
        formula: 'HNO₃', name: 'Nitric Acid', elements: {H:1,N:1,O:3}, moleCost: 5,
        color: '#ff6644', glowColor: 'rgba(255,100,68,0.5)',
        type: 'acid', desc: 'Corrosive acid with explosive interactions.',
        effectOnZombie: 'Deals 25 DPS. +60% vs armored.',
        effectOnHouse: 'Very corrosive. -3 HP/s.',
        bestTemp: '201-399K', bestPressure: '6-15 ATM',
        bestUse: 'Advanced corrosive for late-game armored lanes.',
        weakness: 'Expensive and dangerous.',
        dmgToZombie: 25, slowFactor: 0.8, areaRadius: 65, armorPen: 1.6,
        houseDmg: -3, houseHeal: 0,
        risks: 'Expensive. Damages house.'
    },
    'NaNO3': {
        formula: 'NaNO₃', name: 'Sodium Nitrate', elements: {Na:1,N:1,O:3}, moleCost: 5,
        color: '#ffaa44', glowColor: 'rgba(255,170,68,0.4)',
        type: 'solid', desc: 'Reactive under heat. Good for chain reactions.',
        effectOnZombie: 'Explosion at high temp deals 60 damage.',
        effectOnHouse: 'Can explode near house at high temp.',
        bestTemp: '400-500K', bestPressure: '10-20 ATM',
        bestUse: 'Explosive chain reaction material.',
        weakness: 'Not strong by itself at low temp.',
        dmgToZombie: 60, slowFactor: 1, areaRadius: 90,
        houseDmg: 0, houseHeal: 0, explosive: true,
        risks: 'Can chain-react dangerously.'
    },
    'C2H4': {
        formula: 'C₂H₄', name: 'Ethylene', elements: {C:2,H:4}, moleCost: 6,
        color: '#88ffcc', glowColor: 'rgba(136,255,200,0.4)',
        type: 'gas', desc: 'Highly flammable gas chain reaction component.',
        effectOnZombie: 'Explosion deals 90 damage in large area.',
        effectOnHouse: 'Dangerous near house.',
        bestTemp: '250-500K', bestPressure: '8-20 ATM',
        bestUse: 'Gas chain reaction with fire/O₂.',
        weakness: 'Poor in cold control zones.',
        dmgToZombie: 90, slowFactor: 1, areaRadius: 110,
        houseDmg: 0, houseHeal: 0, explosive: true,
        risks: 'Large blast radius can damage own defenses.'
    }
};

function formulaToKey(elements) {
    const sorted = Object.keys(elements).sort((a,b) => {
        const order = ELEMENT_ORDER;
        return order.indexOf(a) - order.indexOf(b);
    });
    let key = '';
    for (const el of sorted) {
        key += el;
        if (elements[el] > 1) key += elements[el];
    }
    return key;
}

function formulaToDisplay(elements) {
    const sorted = Object.keys(elements).sort((a,b) => {
        return ELEMENT_ORDER.indexOf(a) - ELEMENT_ORDER.indexOf(b);
    });
    let display = '';
    const subMap = {'1':'₁','2':'₂','3':'₃','4':'₄'};
    for (const el of sorted) {
        display += el;
        if (elements[el] > 1) display += subMap[elements[el]] || elements[el];
    }
    return display;
}

function getMoleCost(elements) {
    let cost = 0;
    for (const el in elements) cost += elements[el];
    return cost;
}

function validateFormula(elements) {
    const elKeys = Object.keys(elements);
    if (elKeys.length === 0) return { valid: false, reason: 'No elements selected' };
    if (elKeys.length > 3) return { valid: false, reason: 'Max 3 different elements' };
    for (const el of elKeys) {
        if (!(el in ELEMENTS)) return { valid: false, reason: `Unknown element: ${el}` };
        if (elements[el] < 1 || elements[el] > 4) return { valid: false, reason: 'Subscripts must be 1-4' };
    }
    return { valid: true };
}

function getCompoundData(key) {
    return COMPOUNDS[key] || null;
}

function getEffectiveDamage(compound, temp, pressure, zombieType) {
    let dmg = compound.dmgToZombie;
    if (compound.explosive) {
        if (temp >= 400) dmg *= 1.3;
        if (pressure >= 10) dmg *= 1.4;
        if (pressure < 5) dmg *= 0.6;
    }
    if (compound.poisonDPS) {
        if (pressure <= 6) dmg *= 1.2;
    }
    if (compound.armorPen && zombieType === 'armored') {
        dmg *= compound.armorPen;
    }
    if (compound.armorPen && zombieType === 'massive') {
        dmg *= compound.armorPen * 0.8;
    }
    return dmg;
}

function getEffectiveRadius(compound, pressure) {
    let r = compound.areaRadius;
    if (pressure <= 5) r *= 1.4;
    else if (pressure >= 15) r *= 0.7;
    return r;
}
