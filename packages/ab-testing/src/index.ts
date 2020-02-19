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

export class Experiments {
    config: ABTestingConfig;
    userId: number;
    userProfile: { [s: string]: string };

    constructor(config: ABTestingConfig, userId: number, userProfile: { [s: string]: string }) {
        this.config = config;
        this.userId = userId;
        this.userProfile = userProfile;
    }

    getCohort = (experimentName: string): string => {
        const experimentConfig = this.config.experiments.find(e => e.name === experimentName);
        if (!experimentConfig) {
            console.error(`unrecognized ab testing experiment name: ${experimentName}`);
            return 'control';
        }
        const userSegmentNum = getModuloValue(experimentName, this.userId);
        let allocatedCohort = 'control';
        for (const cohort of experimentConfig.cohorts) {
            if (cohort.force_include) {
                for (const key in cohort.force_include) {
                    if (cohort.force_include[key].includes(this.userProfile[key])) {
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
    };
}

export default Experiments;
