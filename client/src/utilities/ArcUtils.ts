
interface iVector2 {
    x: number,
    y: number
}


export const ArcUtils = {
    Vector2: {
        normalise: (vec: iVector2) => {
            const l = ArcUtils.Vector2.length(vec);
            if (l <= 0.01) {
                return {x: 0, y: 0}
            } else {
                return {
                    x: vec.x / l,
                    y: vec.y / l,
                }
            }
        },
        length: (vec: iVector2) => {
            return Math.sqrt(vec.x**2 + vec.y**2);
        },
        distance: (vecA: iVector2, vecB: iVector2) => {
            return ArcUtils.Vector2.length({
                x: vecA.x - vecB.x,
                y: vecA.y - vecB.y
            });
        },
        dot: (vecA: iVector2, vecB: iVector2) => {
            return vecA.x * vecB.x + vecA.y * vecB.y;
        },
        lerp: (vecA: iVector2, vecB: iVector2, alpha: number) => {
            return {
                x: ArcUtils.Scalar.lerp(vecA.x, vecB.x, alpha),
                y: ArcUtils.Scalar.lerp(vecA.y, vecB.y, alpha)
            }
        },
        random: () => {
            const a = Math.random() * 2 * Math.PI;
            return {
                x: Math.cos(a),
                y: Math.sin(a)
            }
        }
    },
    Angle: {
        shortestDistance: (radA: number, radB: number) => {
            var max = Math.PI * 2;
            var da = (radB - radA) % max;
            return 2 * da % max - da;
        },
        lerp: (radA: number, radB: number, alpha: number) => {
            return radA + ArcUtils.Angle.shortestDistance(radA, radB) * alpha;
        }
    },
    Scalar: {
        lerp: (a: number, b: number, alpha: number) => {
            return a + alpha * (b - a);
        }
    }
}