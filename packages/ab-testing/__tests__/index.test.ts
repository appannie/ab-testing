/* eslint-disable @typescript-eslint/camelcase */
import Experiments, { ABTestingConfig } from '../src';
import hashObject from '@appannie/ab-testing-hash-object';

describe('ab-testing module', () => {
    const config: ABTestingConfig = {
        version: '1.0',
        experiments: [
            {
                name: 'experiment_1',
                cohorts: [
                    { name: 'control', force_include: {} },
                    {
                        name: 'test_allocation',
                        allocation: [
                            [0, 10],
                            [90, 100],
                        ],
                        force_include: {},
                    },
                    {
                        name: 'test_force_include',
                        force_include: {
                            '559585298de65441d096a03315c848e25a5ceff9eea48bf5041e24ea4d481022': [
                                '6b1bb552ddd9efa8188da1366386d303543a6de703d5ba8415f7a00b60e1eaea',
                            ],
                            '6ac346cad30f3196adbe9cb6f546cb8115b9f8998d1346b004481d1a6eb102f9': [
                                '7ff9a510c4f06d3e30e21308ccf043d909f683e9b573929215c05c3e6f852c00',
                            ],
                            '0a107badb326491ebb2a4483d5b1d86e87c98ea21a34c29c32bf6205d0245e6e': [
                                '2b474d6af1a14715371d450aedce427cfff78f6b9d2ceec5bf1321169206e046',
                            ],
                            '7aa814f6be9d13c1fc70d8d32a34dcce812381be4754c711540310b256e10e80': [
                                '2c12caae54b0922eeba0560087d59d6a012eb431146e761c97787a28ca907625',
                            ],
                        },
                    },
                ],
            },
            {
                name: 'experiment_2',
                cohorts: [
                    { name: 'control', force_include: {} },
                    {
                        name: 'test_allocation',
                        allocation: [
                            [10, 20],
                            [80, 90],
                        ],
                        force_include: {},
                    },
                    {
                        name: 'test_force_include',
                        force_include: {
                            '559585298de65441d096a03315c848e25a5ceff9eea48bf5041e24ea4d481022': [
                                'd35efdfffec2f18661a2fdce592ba8237c8f12753bfaf3f3e7456304393764b8',
                            ],
                            '6ac346cad30f3196adbe9cb6f546cb8115b9f8998d1346b004481d1a6eb102f9': [
                                '26e0a9e7e1dfe33ce15ef16cb7a1e0086ee7916ec10eb52a4a8fffe00ae3a40c',
                            ],
                            '0a107badb326491ebb2a4483d5b1d86e87c98ea21a34c29c32bf6205d0245e6e': [
                                'ea799fdde1713dbf6bb5c666c3117ab8d19254966997fa413394c0b33ca5bab6',
                            ],
                            '7aa814f6be9d13c1fc70d8d32a34dcce812381be4754c711540310b256e10e80': [
                                '10a3c3b449ed70682d756f3f6b980595ebc284819250730a4ffc184e08c0b3f6',
                            ],
                        },
                    },
                ],
            },
        ],
        salt: '4a9120a277117afeade34305c258a2f1',
    };

    it('match cohorts', () => {
        expect(
            new Experiments(config, { user_id: 2 }, hashObject).getCohort('experiment_1')
        ).toEqual('control');
        expect(
            new Experiments(config, { user_id: 1 }, hashObject).getCohort('experiment_1')
        ).toEqual('test_force_include');
        expect(
            new Experiments(config, { user_id: 2, user_type: 'free' }, hashObject).getCohort(
                'experiment_1'
            )
        ).toEqual('test_force_include');
        expect(
            new Experiments(
                config,
                { user_id: 2, user_type: 'intelligence' },
                hashObject
            ).getCohort('experiment_1')
        ).toEqual('control');
        expect(
            new Experiments(
                config,
                { user_id: 2, email: 'control@example.com' },
                hashObject
            ).getCohort('experiment_1')
        ).toEqual('test_force_include');
        expect(
            new Experiments(config, { user_id: 2, email: 'control@a.com' }, hashObject).getCohort(
                'experiment_1'
            )
        ).toEqual('control');
        expect(
            new Experiments(
                config,
                { user_id: 2, email_domain: 'example.com' },
                hashObject
            ).getCohort('experiment_1')
        ).toEqual('test_force_include');
        expect(
            new Experiments(config, { user_id: 2, email_domain: 'a.com' }, hashObject).getCohort(
                'experiment_1'
            )
        ).toEqual('control');
        expect(
            Array(20)
                .fill(0)
                .map((_, i) => [
                    i + 3,
                    new Experiments(config, { user_id: i + 3 }, hashObject).getCohort(
                        'experiment_1'
                    ),
                ])
        ).toMatchSnapshot();

        expect(
            new Experiments(config, { user_id: 1 }, hashObject).getCohort('experiment_2')
        ).toEqual('control');
        expect(
            new Experiments(config, { user_id: 2 }, hashObject).getCohort('experiment_2')
        ).toEqual('test_force_include');
        expect(
            new Experiments(config, { user_id: 1, user_type: 'free' }, hashObject).getCohort(
                'experiment_2'
            )
        ).toEqual('control');
        expect(
            new Experiments(
                config,
                { user_id: 1, user_type: 'intelligence' },
                hashObject
            ).getCohort('experiment_2')
        ).toEqual('test_force_include');
        expect(
            new Experiments(
                config,
                { user_id: 1, email: 'control@example.com' },
                hashObject
            ).getCohort('experiment_2')
        ).toEqual('control');
        expect(
            new Experiments(config, { user_id: 1, email: 'control@a.com' }, hashObject).getCohort(
                'experiment_2'
            )
        ).toEqual('test_force_include');
        expect(
            new Experiments(
                config,
                { user_id: 1, email_domain: 'example.com' },
                hashObject
            ).getCohort('experiment_2')
        ).toEqual('control');
        expect(
            new Experiments(config, { user_id: 1, email_domain: 'a.com' }, hashObject).getCohort(
                'experiment_2'
            )
        ).toEqual('test_force_include');
        expect(
            Array(20)
                .fill(0)
                .map((_, i) => [
                    i + 3,
                    new Experiments(config, { user_id: i + 3 }, hashObject).getCohort(
                        'experiment_2'
                    ),
                ])
        ).toMatchSnapshot();

        expect(
            new Experiments(
                config,
                { user_id: 1, email_domain: 'example.com' },
                hashObject
            ).getCohort('experiment_3')
        ).toEqual('control');
    });

    it('custom hash function', () => {
        expect(
            new Experiments(
                config,
                {
                    user_id: 1,
                    email: 'a@example.com',
                },
                () => ({ a: 'aaa', b: 'bbb' })
            ).hashedProfile
        ).toEqual({
            a: 'aaa',
            b: 'bbb',
        });
    });
});
