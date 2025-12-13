
import { useEffect, useRef, useState, ChangeEvent } from 'react';


import Matter from 'matter-js';
// import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Flex, Text, Button, TextField } from '@radix-ui/themes';
// import { Transaction } from '@mysten/sui/transactions';
// import { PACKAGE_ID } from '../constants'; // Needs PLINKO_POOL_ID eventually

// PLINKO CONSTANTS
const WIDTH = 600;
const HEIGHT = 800;
const PEG_gap = 40;
const ROWS = 16;
const BALL_SIZE = 10;

const PlinkoScene = ({ onBack }: { onBack: () => void }) => {
    const sceneRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<Matter.Engine | null>(null);
    const [betAmount, setBetAmount] = useState('1');
    const [lastMultiplier, setLastMultiplier] = useState<number | null>(null);

    // Physics Init
    useEffect(() => {
        const Engine = Matter.Engine,
            Render = Matter.Render,
            World = Matter.World,
            Bodies = Matter.Bodies,
            Runner = Matter.Runner;

        const engine = Engine.create();
        const runner = Runner.create();

        // Custom Render (optional, or we rely on React to render bodies like before)
        // For Plinko, high particle count means Canvas is better. 
        // Let's us basic React rendering for "Gamey" feel or just standard Matter Render for speed?
        // User requested "Premium UX". Canvas render is smoothest.

        const render = Render.create({
            element: sceneRef.current!,
            engine: engine,
            options: {
                width: WIDTH,
                height: HEIGHT,
                wireframes: false,
                background: 'transparent',
                pixelRatio: window.devicePixelRatio
            }
        });

        // WALLS
        World.add(engine.world, [
            Bodies.rectangle(WIDTH / 2, HEIGHT + 50, WIDTH, 100, { isStatic: true, label: 'ground' }), // Floor
            Bodies.rectangle(-20, HEIGHT / 2, 40, HEIGHT, { isStatic: true }), // Left
            Bodies.rectangle(WIDTH + 20, HEIGHT / 2, 40, HEIGHT, { isStatic: true }), // Right
        ]);

        // PEGS (Pyramid)
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col <= row; col++) {
                const x = WIDTH / 2 - (row * PEG_gap / 2) + (col * PEG_gap);
                const y = 100 + row * PEG_gap;
                const peg = Bodies.circle(x, y, 4, {
                    isStatic: true,
                    render: { fillStyle: '#00f3ff' },
                    label: 'peg'
                });
                World.add(engine.world, peg);
            }
        }

        // BUCKETS (Multipliers)
        const bucketWidth = PEG_gap;
        const startX = WIDTH / 2 - (ROWS * PEG_gap / 2);
        const y = 100 + ROWS * PEG_gap + 20;

        const multipliers = [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110]; // Example distribution

        multipliers.forEach((mult, i) => {
            const x = startX + i * bucketWidth + (bucketWidth / 2); // Align center
            // Visual only, logic handled by collision event
            const bucket = Bodies.rectangle(x, y, bucketWidth - 4, 40, {
                isStatic: true,
                isSensor: true, // Detection only
                label: `bucket-${mult}`,
                render: { fillStyle: colorForMult(mult) }
            });
            World.add(engine.world, bucket);
        });

        // Collision Events
        Matter.Events.on(engine, 'collisionStart', (event) => {
            event.pairs.forEach((pair) => {
                const bodyA = pair.bodyA;
                const bodyB = pair.bodyB;
                // Check if Ball hit Bucket
                if (bodyA.label === 'ball' && bodyB.label.startsWith('bucket')) {
                    const mult = parseFloat(bodyB.label.split('-')[1]);
                    setLastMultiplier(mult);
                    World.remove(engine.world, bodyA); // Remove ball
                } else if (bodyB.label === 'ball' && bodyA.label.startsWith('bucket')) {
                    const mult = parseFloat(bodyA.label.split('-')[1]);
                    setLastMultiplier(mult);
                    World.remove(engine.world, bodyB);
                }
            });
        });

        Runner.run(runner, engine);
        Render.run(render);
        engineRef.current = engine;

        return () => {
            Render.stop(render);
            Runner.stop(runner);
            if (render.canvas) render.canvas.remove();
        };
    }, []);

    const dropBall = () => {
        if (!engineRef.current) return;
        const x = WIDTH / 2 + (Math.random() - 0.5) * 10; // Slight jitter
        const ball = Matter.Bodies.circle(x, 20, BALL_SIZE, {
            restitution: 0.5,
            friction: 0.05,
            label: 'ball',
            render: { fillStyle: '#ff0055' }
        });
        Matter.World.add(engineRef.current.world, ball);
    };

    const colorForMult = (m: number) => {
        if (m > 10) return '#ff0055'; // High risk/reward
        if (m > 2) return '#ffaa00';
        return '#00ff88'; // Safe
    };

    return (
        <Flex direction="column" align="center" style={{ height: '100vh', background: '#09090b', color: 'white', position: 'relative' }}>
            {/* HEADER */}
            <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
                <Button variant="ghost" onClick={onBack}>← Dashboard</Button>
            </div>

            {/* GAME AREA - CANVAS */}
            <div ref={sceneRef} style={{ marginTop: 20, border: '1px solid #333', borderRadius: 12, boxShadow: '0 0 50px #00f3ff20' }} />

            {/* CONTROLS */}
            <Flex gap="4" align="center" style={{ marginTop: 20, zIndex: 10 }}>
                <Flex direction="column">
                    <Text size="2" color="gray">Bet Amount (SUI)</Text>
                    <TextField.Root value={betAmount} onChange={(e: ChangeEvent<HTMLInputElement>) => setBetAmount(e.target.value)} />
                </Flex>
                <Button size="4" color="crimson" onClick={dropBall} style={{ padding: '0 40px', cursor: 'pointer' }}>
                    DROP BALL
                </Button>
            </Flex>

            {/* RESULT */}
            {lastMultiplier && (
                <Text size="8" weight="bold" className="glow-text" style={{ position: 'absolute', top: 300, pointerEvents: 'none' }}>
                    {lastMultiplier}x
                </Text>
            )}
        </Flex>
    );
};

export default PlinkoScene;
