import crc32 from 'fast-crc32c/impls/js_crc32c';

type UserProfile = { [s: string]: string };

type ForceInclude = {
    [key: string]: string[];
};

export type Cohort = {
    name: string;
    allocation?: [number, number][];
    force_include?: ForceInclude;
    allocation_criteria?: ForceInclude;
};

type Experiment = {
    name: string;
    cohorts: Cohort[];
};

export type ABTestingConfig = {
    salt: string;
    version: '1.0';
    experiments: Experiment[];
};

function getModuloValue(experiment: string, userId: number | string): number {
    return crc32.calculate(String(userId), crc32.calculate(experiment)) % 100;
}

function validateCriteria(criteria: ForceInclude, userProfile: UserProfile): boolean {
    let itemMatchesCriteria = true;
    for (const key in criteria) {
        if (!criteria[key].includes(userProfile[key])) {
            itemMatchesCriteria = false;
        }
    }

    return itemMatchesCriteria;
}

export function validateAllocation(
    cohort: Cohort,
    userProfile: UserProfile,
    userSegmentNum: number
): boolean {
    let withinRange = false,
        fulfillsCriteria = true;
    if (cohort.allocation) {
        for (const allocation of cohort.allocation) {
            withinRange = allocation[0] <= userSegmentNum && userSegmentNum < allocation[1];

            if (withinRange) {
                break;
            }
        }

        if (withinRange && cohort.allocation_criteria) {
            fulfillsCriteria = validateCriteria(cohort.allocation_criteria, userProfile);
        }
    }

    return withinRange && fulfillsCriteria;
}

function validateForceInclude(cohort: Cohort, userProfile: UserProfile): boolean {
    if (cohort.force_include) {
        for (const key in cohort.force_include) {
            if (cohort.force_include[key].includes(userProfile[key])) {
                return true;
            }
        }
    }

    return false;
}

function matchUserCohort(
    experimentConfig: Experiment,
    userId: number | string,
    userProfile: { [s: string]: string }
): string {
    let allocatedCohort = 'control';
    const userSegmentNum = getModuloValue(experimentConfig.name, userId);

    for (const cohort of experimentConfig.cohorts) {
        if (validateForceInclude(cohort, userProfile)) {
            return cohort.name;
        }

        if (allocatedCohort === 'control' && cohort.allocation) {
            if (validateAllocation(cohort, userProfile, userSegmentNum)) {
                allocatedCohort = cohort.name;
            }
        }
    }

    return allocatedCohort;
}

export class Experiments {
    config: { [experimentName: string]: Experiment };
    userId: number | string;
    userProfile: { [s: string]: string };
    matchedCohorts: { [experimentName: string]: string };

    constructor(
        config: ABTestingConfig,
        userId: number | string,
        userProfile: { [s: string]: string }
    ) {
        this.config = {};
        this.userId = userId;
        this.userProfile = userProfile;
        this.matchedCohorts = {};
        for (const experimentConfig of config.experiments) {
            this.config[experimentConfig.name] = experimentConfig;
        }
    }

    getCohort = (experimentName: string): string => {
        if (!(experimentName in this.matchedCohorts)) {
            const experimentConfig: Experiment = this.config[experimentName];
            if (experimentConfig == null) {
                process.env.NODE_ENV !== 'test' &&
                    console.error(`unrecognized ab testing experiment name: ${experimentName}`);
                this.matchedCohorts[experimentName] = 'control';
            } else {
                this.matchedCohorts[experimentName] = matchUserCohort(
                    experimentConfig,
                    this.userId,
                    this.userProfile
                );
            }
        }
        return this.matchedCohorts[experimentName];
    };

    hasExperiment = (experimentName: string): boolean => !!this.config[experimentName];
}

export default Experiments;
