# React AB Testing

# Installation

```sh
npm install @appannie/react-ab-testing
# or
yarn add @appannie/react-ab-testing
```

# Getting Started

Wrap your app with the `ABTestingController`

```js
import { ABTestingController } from '@appannie/react-ab-testing';

const MyApp = ({ user }) => {
    const profile = {
        persona: user.persona,
        employee: user.isEmployee,
    };

    return (
        <ABTestingController config={testConfig} userId={user.id} userProfile={profile}>
            <App />
        </ABTestingController>
    );
};
```

The required props are:

1. `config`: the configuration object.
2. `userId`: a unique identifier for your current user. This ID should be the same across visits to make sure your user always end up in the same cohorts. It can a `string` or a `number`.
3. `userProfile`: a key/value map used to force include a user in given cohorts.

Then within your app, check the cohort a user is assigned to using the `useCohortOf` hook.

```js
import { useCohortOf } from '@appannie/react-ab-testing';

const Component = () => {
    const cohort = useCohortOf('experiment-name');

    switch (cohort) {
        case 'blue':
            return <BlueButton />;
        case 'red':
            return <RedButton />;
        // 'control' is the default cohort. All experiments have a control cohort.
        case 'control':
        default:
            return <Default />;
    }
};
```

Note: The [configuration file format is documented here](../../README.md).

# Credits

Made with ❤️ by [Zhang Tao](https://github.com/BananaWanted) and [Simon Boudrias](https://github.com/SBoudrias) from the App Annie Beijing office.

Available for public use under the MIT license.
