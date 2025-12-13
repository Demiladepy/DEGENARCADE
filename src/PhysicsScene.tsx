import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, GAME_POOL_ID } from './constants';
import confetti from 'canvas-confetti';
import { Flex, Text } from '@radix-ui/themes';

const PhysicsScene = () => {
    const sceneRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<Matter.Engine | null>(null);
    const elementsRef = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const bodiesRef = useRef<{ [key: string]: Matter.Body | null }>({});

    // State for betting
    const [status, setStatus] = useState<string>("READY TO PLAY");

    const account = useCurrentAccount();
    const { mutate: signAndExecute } = useSignAndExecuteTransaction();

    const handlePlay = (choice: boolean) => {
        if (!account) return alert("Connect Wallet first!");

        setStatus("PREPARING TRANSACTION...");
        const tx = new Transaction();
        const [coin] = tx.splitCoins(tx.gas, [1000000000]);

        tx.moveCall({
            target: `${PACKAGE_ID}::game::play`,
            arguments: [
                tx.object(GAME_POOL_ID),
                coin,
                tx.pure.bool(choice),
                tx.pure.bool(choice),
                tx.object('0x8')
            ]
        });

        // Feedback: Bounce!
        const body = bodiesRef.current[choice ? 'heads' : 'tails'];
        if (body) Matter.Body.applyForce(body, body.position, { x: 0, y: -0.1 });

        signAndExecute({
            transaction: tx,
        }, {
            onSuccess: (result) => {
                setStatus("WINNER WINNER CHICKEN DINNER!");
                console.log(result);
                triggerWinDisplay();
            },
            onError: (err) => {
                setStatus("TRANSACTION FAILED");
                console.error(err);
            }
        });
    };

    const triggerWinDisplay = () => {
        // Massive particle explosion
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });

        // Explode physics bodies
        const engine = engineRef.current;
        if (!engine) return;
        Matter.Composite.allBodies(engine.world).forEach(body => {
            if (!body.isStatic) {
                const xForce = (Math.random() - 0.5) * 0.2;
                const yForce = (Math.random() - 0.5) * 0.2;
                Matter.Body.applyForce(body, body.position, { x: xForce, y: yForce });
            }
        });
    };

    useEffect(() => {
        const Engine = Matter.Engine,
            World = Matter.World,
            Bodies = Matter.Bodies,
            Mouse = Matter.Mouse,
            MouseConstraint = Matter.MouseConstraint,
            Runner = Matter.Runner,
            Events = Matter.Events;

        // Create engine
        const engine = Engine.create();
        const runner = Runner.create();

        // Zero Gravity
        engine.world.gravity.y = 0;
        engine.world.gravity.x = 0;

        const width = window.innerWidth;
        const height = window.innerHeight;

        // Walls (Thicker bounce)
        const wallOptions = { isStatic: true, render: { visible: false }, restitution: 1.0 };
        World.add(engine.world, [
            Bodies.rectangle(width / 2, -200, width, 400, wallOptions),
            Bodies.rectangle(width / 2, height + 200, width, 400, wallOptions),
            Bodies.rectangle(width + 200, height / 2, 400, height, wallOptions),
            Bodies.rectangle(-200, height / 2, 400, height, wallOptions)
        ]);

        // Helpers
        const createBody = (id: string, x: number, y: number, w: number, h: number, isCircle = false) => {
            const options = {
                restitution: 0.8,
                frictionAir: 0.01, // Less friction = more floating
                label: id,
                density: 0.05
            };
            const body = isCircle
                ? Bodies.circle(x, y, w, options)
                : Bodies.rectangle(x, y, w, h, { ...options, chamfer: { radius: 20 } });

            bodiesRef.current[id] = body;
            return body;
        };

        // Bodies
        const heads = createBody('heads', width / 2 - 200, height / 2, 70, 70, true);
        const tails = createBody('tails', width / 2 + 200, height / 2, 70, 70, true);
        const connect = createBody('connect', width / 2, height / 2 - 150, 180, 60);

        World.add(engine.world, [heads, tails, connect]);

        // Mouse
        const mouse = Mouse.create(document.body);
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: { stiffness: 0.1, render: { visible: false } }
        });
        World.add(engine.world, mouseConstraint);

        // Sync
        Events.on(engine, 'afterUpdate', () => {
            Object.keys(bodiesRef.current).forEach(key => {
                const body = bodiesRef.current[key];
                const el = elementsRef.current[key];
                if (body && el) {
                    const { x, y } = body.position;
                    const angle = body.angle;
                    el.style.transform = `translate(${x}px, ${y}px) rotate(${angle}rad)`;
                }
            });
        });

        Runner.run(runner, engine);
        engineRef.current = engine;

        // Initial "Explosion" to scatter them
        setTimeout(() => {
            Matter.Body.applyForce(heads, heads.position, { x: -0.05, y: 0.05 });
            Matter.Body.applyForce(tails, tails.position, { x: 0.05, y: -0.05 });
        }, 1000);

        return () => {
            Runner.stop(runner);
            World.clear(engine.world, false);
            Engine.clear(engine);
        };
    }, []);

    const floatStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        willChange: 'transform',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'grab',
        userSelect: 'none'
    };

    return (
        <div ref={sceneRef} style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>

            {/* Background Elements */}
            <div className="bg-gradient" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, #1a1a2e 0%, #000000 100%)', zIndex: -1 }} />
            <div style={{ position: 'absolute', inset: 0, opacity: 0.2, backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />

            {/* Heads Chip */}
            <div
                ref={el => elementsRef.current['heads'] = el}
                onClick={() => handlePlay(true)}
                className="chip-shadow glow-text"
                style={{
                    ...floatStyle,
                    marginLeft: -70, marginTop: -70, width: 140, height: 140,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 30% 30%, #ffd700, #b8860b)',
                    border: '4px solid #fff5',
                    zIndex: 10
                }}
            >
                <Flex direction="column" align="center" gap="1">
                    <Text size="5" weight="bold" style={{ color: '#fff', fontFamily: 'Orbitron' }}>HEADS</Text>
                    <Text size="1" color="gray">2X PAYOUT</Text>
                </Flex>
            </div>

            {/* Tails Chip */}
            <div
                ref={el => elementsRef.current['tails'] = el}
                onClick={() => handlePlay(false)}
                className="chip-shadow glow-text"
                style={{
                    ...floatStyle,
                    marginLeft: -70, marginTop: -70, width: 140, height: 140,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 30% 30%, #e0e0e0, #757575)',
                    border: '4px solid #fff5',
                    zIndex: 10
                }}
            >
                <Flex direction="column" align="center" gap="1">
                    <Text size="5" weight="bold" style={{ color: '#fff', fontFamily: 'Orbitron' }}>TAILS</Text>
                    <Text size="1" color="gray">2X PAYOUT</Text>
                </Flex>
            </div>

            {/* Connect Button (Capsule) */}
            <div
                ref={el => elementsRef.current['connect'] = el}
                className="chip-shadow"
                style={{
                    ...floatStyle,
                    marginLeft: -90, marginTop: -30, width: 180, height: 60,
                    borderRadius: '30px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    zIndex: 100
                }}
            >
                <ConnectButton />
            </div>

            {/* Status Text (HUD) */}
            <div style={{ position: 'absolute', bottom: 50, left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
                <Text size="4" weight="bold" className="glow-text" style={{ fontFamily: 'Orbitron', letterSpacing: '2px', color: 'var(--neon-blue)' }}>
                    {status}
                </Text>
            </div>

            <div style={{ position: 'absolute', top: 20, left: 20 }}>
                <Text size="6" weight="bold" style={{ fontFamily: 'Orbitron', color: 'white', letterSpacing: '-2px' }}>
                    DEGEN<span style={{ color: 'var(--neon-pink)' }}>ARCADE</span>
                </Text>
            </div>
        </div>
    );
};

export default PhysicsScene;
