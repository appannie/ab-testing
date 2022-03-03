import { hashObject } from '@appannie/ab-testing-hash-object';
import { validateAllocation, Cohort } from '../src';

describe('test validateAllocation func', () => {
    const salt = '4a9120a277117afeade34305c258a2f1';
    const withinRangeCohort: Cohort = {
        name: 'test_cohort',
        allocation: [[50, 100]],
    };
    const outOfRangeCohort: Cohort = {
        name: 'test_cohort',
        allocation: [[0, 45]],
    };

    const cohortWithCriteria: Cohort = {
        name: 'test_cohort',
        allocation: [[50, 100]],
        allocation_criteria: hashObject(
            {
                email_domain: ['data.ai'],
            },
            salt
        ),
    };

    const cohortNoAllocation: Cohort = {
        name: 'test_cohort',
        force_include: {
            email_domain: ['data.ai'],
        },
    };

    it('passes an allocation if the user segment is within the valid range', () => {
        expect(validateAllocation(withinRangeCohort, hashObject({ user_id: 2 }, salt), 51)).toBe(
            true
        );
    });

    it('fails an allocation if the user segment is not within the valid range', () => {
        expect(validateAllocation(outOfRangeCohort, hashObject({ user_id: 2 }, salt), 51)).toBe(
            false
        );
    });

    it('passes an allocation with fields if the user satisfies field requirements', () => {
        expect(
            validateAllocation(
                cohortWithCriteria,
                hashObject({ user_id: 2, email_domain: 'data.ai' }, salt),
                51
            )
        ).toBe(true);
    });

    it('fails an allocation with fields if the user does not satisfy field requirements', () => {
        expect(
            validateAllocation(
                cohortWithCriteria,
                hashObject({ user_id: 2, email_domain: 'google.ca' }, salt),
                51
            )
        ).toBe(false);
    });

    it('It returns true if no allocation is passed in regardless of userSegmentNum', () => {
        expect(
            validateAllocation(
                cohortNoAllocation,
                hashObject({ user_id: 2, email_domain: 'google.ca' }, salt),
                51
            )
        ).toBe(false);
    });
});
