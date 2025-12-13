import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { Button, Dialog, Flex, Text, TextField } from '@radix-ui/themes';
import { PACKAGE_ID } from './constants';

// For this Hackathon demo, we might hardcode a Market ID via 'Create' just once, 
// or let the user paste one.
// CONSTANTS
const MODULE = "prediction";

const PredictionScene = () => {
    const sceneRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<Matter.Engine | null>(null);
    const bodiesRef = useRef<{ [key: string]: Matter.Body | null }>({});
    const elementsRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

    const [marketId, setMarketId] = useState<string>("");
    const [question, setQuestion] = useState<string>("Who will win? Lakers vs Warriors");
    const [betStatus, setBetStatus] = useState("PLACE YOUR BET");

    const account = useCurrentAccount();
    const { mutate: signAndExecute } = useSignAndExecuteTransaction();

    // PHYSICS SETUP
    useEffect(() => {
        const Engine = Matter.Engine,
            World = Matter.World,
            Bodies = Matter.Bodies,
            Mouse = Matter.Mouse,
            MouseConstraint = Matter.MouseConstraint,
            Runner = Matter.Runner,
            Events = Matter.Events;

        const engine = Engine.create();
        const runner = Runner.create();
        engine.world.gravity.y = 0;

        const width = window.innerWidth;
        const height = window.innerHeight;

        // Walls
        const wallOptions = { isStatic: true, render: { visible: false } };
        World.add(engine.world, [
            Bodies.rectangle(width / 2, -50, width, 100, wallOptions),
            Bodies.rectangle(width / 2, height + 50, width, 100, wallOptions),
            Bodies.rectangle(width + 50, height / 2, 100, height, wallOptions),
            Bodies.rectangle(-50, height / 2, 100, height, wallOptions)
        ]);

        // Market Options (Planets)
        const createOption = (id: string, x: number, y: number) => {
            const body = Bodies.circle(x, y, 90, {
                restitution: 0.8,
                frictionAir: 0.02,
                label: id
            });
            bodiesRef.current[id] = body;
            return body;
        };

        const optA = createOption('YES', width / 2 - 150, height / 2);
        const optB = createOption('NO', width / 2 + 150, height / 2);

        World.add(engine.world, [optA, optB]);

        // Mouse
        const mouse = Mouse.create(document.body);
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: { stiffness: 0.2, render: { visible: false } }
        });
        World.add(engine.world, mouseConstraint);

        // Sync
        Events.on(engine, 'afterUpdate', () => {
            ['YES', 'NO'].forEach(key => {
                const body = bodiesRef.current[key];
                const el = elementsRef.current[key];
                if (body && el) {
                    el.style.transform = `translate(${body.position.x}px, ${body.position.y}px)`; // No rotation for text readability?
                }
            });
        });

        Runner.run(runner, engine);
        engineRef.current = engine;

        return () => {
            Runner.stop(runner);
            World.clear(engine.world, false);
            Engine.clear(engine);
        };
    }, []);

    const handleBet = (isOptionA: boolean) => {
        if (!marketId) {
            // For demo, if no market ID, we just simulate or ask to create one
            alert("No Market Selected! (In full version, selecting a market loads it)");
            return;
        }
        if (!account) return alert("Connect Wallet");

        setBetStatus("SIGNING...");
        const tx = new Transaction();
        const [coin] = tx.splitCoins(tx.gas, [1000000000]); // 1 SUI

        tx.moveCall({
            target: `${PACKAGE_ID}::${MODULE}::bet`,
            arguments: [
                tx.object(marketId),
                coin,
                tx.pure.bool(isOptionA)
            ]
        });

        signAndExecute({ transaction: tx }, {
            onSuccess: (res) => {
                console.log(res);
                setBetStatus("BET PLACED!");
                // Physics impact
                const body = bodiesRef.current[isOptionA ? 'YES' : 'NO'];
                if (body) Matter.Body.setAngularVelocity(body, 0.2);
            },
            onError: (err) => {
                console.error(err);
                setBetStatus("FAILED");
            }
        });
    };

    // ADMIN: Create Market
    const createMarket = () => {
        const tx = new Transaction();
        tx.moveCall({
            target: `${PACKAGE_ID}::${MODULE}::create_market`,
            arguments: [
                tx.pure.string(question) // Pass vector<u8> string
            ]
        });
        signAndExecute({ transaction: tx }, {
            onSuccess: (res) => {
                alert("Market Created! Check Explorer for ID.");
                console.log(res);
            }
        });
    };

    const orbStyle: React.CSSProperties = {
        position: 'absolute', top: 0, left: 0,
        width: 180, height: 180,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        borderRadius: '50%',
        cursor: 'pointer',
        boxShadow: '0 0 30px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(5px)',
        border: '2px solid rgba(255,255,255,0.1)'
    };

    return (
        <div ref={sceneRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 20, width: '100%', textAlign: 'center', zIndex: 10 }}>
                <Text size="8" weight="bold" className="glow-text" style={{ fontFamily: 'Orbitron' }}>
                    {question}
                </Text>
                <div style={{ marginTop: 10 }}>
                    <TextField.Root placeholder="Enter Market ID..." value={marketId} onChange={e => setMarketId(e.target.value)} style={{ background: '#0008', color: 'white', border: '1px solid #333' }} />
                </div>
            </div>

            {/* YES ORB */}
            <div
                ref={el => elementsRef.current['YES'] = el}
                onClick={() => handleBet(true)}
                style={{ ...orbStyle, background: 'radial-gradient(circle, #00ff8833, #004422)' }}
            >
                <Text size="6" weight="bold" style={{ fontFamily: 'Orbitron', color: '#00ff88' }}>YES</Text>
            </div>

            {/* NO ORB */}
            <div
                ref={el => elementsRef.current['NO'] = el}
                onClick={() => handleBet(false)}
                style={{ ...orbStyle, background: 'radial-gradient(circle, #ff005533, #440011)' }}
            >
                <Text size="6" weight="bold" style={{ fontFamily: 'Orbitron', color: '#ff0055' }}>NO</Text>
            </div>

            {/* ADMIN CONTROLS (Hidden-ish) */}
            <div style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 100 }}>
                <Dialog.Root>
                    <Dialog.Trigger>
                        <Button color="gray" variant="soft">Create Event</Button>
                    </Dialog.Trigger>
                    <Dialog.Content style={{ maxWidth: 450 }}>
                        <Dialog.Title>Creation Zone</Dialog.Title>
                        <Flex direction="column" gap="3">
                            <TextField.Root placeholder="Event Description" value={question} onChange={e => setQuestion(e.target.value)} />
                            <Button onClick={createMarket}>Deploy Market</Button>
                        </Flex>
                    </Dialog.Content>
                </Dialog.Root>
            </div>

            <div style={{ position: 'absolute', bottom: 80, width: '100%', textAlign: 'center' }}>
                <Text className="glow-text">{betStatus}</Text>
            </div>
        </div>
    );
};

export default PredictionScene;
