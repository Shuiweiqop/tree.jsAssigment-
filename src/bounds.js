export function getBounds(targets, tileWidth = 170, tileHeight = 250) {
    if (!targets || targets.length === 0) {
        return { width: 0, height: 0, depth: 0 };
    }

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    for (const target of targets) {
        const pos = target.position;
        if (pos.x < minX) minX = pos.x;
        if (pos.x > maxX) maxX = pos.x;
        if (pos.y < minY) minY = pos.y;
        if (pos.y > maxY) maxY = pos.y;
        if (pos.z < minZ) minZ = pos.z;
        if (pos.z > maxZ) maxZ = pos.z;
    }

    const width = (maxX - minX) + tileWidth;
    const height = (maxY - minY) + tileHeight;
    const depth = maxZ - minZ; 

    return { width, height, depth };
}