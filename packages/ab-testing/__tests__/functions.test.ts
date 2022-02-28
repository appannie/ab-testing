import { hashObject } from '@appannie/ab-testing-hash-object';
import { validateAllocation, Cohort } from '../src';

describe('test validateAllocation func', () => {
    const salt = '4a9120a277117afeade34305c258a2f1';
    const validCohort: Cohort = {
        name: 'test_cohort',
        allocation: [[50, 100]],
    };
    const invalidCohort: Cohort = {
        name: 'test_cohort',
        allocation: [[0, 45]],
    };

    const fieldCohortV2: Cohort = {
        name: 'test_cohort',
        allocation: [[50, 100]],
        allocation_criteria: hashObject(
            {
                email_domain: ['data.ai'],
            },
            salt
        ),
    };

    it('passes an allocation if the user segment is within the valid range', () => {
        expect(validateAllocation(validCohort, hashObject({ user_id: 2 }, salt), 51)).toBe(true);
    });
    it('fails an allocation if the user segment is not within the valid range', () => {
        expect(validateAllocation(invalidCohort, hashObject({ user_id: 2 }, salt), 51)).toBe(false);
    });
    it('V2 - passes an allocation with fields if the user satisfies field requirements', () => {
        expect(
            validateAllocation(
                fieldCohortV2,
                hashObject({ user_id: 2, email_domain: 'data.ai' }, salt),
                51
            )
        ).toBe(true);
    });
    it('V2 - fails an allocation with fields if the user does not satisfy field requirements', () => {
        expect(
            validateAllocation(
                fieldCohortV2,
                hashObject({ user_id: 2, email_domain: 'google.ca' }, salt),
                51
            )
        ).toBe(false);
    });
});
