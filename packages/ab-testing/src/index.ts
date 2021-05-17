import crc32 from 'fast-crc32c/impls/js_crc32c';

type ForceInclude = {
    [key: string]: string[];
};

type Cohort = {
    name: string;
    allocation?: [number, number][];
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

function getModuloValue(experiment: string, userId: number): number {
    return crc32.calculate(String(userId), crc32.calculate(experiment)) % 100;
}

function matchUserCohort(
    experimentConfig: Experiment,
    userId: number,
    userProfile: { [s: string]: string }
): string {
    const userSegmentNum = getModuloValue(experimentConfig.name, userId);
    let allocatedCohort = 'control';
    for (const cohort of experimentConfig.cohorts) {
        if (cohort.force_include) {
            for (const key in cohort.force_include) {
                if (cohort.force_include[key].includes(userProfile[key])) {
                    return cohort.name;
                }
            }
        }
        if (allocatedCohort === 'control') {
            for (const allocation of cohort.allocation || []) {
                if (allocation[0] <= userSegmentNum && userSegmentNum < allocation[1]) {
                    allocatedCohort = cohort.name;
                }
            }
        }
    }
    return allocatedCohort;
}

export class Experiments {
    config: { [experimentName: string]: Experiment };
    userId: number;
    userProfile: { [s: string]: string };
    matchedCohorts: { [experimentName: string]: string };

    constructor(config: ABTestingConfig, userId: number, userProfile: { [s: string]: string }) {
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
