// src/layouts.js

export function computeLayoutPosition(layout, index, total) {
    let x = 0, y = 0, z = 0;
    let faceOutward = false;

    switch (layout) {
        case 'table': {
            const columns = 20;
            const col = index % columns;
            const row = Math.floor(index / columns);

            x = (col * 190) - 1805;
            y = -(row * 270) + 1215;
            z = 0;
            faceOutward = false;
            break;
        }

        case 'sphere': {
            const radius = 1200;
            const phi = Math.acos(-1 + (2 * index) / total);
            const theta = Math.sqrt(total * Math.PI) * phi;

            x = radius * Math.cos(theta) * Math.sin(phi);
            y = radius * Math.sin(theta) * Math.sin(phi);
            z = radius * Math.cos(phi);
            faceOutward = true;
            break;
        }

        case 'helix': {
            const TILE_WIDTH = 170;
            const TILE_HEIGHT = 250;
            const radius = 1100;
            const arcGap = 20;

            // 1. tiles on one strand should almost touch along the arc
            const angleStep = (TILE_WIDTH + arcGap) / radius;
            const stepsPerTurn = (2 * Math.PI) / angleStep;

            // 2. the other strand passes through the middle of two turns,
            //    so one half-pitch must hold a tile plus a gap:
            //    pitch >= 2 * (TILE_HEIGHT + arcGap)
            const pitch = 2 * (TILE_HEIGHT + arcGap); // Which is 2 * (250 + 20) = 540
            const risePerStep = pitch / stepsPerTurn;

            const strand = index % 2;
            const pairIndex = Math.floor(index / 2);
            const totalPairs = Math.ceil(total / 2);
            const theta = pairIndex * angleStep + strand * Math.PI;

            x = radius * Math.sin(theta);
            y = -(pairIndex * risePerStep) + ((totalPairs - 1) * risePerStep) / 2;
            z = radius * Math.cos(theta);
            faceOutward = true;
            break;
        }

        case 'grid': {
            // 5 x 4 x 10 grid (20 per layer, 10 layers total = 200 items)
            const cols = 5;
            const rows = 4;
            const perLayer = cols * rows; // 20

            const col = index % cols;
            const row = Math.floor((index % perLayer) / cols);
            const layer = Math.floor(index / perLayer);

            x = (col - 2) * 350;
            y = (1.5 - row) * 350;
            z = (layer - 4.5) * 260;
            faceOutward = false;
            break;
        }
        
        default: {
            throw new Error(`Unknown layout: ${layout}`);
        }
    }

    return { x, y, z, faceOutward };
}