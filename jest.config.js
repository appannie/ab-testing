module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: ['/node_modules/', '/output/'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['lcov', 'html'],
    coverageThreshold: {
        global: {
            branches: 100,
            functions: 100,
            lines: 100,
            statements: 100,
        },
    },
    globals: {
        skipBabel: true,
    },
};
