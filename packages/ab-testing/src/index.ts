import crc32 from 'fast-crc32c/impls/js_crc32c';

type UserProfile = { [s: string]: string };

type ForceInclude = {
    [key: string]: string[];
};

type AllocationFields = { [key: string]: string[] };

type AllocationV2 = {
    range: [number, number][];
    fields?: AllocationFields;
};

type AllocationV1 = [number, number][];

type Allocation = AllocationV1 | AllocationV2;

export type Cohort = {
    name: string;
    allocation?: Allocation;
    force_include?: ForceInclude;
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

function validateAllocationFields(fields: AllocationFields, userProfile: UserProfile): boolean {
    let itemMatchesCriteria = true;
    for (const key in fields) {
        if (!fields[key].includes(userProfile[key])) {
            itemMatchesCriteria = false;
        }
    }

    return itemMatchesCriteria;
}

const isAllocationV2 = (allocation: any): allocation is AllocationV2 =>
    allocation.range !== undefined || allocation.fields !== undefined;

function validateUserWithinAllocationRange(userSegmentNum: number, range: AllocationV1) {
    for (const allocation of range) {
        console.log(userSegmentNum, allocation);
        if (allocation[0] <= userSegmentNum && userSegmentNum < allocation[1]) {
            console.log('returning true');
            return true;
        }
    }

    return false;
}

export function validateAllocation(
    cohort: Cohort,
    userProfile: UserProfile,
    configName: string,
    userId: number | string
): boolean {
    const userSegmentNum = getModuloValue(configName, userId);
    if (cohort.allocation) {
        if (isAllocationV2(cohort.allocation)) {
            const range = cohort.allocation.range;
            const fields = cohort.allocation.fields;
            if (validateUserWithinAllocationRange(userSegmentNum, range) || !range) {
                if (fields) {
                    return validateAllocationFields(fields, userProfile);
                }
                return true;
            }
        } else {
            return validateUserWithinAllocationRange(userSegmentNum, cohort.allocation);
        }
    }

    return false;
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
    for (const cohort of experimentConfig.cohorts) {
        if (validateForceInclude(cohort, userProfile)) {
            return cohort.name;
        }

        if (validateAllocation(cohort, userProfile, experimentConfig.name, userId)) {
            allocatedCohort = cohort.name;
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
