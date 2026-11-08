export function computeFitDistance(bounds, fov, aspect) {
    const { width, height, depth } = bounds;
    const fovInRadians = (fov * Math.PI) / 180;
    const halfFov = fovInRadians / 2;

    const distanceForHeight = height / (2 * Math.tan(halfFov));
    const distanceForWidth = width / (2 * Math.tan(halfFov) * aspect);

    let distance = Math.max(distanceForHeight, distanceForWidth);
    distance += (depth / 2);
    
    return distance; 
}