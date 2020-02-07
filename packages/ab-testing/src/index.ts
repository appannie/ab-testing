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

interface UserProfile {
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

function getModuloValue(experiment: string, userId: number): number {
    return crc32.calculate(String(userId), crc32.calculate(experiment)) % 100;
}

export function getCohort(
    config: ABTestingConfig,
    experimentName: string,
    profile: UserProfile
): string {
    const experimentConfig = config.experiments.find(e => e.name === experimentName);
    for (const cohort of experimentConfig?.cohorts || []) {
        for (const profileKey of Object.keys(profile) as Iterable<keyof UserProfile>) {
            const hashedProfileKey = getHashedValue(config.salt, profileKey);
            const hashedProfileVal = getHashedValue(config.salt, profile[profileKey]);
            if (
                cohort.force_include &&
                cohort.force_include[hashedProfileKey]?.includes(hashedProfileVal)
            ) {
                return cohort.name;
            }
        }
    }
    const userSegmentNum = getModuloValue(experimentName, profile.user_id);
    for (const cohort of experimentConfig?.cohorts || []) {
        for (const allocation of cohort.allocation || []) {
            if (allocation[0] <= userSegmentNum && userSegmentNum < allocation[1]) {
                return cohort.name;
            }
        }
    }
    return 'control';
}

export default getCohort;
