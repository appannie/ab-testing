# AB Testing

![CI](https://github.com/appannie/ab-testing/workflows/CI/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/appannie/ab-testing/badge.svg)](https://coveralls.io/github/appannie/ab-testing)
![GitHub Release Date](https://img.shields.io/github/release-date/appannie/ab-testing)

AB testing library supporting multi-variance testing with a deterministic algorithm not requiring any complex backend or database. Supporting both Javascript and Python.

The segmentation logic is maintained in the AB testing client and based itself on a centralized configuration. The cohort assignment logic is deterministic and follows a simple hash pattern based on the `crc32c` algorithm (`crc32c(userId, crc32c(experimentName)) % 100`)

# Packages

| Package                            | Status                                                                                                                                                                                                                                                                | Description                                                                                     | API Doc                                                  |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `@appannie/ab-testing`             | ![npm (scoped)](https://img.shields.io/npm/v/@appannie/ab-testing) <br> ![npm bundle size (scoped)](https://img.shields.io/bundlephobia/min/@appannie/ab-testing) <br> ![npm](https://img.shields.io/npm/dw/@appannie/ab-testing)                                     | Core package implementing ab-testing SDK APIs.                                                  | [README.md](./packages/ab-testing/README.md)             |
| `@appannie/react-ab-testing`       | ![npm (scoped)](https://img.shields.io/npm/v/@appannie/react-ab-testing) <br> ![npm bundle size (scoped)](https://img.shields.io/bundlephobia/min/@appannie/react-ab-testing) <br> ![npm](https://img.shields.io/npm/dw/@appannie/react-ab-testing)                   | React binding for the `@appannie/ab-testing` package.                                           | [README.md](./packages/react-ab-testing/README.md)       |
| `@appannie/ab-testing-hash-object` | ![npm (scoped)](https://img.shields.io/npm/v/@appannie/ab-testing-hash-object) <br> ![npm bundle size (scoped)](https://img.shields.io/bundlephobia/min/@appannie/ab-testing-hash-object) <br> ![npm](https://img.shields.io/npm/dw/@appannie/ab-testing-hash-object) | An helper library that simplify helps protecting private information like PIIs.                 | [README.md](./packages/ab-testing-hash-object/README.md) |
| `py-ab-testing`                    | ![PyPI](https://img.shields.io/pypi/v/py-ab-testing) <br> ![PyPI - Python Version](https://img.shields.io/pypi/pyversions/py-ab-testing) <br> ![PyPI - Downloads](https://img.shields.io/pypi/dw/py-ab-testing)                                                       | Python implementation of APIs in `@appannie/ab-testing` and `@appannie/ab-testing-hash-object`. | [README.md](./packages/py-ab-testing/README.md)          |

# Installation

## React App

```sh
npm install @appannie/react-ab-testing
# or
yarn add @appannie/react-ab-testing
```

## Vanilla Javascript

```sh
npm install @appannie/ab-testing
# or
yarn add @appannie/ab-testing
```

## Python

```sh
pip install py-ab-testing
# or
pipenv install py-ab-testing
```

Note that a [raw JS version is also available (`@appannie/ab-testing`)](./packages/ab-testing/README.md). Feel free to write your own adapters for other framework.

# Setup with React

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

# The configuration

```js
{
    // The version isn't used right now, it is used to allow potentially breaking configuration
    // change in the future. Current version is "1.0"
    version: "1.0",

    experiments: [
        {
            // Unique name used to refer to an experiment; used within `useCohortOf`
            name: 'experiment-name',
            cohorts: [
                {
                    // Name of a cohort. These are the values returned by `useCohortOf`
                    name: 'blue',

                    // The force_include section is used to force users into given cohorts if their
                    // userProfile key. In many keys are used, *any* match will force include the user in
                    // the cohort.
                    // The force_include rules are checked in the order of the cohorts in the array and
                    // the first match wins.
                    // This section is optional.
                    force_include: {
                        persona: [
                            'data analyst'
                        ]
                    },

                    // The users are allocated to values in a range of 0 to 100. The allocation config
                    // represents the slice of users allocated to a cohort. You can have multiple
                    // allocation ranges.
                    // Every range needs to be unique and not overlap other ranges in any other cohort.
                    allocation: [
                        [0, 25]
                    ],
                },
                {
                    // "control" is the default cohort. All experiments always have a control cohort.
                    // All users not allocated to other cohorts will be assigned to "control" by default.
                    name: 'control'
                },
            ]
        }
    ]
}
```

At App Annie, we're maintaining this configuration in yaml format to reduce the syntax noise. We have an automated CI task to encode/encrypt and push the final configuration to a public S3 bucket from where our SDK retrieve the configuration.

## Protecting private information

You shouldn't list user [private information (PII)](https://csrc.nist.gov/glossary/term/PII) within the configuration file as these are most likely public.

If you need to segment users using emails or information you wish/need to keep private, we suggest you to securely encrypt them.

We're providing an extra module [`@appannie/ab-testing-hash-object`](./packages/ab-testing-hash-object/README.md) aiming to simplify this flow. This module will encode the keys and the values of your user profile. You then need to call it with the same `salt` while preprocessing your configuration and once when defining the user profile:

```js
import { hashObject } from '@appannie/ab-testing-hash-object';

const profile = hashObject(
    {
        persona: user.persona,
        employee: user.isEmployee,
    },
    config.salt
);
```

# Example configuration & common use case

## Excluding a user from an experiment

You can do this by force including a user or a group of users in the `control` cohort.

```yaml
experiments:
    - name: my_experiment
      cohorts:
          - name: control
            force_include:
                # Here we'd prevent any google.com users from seeing the experiment
                email_domain:
                    - google.com
          - name: cohort_A
            allocation:
                - [0, 10]
```

## Internal whitelist

Force include users with `email_domain` equal to `appannie.com` under the desired cohort.

```yaml
experiments:
    - name: my_experiment
      cohorts:
          - name: control
          - name: cohort_A
            force_include:
                # Force all App Annie user under the given cohort
                email_domain:
                    - appannie.com
```

# Credits

Made with ❤️ by [Zhang Tao](https://github.com/BananaWanted) and [Simon Boudrias](https://github.com/SBoudrias) from the App Annie Beijing office.

Available for public use under the MIT license.
