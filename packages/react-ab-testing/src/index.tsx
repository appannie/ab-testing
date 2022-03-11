import React, { ReactNode } from 'react';
import Experiments, { ABTestingConfig } from '@appannie/ab-testing';

export { ABTestingConfig };

export type ABTestingContextType = {
    hasExperiment: (experimentName: string) => boolean;
    getCohort: (experimentName: string) => string;
};

const ABTestingContext = React.createContext<ABTestingContextType>({
    hasExperiment: () => false,
    getCohort: () => 'control',
});

export const ABTestingController: React.FunctionComponent<{
    config: ABTestingConfig;
    userId: number | string;
    userProfile: { [key: string]: string };
    children: ReactNode;
}> = ({ config, userId, userProfile, children }) => {
    const experiments = React.useMemo(
        () => new Experiments(config, userId, userProfile),
        [config, userId, userProfile]
    );
    return <ABTestingContext.Provider value={experiments}>{children}</ABTestingContext.Provider>;
};

export function useCohortOf(experimentName: string): string {
    const experiments = React.useContext(ABTestingContext);
    return experiments.getCohort(experimentName);
}

export const useABTestingController = (): ABTestingContextType =>
    React.useContext(ABTestingContext);
