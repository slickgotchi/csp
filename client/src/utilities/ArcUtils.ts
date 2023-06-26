
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
        },
        fromVector2: (vec: iVector2, inDegrees: boolean = true) => {
            const rad =  Math.atan2(vec.y, vec.x);
            let deg = 180 * rad / Math.PI;
            deg = (360 + Math.round(deg))%360;
            return inDegrees ? deg : rad;
        },
        degToRad: (deg: number) => {
            return deg * Math.PI / 180;
        },
        radToDeg: (rad: number) => {
            return rad * 180 / Math.PI;
        }
    },
    Scalar: {
        lerp: (a: number, b: number, alpha: number) => {
            return a + alpha * (b - a);
        }
    },
    Draw: {
        makeFadeCircle: (scene: Phaser.Scene, pos: {x:number,y:number}, radius: number, color: number, duration_ms: number = 250) => {
            const circ = scene.add.circle( pos.x, pos.y, radius, color );
            circ.setDepth(-1);
        
            scene.add.tween({
                targets: circ,
                alpha: 0,
                duration: duration_ms,
                ease: "Quad.easeOut",
                onComplete: () => {
                    circ.destroy();
                }
            });

            return circ;
        },
        makeFadePolygon: (scene: Phaser.Scene, points: {x:number,y:number}[], color: number, duration_ms: number = 250) => {
            const poly = scene.add.polygon(0, 0, points, color);
            poly.setOrigin(0,0);
            
            scene.add.tween({
                targets: poly,
                alpha: 0,
                duration: duration_ms,
                ease: "Quad.easeOut",
                onComplete: () => {
                    poly.destroy();
                }
            });

            return poly;
        }
    },
    Shape: {
        /**
         * Creates an array of {x,y} points that form a circle sector. Clockwise winding
         * @param start origin point of sector
         * @param dir target direction of sector
         * @param spreadDegrees total spread of sector in degrees
         * @param radius radius of sector
         */
        createSectorPoints: (start: {x:number,y:number}, dir: {x:number,y:number}, spreadDegrees: number, radius: number, detail: number = 10) => {
            const pointsArr = [];
            const r = radius;
            const a = ArcUtils.Angle.degToRad(spreadDegrees);
            const delta = a / detail;
        
            pointsArr.push([0,0]);
        
            for (let i = 0; i < detail+1; i++) {
                pointsArr.push([
                    r*Math.sin(a/2-i*delta), 
                    r*Math.cos(a/2-i*delta)
                ])
            }
        
            const points: any[] = [];
            const theta = ArcUtils.Angle.fromVector2(dir, false) - Math.PI/2;
            pointsArr.forEach(pnt => {
                const x0 = pnt[0];
                const y0 = pnt[1];
                const x1 = x0*Math.cos(theta) - y0*Math.sin(theta);
                const y1 = y0*Math.cos(theta) + x0*Math.sin(theta);
                points.push({
                    x: x1 + start.x,
                    y: y1 + start.y
                });
            });

            return points;
        }
    }
}