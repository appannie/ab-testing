import crc32 from 'fast-crc32c';

type ForceInclude = {
    [hashedKey: string]: string[];
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
    experiments: {
        [experimentName: string]: {
            forceInclude: Map<string, string>;
            allocations: {
                [cohortName: string]: [number, number][];
            };
        };
    };
    userId: number;
    forceIncludeKeys: string[];

    constructor(config: ABTestingConfig, userId: number, userProfile: { [key: string]: string }) {
        this.userId = userId;
        this.forceIncludeKeys = [];
        this.experiments = {};

        for (const [key, value] of Object.entries(userProfile)) {
            this.forceIncludeKeys.push(key + value);
        }

        config.experiments.forEach(experiment => {
            const forceInclude = new Map<string, string>();
            const allocations: { [cohortName: string]: [number, number][] } = {};
            experiment.cohorts.forEach(cohort => {
                if (cohort.force_include) {
                    for (const forceIncludeKey in cohort.force_include) {
                        cohort.force_include[forceIncludeKey].forEach(forceIncludeVal =>
                            forceInclude.set(forceIncludeKey + forceIncludeVal, cohort.name)
                        );
                    }
                }
                if (cohort.allocation) {
                    allocations[cohort.name] = cohort.allocation;
                }
            });
            this.experiments[experiment.name] = {
                forceInclude,
                allocations,
            };
        });
    }

    getCohort = (experimentName: string): string => {
        if (experimentName in this.experiments) {
            for (const forceIncludeKey of this.forceIncludeKeys) {
                const forceIncludeCohort = this.experiments[experimentName].forceInclude.get(
                    forceIncludeKey
                );
                if (forceIncludeCohort) {
                    return forceIncludeCohort;
                }
            }
            const userSegmentNum = getModuloValue(experimentName, this.userId);
            for (const cohortName in this.experiments[experimentName].allocations) {
                for (const allocation of this.experiments[experimentName].allocations[cohortName]) {
                    if (allocation[0] <= userSegmentNum && userSegmentNum < allocation[1]) {
                        return cohortName;
                    }
                }
            }
        }
        return 'control';
    };
}

export default Experiments;
