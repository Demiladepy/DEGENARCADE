
import { Flex, Text, Card, Badge } from "@radix-ui/themes";
import { motion } from "framer-motion";

export const MyBets = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ width: '100%' }}
        >
            <Text size="8" weight="bold" style={{ marginBottom: 20, display: 'block' }}>My Bets</Text>

            <Flex direction="column" gap="3">
                {/* ACTIVE BETS */}
                <Card style={{ background: 'var(--glass-panel)', border: '1px solid #00f3ff50' }}>
                    <Flex justify="between" align="center">
                        <Flex direction="column">
                            <Text size="5" weight="bold" style={{ color: 'white' }}>Liverpool vs Brighton</Text>
                            <Text size="2" color="gray">Premier League • Live Now</Text>
                        </Flex>
                        <Badge color="green" size="2">ACTIVE</Badge>
                    </Flex>
                    <Flex gap="4" mt="3">
                        <Flex direction="column">
                            <Text size="1" color="gray">PICK</Text>
                            <Text weight="bold" style={{ color: '#00f3ff' }}>Liverpool to Win</Text>
                        </Flex>
                        <Flex direction="column">
                            <Text size="1" color="gray">WAGER</Text>
                            <Text weight="bold">100 SUI</Text>
                        </Flex>
                        <Flex direction="column">
                            <Text size="1" color="gray">POTENTIAL WIN</Text>
                            <Text weight="bold" color="green">185 SUI</Text>
                        </Flex>
                    </Flex>
                </Card>

                {/* PAST BETS */}
                <Card style={{ background: '#ffffff05', border: '1px solid #ffffff10' }}>
                    <Flex justify="between" align="center">
                        <Flex direction="column">
                            <Text size="5" weight="bold" style={{ color: 'white' }}>Coin Flip</Text>
                            <Text size="2" color="gray">Nov 28, 14:30</Text>
                        </Flex>
                        <Badge color="gray" size="2">SETTLED</Badge>
                    </Flex>
                    <Flex gap="4" mt="3">
                        <Flex direction="column">
                            <Text size="1" color="gray">RESULT</Text>
                            <Text weight="bold" color="red">LOSS</Text>
                        </Flex>
                        <Flex direction="column">
                            <Text size="1" color="gray">PNL</Text>
                            <Text weight="bold" color="red">-50 SUI</Text>
                        </Flex>
                    </Flex>
                </Card>
            </Flex>
        </motion.div>
    );
};
