import crc32 from 'fast-crc32c';

export type HashObject = (
    object: { [key: string]: string | number | undefined },
    salt: string
) => { [s: string]: string };

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

export type UserProfile = {
    user_id: number;
    user_type?: string;
    email?: string;
    email_domain?: string;
};

function getModuloValue(experiment: string, userId: number): number {
    return crc32.calculate(String(userId), crc32.calculate(experiment)) % 100;
}

export class Experiments {
    config: ABTestingConfig;
    profile: UserProfile;
    hashedProfile: ReturnType<HashObject>;

    constructor(config: ABTestingConfig, profile: UserProfile, hashProfile: HashObject) {
        this.config = config;
        this.profile = profile;
        this.hashedProfile = hashProfile(profile, config.salt);
    }

    getCohort = (experimentName: string): string => {
        const experimentConfig = this.config.experiments.find(e => e.name === experimentName);
        const userSegmentNum = getModuloValue(experimentName, this.profile.user_id);
        let allocatedCohort = 'control';
        for (const cohort of experimentConfig?.cohorts || []) {
            for (const allocation of cohort.allocation || []) {
                if (allocation[0] <= userSegmentNum && userSegmentNum < allocation[1]) {
                    allocatedCohort = cohort.name;
                }
            }
            if (cohort.force_include) {
                for (const hashedProfileKey in cohort.force_include) {
                    const hashedProfileVal = this.hashedProfile[hashedProfileKey];
                    if (cohort.force_include[hashedProfileKey].includes(hashedProfileVal)) {
                        return cohort.name;
                    }
                }
            }
        }
        return allocatedCohort;
    };
}

export default Experiments;
