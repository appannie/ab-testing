import React, { ReactNode } from 'react';
import Experiments, { ABTestingConfig } from '@appannie/ab-testing';

export { ABTestingConfig };

const ABTestingContext = React.createContext<{
    hasExperiment: (experimentName: string) => boolean;
    getCohort: (experimentName: string) => string;
}>({
    hasExperiment: () => false,
    getCohort: () => 'control',
});

export const ABTestingController: React.FunctionComponent<{
    config: ABTestingConfig;
    userId: number;
    userProfile: { [key: string]: string };
    children: ReactNode;
}> = ({ config, userId, userProfile, children }) => {
    const experiments = React.useMemo(() => new Experiments(config, userId, userProfile), [
        config,
        userId,
        userProfile,
    ]);
    return <ABTestingContext.Provider value={experiments}>{children}</ABTestingContext.Provider>;
};

export function useCohortOf(experimentName: string): string {
    const experiments = React.useContext(ABTestingContext);
    return experiments.getCohort(experimentName);
}

export function useHasExperiment(experimentName: string): boolean {
    const experiments = React.useContext(ABTestingContext);
    return experiments.hasExperiment(experimentName);
}
