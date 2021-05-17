import Experiments, { ABTestingConfig } from '../src';
import { hashObject } from '@appannie/ab-testing-hash-object';

describe('ab-testing module', () => {
    const salt = '4a9120a277117afeade34305c258a2f1';
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
                    },
                    {
                        name: 'test_force_include',
                        force_include: hashObject(
                            {
                                user_id: [1],
                                user_type: ['free'],
                                email: ['control@example.com'],
                                email_domain: ['example.com'],
                            },
                            salt
                        ),
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
                    },
                    {
                        name: 'test_force_include',
                        force_include: hashObject(
                            {
                                user_id: [2],
                                user_type: ['intelligence'],
                                email: ['control@a.com'],
                                email_domain: ['a.com'],
                            },
                            salt
                        ),
                    },
                ],
            },
        ],
        salt,
    };

    it('match cohorts', () => {
        expect(
            new Experiments(config, 2, hashObject({ user_id: 2 }, config.salt)).hasExperiment(
                'experiment_1'
            )
        ).toBe(true);
        expect(
            new Experiments(config, 2, hashObject({ user_id: 2 }, config.salt)).getCohort(
                'experiment_1'
            )
        ).toEqual('control');
        expect(
            new Experiments(config, 1, hashObject({ user_id: 1 }, config.salt)).getCohort(
                'experiment_1'
            )
        ).toEqual('test_force_include');
        expect(
            new Experiments(
                config,
                2,
                hashObject({ user_id: 2, user_type: 'free' }, config.salt)
            ).getCohort('experiment_1')
        ).toEqual('test_force_include');
        expect(
            new Experiments(
                config,
                2,
                hashObject({ user_id: 2, user_type: 'intelligence' }, config.salt)
            ).getCohort('experiment_1')
        ).toEqual('control');
        expect(
            new Experiments(
                config,
                2,
                hashObject({ user_id: 2, email: 'control@example.com' }, config.salt)
            ).getCohort('experiment_1')
        ).toEqual('test_force_include');
        expect(
            new Experiments(
                config,
                2,
                hashObject({ user_id: 2, email: 'control@a.com' }, config.salt)
            ).getCohort('experiment_1')
        ).toEqual('control');
        expect(
            new Experiments(
                config,
                2,
                hashObject({ user_id: 2, email_domain: 'example.com' }, config.salt)
            ).getCohort('experiment_1')
        ).toEqual('test_force_include');
        expect(
            new Experiments(
                config,
                2,
                hashObject({ user_id: 2, email_domain: 'a.com' }, config.salt)
            ).getCohort('experiment_1')
        ).toEqual('control');
        expect(
            Array(20)
                .fill(0)
                .map((_, i) => [
                    i + 3,
                    new Experiments(
                        config,
                        i + 3,
                        hashObject({ user_id: i + 3 }, config.salt)
                    ).getCohort('experiment_1'),
                ])
        ).toMatchSnapshot();

        expect(
            new Experiments(config, 1, hashObject({ user_id: 1 }, config.salt)).getCohort(
                'experiment_2'
            )
        ).toEqual('control');
        expect(
            new Experiments(config, 2, hashObject({ user_id: 2 }, config.salt)).getCohort(
                'experiment_2'
            )
        ).toEqual('test_force_include');
        expect(
            new Experiments(
                config,
                1,
                hashObject({ user_id: 1, user_type: 'free' }, config.salt)
            ).getCohort('experiment_2')
        ).toEqual('control');
        expect(
            new Experiments(
                config,
                1,
                hashObject({ user_id: 1, user_type: 'intelligence' }, config.salt)
            ).getCohort('experiment_2')
        ).toEqual('test_force_include');
        expect(
            new Experiments(
                config,
                1,
                hashObject({ user_id: 1, email: 'control@example.com' }, config.salt)
            ).getCohort('experiment_2')
        ).toEqual('control');
        expect(
            new Experiments(
                config,
                1,
                hashObject({ user_id: 1, email: 'control@a.com' }, config.salt)
            ).getCohort('experiment_2')
        ).toEqual('test_force_include');
        expect(
            new Experiments(
                config,
                1,
                hashObject({ user_id: 1, email_domain: 'example.com' }, config.salt)
            ).getCohort('experiment_2')
        ).toEqual('control');
        expect(
            new Experiments(
                config,
                1,
                hashObject({ user_id: 1, email_domain: 'a.com' }, config.salt)
            ).getCohort('experiment_2')
        ).toEqual('test_force_include');
        expect(
            Array(20)
                .fill(0)
                .map((_, i) => [
                    i + 3,
                    new Experiments(
                        config,
                        i + 3,
                        hashObject({ user_id: i + 3 }, config.salt)
                    ).getCohort('experiment_2'),
                ])
        ).toMatchSnapshot();

        expect(
            new Experiments(
                config,
                1,
                hashObject({ user_id: 1, email_domain: 'example.com' }, config.salt)
            ).getCohort('experiment_3')
        ).toEqual('control');
    });

    it('match results is cached', () => {
        const experiment = new Experiments(
            config,
            1,
            hashObject({ user_id: 1, user_type: 'intelligence' }, config.salt)
        );
        expect(experiment.getCohort('experiment_2')).toEqual('test_force_include');
        expect(experiment.getCohort('experiment_2')).toEqual('test_force_include');
    });

    it('does not show an error message if NODE_ENV is  test', () => {
        const spy = jest.spyOn(console, 'error').mockImplementation();

        expect(
            new Experiments(
                config,
                1,
                hashObject({ user_id: 1, email_domain: 'example.com' }, config.salt)
            ).getCohort('experiment_3')
        ).toEqual('control');
        expect(spy).not.toHaveBeenCalled();
    });

    it('shows an error message if NODE_ENV is not test', () => {
        const initialEnv = global.process.env.NODE_ENV;
        global.process.env.NODE_ENV = 'development';
        const spy = jest.spyOn(console, 'error').mockImplementation();

        const experiments = new Experiments(
            config,
            1,
            hashObject({ user_id: 1, email_domain: 'example.com' }, config.salt)
        );

        expect(experiments.getCohort('experiment_3')).toEqual('control');
        expect(experiments.hasExperiment('experiment_3')).toBe(false);
        expect(spy).toHaveBeenCalled();

        global.process.env.NODE_ENV = initialEnv;
    });
});
