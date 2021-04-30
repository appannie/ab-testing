import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { ABTestingConfig } from '@appannie/ab-testing';
import hashObject from '@appannie/ab-testing-hash-object';
import { ABTestingController, useCohortOf } from '../src';

describe('AB Testing', () => {
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

    it('getCohort without context', () => {
        expect(renderHook(() => useCohortOf('experiment_1')).result.current).toEqual('control');
    });

    it('getCohort', () => {
        expect(
            renderHook(() => useCohortOf('experiment_1'), {
                wrapper: ({ children }) => (
                    <ABTestingController
                        config={config}
                        userId={1}
                        userProfile={hashObject({ user_id: 1 }, config.salt)}
                    >
                        {children}
                    </ABTestingController>
                ),
            }).result.current
        ).toEqual('test_force_include');

        expect(
            renderHook(() => useCohortOf('experiment_1'), {
                wrapper: ({ children }) => (
                    <ABTestingController
                        config={config}
                        userId={2}
                        userProfile={hashObject({ user_id: 2 }, config.salt)}
                    >
                        {children}
                    </ABTestingController>
                ),
            }).result.current
        ).toEqual('control');
    });
});
