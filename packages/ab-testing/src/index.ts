import 'ts-polyfill/lib/es2019-object';
import createHash from 'create-hash';
import crc32 from 'fast-crc32c';

interface ForceInclude {
    [hashedKey: string]: string[];
}

interface Cohort {
    name: string;
    allocation?: [number, number][];
    force_include?: ForceInclude;
}

interface Experiment {
    name: string;
    cohorts: Cohort[];
}

export interface ABTestingConfig {
    salt: string;
    version: '1.0';
    experiments: Experiment[];
}

export interface UserProfile {
    user_id: number;
    user_type?: string;
    email?: string;
    email_domain?: string;
}

function getHashedValue(salt: string, sourceValue: unknown): string {
    const hash = createHash('sha256');
    hash.update(salt);
    hash.update(String(sourceValue));
    return hash.digest('hex');
}

function hashObject(obj: object, salt: string): { [s: string]: string } {
    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [
            getHashedValue(salt, key),
            getHashedValue(salt, value),
        ])
    );
}

function getModuloValue(experiment: string, userId: number): number {
    return crc32.calculate(String(userId), crc32.calculate(experiment)) % 100;
}

export class Experiments {
    config: ABTestingConfig;
    profile: UserProfile;
    hashedProfile: { [s: string]: string };
    constructor(
        config: ABTestingConfig,
        profile: UserProfile,
        hashProfile: typeof hashObject = hashObject
    ) {
        this.config = config;
        this.profile = profile;
        this.hashedProfile = hashProfile(profile as object, config.salt);
    }

    getCohort = (experimentName: string): string => {
        const experimentConfig = this.config.experiments.find(e => e.name === experimentName);
        for (const cohort of experimentConfig?.cohorts || []) {
            for (const [hashedProfileKey, hashedProfileVal] of Object.entries(this.hashedProfile)) {
                if (
                    cohort.force_include &&
                    cohort.force_include[hashedProfileKey]?.includes(hashedProfileVal)
                ) {
                    return cohort.name;
                }
            }
        }
        const userSegmentNum = getModuloValue(experimentName, this.profile.user_id);
        for (const cohort of experimentConfig?.cohorts || []) {
            for (const allocation of cohort.allocation || []) {
                if (allocation[0] <= userSegmentNum && userSegmentNum < allocation[1]) {
                    return cohort.name;
                }
            }
        }
        return 'control';
    };
}

export default Experiments;
