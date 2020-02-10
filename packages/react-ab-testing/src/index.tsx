import React, { ReactNode } from 'react';
import Experiments, { ABTestingConfig, UserProfile, HashObject } from '@appannie/ab-testing';

const ABTestingContext = React.createContext<{ getCohort: (experimentName: string) => string }>({
    getCohort: () => 'control',
});

export function ABTestingController(props: {
    config: ABTestingConfig;
    user: UserProfile;
    hashObject: HashObject;
    children: ReactNode;
}): JSX.Element {
    const experiments = React.useMemo(
        () => new Experiments(props.config, props.user, props.hashObject),
        [props.config, props.hashObject, props.user]
    );
    return (
        <ABTestingContext.Provider value={experiments}>{props.children}</ABTestingContext.Provider>
    );
}

export function useCohortOf(experimentName: string): string {
    const experiments = React.useContext(ABTestingContext);
    return experiments.getCohort(experimentName);
}
