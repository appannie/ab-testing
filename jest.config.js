module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: ['/node_modules/', '/output/'],
    globals: {
        skipBabel: true,
    },
};
