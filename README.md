# DEADMISTRY

A 2D top-down chemistry survival strategy game built with HTML5 Canvas and JavaScript.

## Overview

Protect your house from 10 waves of increasingly dangerous zombies using chemistry, temperature, pressure, and compound reactions. Create compounds from 8 base elements, layer defenses on your house, set up chemical traps, and master the periodic battlefield.

## How to Play

1. **Open** `index.html` in a modern browser
2. **Create compounds** using the Atom Selector (bottom center) - select elements, set subscripts, and click CREATE
3. **Place compounds** by clicking on the map or directly on the house for defensive layers
4. **Adjust temperature** (0-500K) and **pressure** (1-20 ATM) using the top sliders
5. **Survive** all 10 waves to win

## Features

- **8 Base Elements**: H, O, N, C, Na, Cl, Fe, S
- **20+ Compounds**: Each with unique effects, damage types, and optimal conditions
- **10 Waves**: Progressive difficulty with diverse zombie types
- **12 Zombie Types**: Basic, Fast, Fire, Ice, Toxic, Massive, Armored, Electric, Mutator, and massive variants
- **Temperature System**: 0-500K affects zombie speed, compound behavior, and reactions
- **Pressure System**: 1-20 ATM affects explosion power, gas spread, and compound effectiveness
- **House Defense**: Layer compounds on your house for healing, shields, and protection
- **Visual Overlays**: Ice shells, crystal layers, acid haze, gas clouds all visible on the house
- **Chemical Reactions**: Na₂O + H₂O explosions, SO₃ + H₂O → H₂SO₄, combustion chains
- **Encyclopedia**: Detailed compound info with stats, best uses, and weaknesses
- **Mole Economy**: 100 starting moles, +20 per wave cleared, every atom costs 1 mole
- **Particle Effects**: Explosions, gas clouds, frost, fire, acid, sparks

## Tech Stack

- Pure HTML5/CSS3/JavaScript (no frameworks)
- Canvas 2D rendering
- Runs in any modern browser

## Project Structure

```
index.html          - Main game page
css/style.css       - All styling (menu, HUD, game UI)
js/chemistry.js     - Element/compound data and chemistry engine
js/particles.js     - Particle system for visual effects
js/zombies.js       - Zombie types, AI, and rendering
js/house.js         - House defense and layer system
js/waves.js         - Wave configuration and management
js/ui.js            - UI controls, atom selector, inventory
js/renderer.js      - Canvas rendering engine
js/game.js          - Main game loop and state management
js/encyclopedia.js  - Encyclopedia screen
js/main.js          - Entry point and screen navigation
```
