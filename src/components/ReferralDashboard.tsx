
import { Flex, Text, Button, Card, Box } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export const ReferralDashboard = () => {
    const [copied, setCopied] = useState(false);
    const [referralCount, setReferralCount] = useState(3); // Mock data: 3/5 friends
    const referralLink = "https://degenarcade.fun?ref=0x123...abc";

    useEffect(() => {
        // Simulate fetching live data
        setTimeout(() => setReferralCount(3), 500);
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClaim = () => {
        if (referralCount >= 5) {
            alert("Claiming 10 SUI Reward... (Contract Call Implementation Needed)");
            // In real app, call move function `referral::claim_reward`
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ width: '100%', maxWidth: 800, margin: '0 auto' }}
        >
            <Text size="8" weight="bold" style={{ marginBottom: 30, display: 'block' }}>Team & Referrals</Text>

            <Flex gap="4" wrap="wrap">
                {/* STATUS CARD */}
                <Card style={{ flex: 1, minWidth: 300, background: 'var(--glass-panel)', padding: 30, border: '1px solid #00ff8850' }}>
                    <Flex direction="column" gap="4">
                        <Text size="5" weight="bold" style={{ color: '#00ff88' }}>Referral Status</Text>

                        <Box>
                            <Flex justify="between" style={{ marginBottom: 8 }}>
                                <Text size="2" color="gray">Progress to Reward</Text>
                                <Text size="2" weight="bold" style={{ color: '#fff' }}>{referralCount} / 5 Friends</Text>
                            </Flex>
                            <div style={{ width: '100%', height: 8, background: '#333', borderRadius: 4, overflow: 'hidden' }}>
                                <div style={{
                                    width: `${(referralCount / 5) * 100}%`,
                                    height: '100%',
                                    background: '#00ff88',
                                    transition: 'width 0.5s ease'
                                }} />
                            </div>
                        </Box>

                        <Button
                            size="3"
                            disabled={referralCount < 5}
                            onClick={handleClaim}
                            style={{
                                background: referralCount >= 5 ? '#00ff88' : '#333',
                                color: referralCount >= 5 ? 'black' : '#666',
                                cursor: referralCount >= 5 ? 'pointer' : 'not-allowed',
                                marginTop: 10
                            }}
                        >
                            {referralCount >= 5 ? "CLAIM 10 SUI" : `${5 - referralCount} MORE TO CLAIM`}
                        </Button>
                    </Flex>
                </Card>

                {/* LINK CARD */}
                <Card style={{ flex: 1, minWidth: 300, background: 'var(--glass-panel)', padding: 30, border: '1px solid #ffffff10' }}>
                    <Flex direction="column" gap="4">
                        <Text size="5" weight="bold">Invite Friends</Text>
                        <Text size="2" color="gray">Share your link. Earn 10 SUI for every 5 degens who join and play.</Text>

                        <Flex gap="2" style={{ background: '#000', padding: 12, borderRadius: 8, border: '1px solid #333' }}>
                            <Text style={{ flex: 1, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {referralLink}
                            </Text>
                            <Text size="2" weight="bold" style={{ color: '#00f3ff', cursor: 'pointer' }} onClick={handleCopy}>
                                {copied ? "COPIED!" : "COPY"}
                            </Text>
                        </Flex>
                    </Flex>
                </Card>
            </Flex>

            {/* TEAM LIST */}
            <Text size="5" weight="bold" style={{ marginTop: 40, marginBottom: 20, display: 'block' }}>Your Team</Text>
            <Flex direction="column" gap="3">
                {[1, 2, 3].map(i => (
                    <div key={i} style={{
                        padding: 16,
                        background: '#ffffff05',
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16
                    }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: '50%',
                            background: `url(/avatars/avatar${i}.png)`,
                            backgroundSize: 'cover',
                            border: '1px solid #00ff8850'
                        }} />
                        <Flex direction="column">
                            <Text weight="bold">DegenUser_{i}9{i}</Text>
                            <Text size="1" color="gray">Joined 2 days ago • Wagered 500 SUI</Text>
                        </Flex>
                        <Box style={{ flexGrow: 1 }} />
                        <Text size="2" style={{ color: '#00ff88' }}>+2.5 SUI Earned</Text>
                    </div>
                ))}
            </Flex>

        </motion.div>
    );
};
