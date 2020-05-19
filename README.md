<!-- TOC -->

- [AB Testing](#ab-testing)
- [Terms](#terms)
- [Package API References](#package-api-references)
    - [For React: `@appannie/react-ab-testing`](#for-react-appanniereact-ab-testing)
        - [Installation](#installation)
        - [Usage](#usage)
    - [For Vanilla Javascript: `@appannie/ab-testing`](#for-vanilla-javascript-appannieab-testing)
        - [Installation](#installation-1)
        - [Usage](#usage-1)
    - [Javascript Hashing Utils `@appannie/ab-testing-hash-object`](#javascript-hashing-utils-appannieab-testing-hash-object)
        - [Installation](#installation-2)
        - [Usage](#usage-2)
    - [For Python: `py-ab-testing`](#for-python-py-ab-testing)
        - [Installation](#installation-3)
        - [Usage](#usage-3)
        - [Configration Hashing](#configration-hashing)
            - [Prepare config file BEFORE make it public](#prepare-config-file-before-make-it-public)
            - [In runtime](#in-runtime)
- [Configuration File Reference](#configuration-file-reference)
    - [Configuration File Hashing and Protecting private information](#configuration-file-hashing-and-protecting-private-information)
    - [Example configuration and common use case](#example-configuration-and-common-use-case)
        - [Excluding a user from an experiment](#excluding-a-user-from-an-experiment)
        - [Internal whitelist](#internal-whitelist)
- [Credits](#credits)

<!-- /TOC -->

# AB Testing

![CI](https://github.com/appannie/ab-testing/workflows/CI/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/appannie/ab-testing/badge.svg)](https://coveralls.io/github/appannie/ab-testing)
![GitHub Release Date](https://img.shields.io/github/release-date/appannie/ab-testing)

The AB Testing library implements multi-variance testing with a deterministic algorithm. It doesn't require any complex backend or database. Supporting both Javascript and Python.

The AB Testing library segmentating users under different "[cohorts](#terms)", so you could use an `if-else`-like statement to implement different features base on the segmentation.

There're 2 ways of segmentation:

1. Percentage based segmentation: Randomly allocate certain percent of user to a "[cohort](#terms)". The allocation algorithm guarantees to produce stable results within a single [experiment](#terms), and produce a different set of users for another [experiment](#terms) in a random way. Take a look at this example: `first 25% users`, it will always result into the same group of users in [experiment](#terms) `A`, but results in another completely different group of users for [experiment](#terms) `B`.
2. User profile based segmentation: Manually assign a specific group of users to a cohort. This can be used to achieve features like "expose a new feature to the company emplyees for internal testing". Note the profile based segmentation works independently from the percentage based method. They doesn't interfere each other.

The segmentation decisions are made base on a configuration file. The file should be `json` formated and hosted centralized place. More details about the configuration file below.

The config file can be optionaly [hashed](#Configuration-File-Hashing-and-Protecting-private-information) so the content is not reversable. In this case you can host the file publicly, for example, on you CDN server, or in a publich S3 bucket.

# Terms

**Experiment**: A subject that you want to do ab-testing with. You can have multiple experiments on going at the same time, the library can handle them independently.

**Cohort**: Inside an experiment, users are classified into groups. The groups are called Cohorts.

**`control`**: The name of the default cohort. Which is, the cohort returned when the user doesn't matche any rule on any cohorts, or the experiment just doesn't exists.

# Package API References

## For React: `@appannie/react-ab-testing`

![npm (scoped)](https://img.shields.io/npm/v/@appannie/react-ab-testing)
![npm bundle size (scoped)](https://img.shields.io/bundlephobia/min/@appannie/react-ab-testing)
![npm](https://img.shields.io/npm/dw/@appannie/react-ab-testing)

React binding for the vanilla Javascript package, featuring similar functionality.

### Installation

```sh
npm install @appannie/react-ab-testing
# or
yarn add @appannie/react-ab-testing
```

### Usage

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

## For Vanilla Javascript: `@appannie/ab-testing`

![npm (scoped)](https://img.shields.io/npm/v/@appannie/ab-testing)
![npm bundle size (scoped)](https://img.shields.io/bundlephobia/min/@appannie/ab-testing)
![npm](https://img.shields.io/npm/dw/@appannie/ab-testing)

Core Javascript package that implementing ab-testing SDK APIs.

### Installation

```sh
npm install @appannie/ab-testing
# or
yarn add @appannie/ab-testing
```

### Usage

```js
import { Experiments } from '@appannie/ab-testing';

const profile = {
    persona: user.persona,
    employee: user.isEmployee,
};

const experiments = new Experiments(config, user.id, profile);
const cohort = experiments.getCohort('experiment-name');

switch (cohort) {
    case 'blue':
        console.log('user in the blue cohort');
        break;
    case 'red':
        console.log('user in the red cohort');
        break;
    // 'control' is the default cohort. All experiments have a control cohort.
    case 'control':
    default:
        console.log('user in the control (default) cohort');
        break;
}
```

## Javascript Hashing Utils `@appannie/ab-testing-hash-object`

![npm (scoped)](https://img.shields.io/npm/v/@appannie/ab-testing-hash-object)
![npm bundle size (scoped)](https://img.shields.io/bundlephobia/min/@appannie/ab-testing-hash-object)
![npm](https://img.shields.io/npm/dw/@appannie/ab-testing-hash-object)

An helper library that implements hashing for the configurations (user profile and the configuration `force_include` section) in case you want to host the config file publicly but still keep the content private, or just don't want to leave PIIs been transmitted in plain text.

The hashing algorithm used is `sha256`, and we're using a universal implementation ([`create-hash`](https://www.npmjs.com/package/create-hash)) that'll work both in Node and the browser.

### Installation

```sh
npm install @appannie/ab-testing-hash-object
# or
yarn add @appannie/ab-testing-hash-object
```

### Usage

```js
import { hashObject } from '@appannie/ab-testing-hash-object';

const profile = hashObject(
    {
        persona: user.persona,
        employee: user.isEmployee,
    },
    salt
);

const forceIncludeCondition = hashObject(
    {
        persona: ['data analyst'],
        employee: ['yes'],
    },
    salt
);
```

You'll want to make sure the salt is the same on your server and your client for the encoding result to be the same.

## For Python: `py-ab-testing`

![PyPI](https://img.shields.io/pypi/v/py-ab-testing)
![PyPI - Python Version](https://img.shields.io/pypi/pyversions/py-ab-testing)
![PyPI - Downloads](https://img.shields.io/pypi/dw/py-ab-testing)

Python implementation for the same APIs in `@appannie/ab-testing` and `@appannie/ab-testing-hash-object`

### Installation

```sh
pip install py-ab-testing
# or
pipenv install py-ab-testing
```

### Usage

Note: The `config` variable holds an `dict` with [configuration file format that documented here](../../README.md).

```python
from ABTesting import ABTestingController

user_profile = {
    'persona': user.persona,
    'employee': user.isEmployee,
}

controller = ABTestingController(config, user.id, user_profile)
cohort = controller.get_cohort('experiment-name')

if cohort == 'blue':
    do_something()
elif cohort == 'red':
    do_something_else()
else:
    do_default_behavior()
```

### Configration Hashing

Similar to the Javascript SDKs, the package comes with an optional util for hashing private information with `sha256`.

#### Prepare config file BEFORE make it public

```python
from ABTesting.utils import hash_dict

config['salt'] = salt
for experiment in config['experiments']:
    for cohort in experiment['cohorts']:
        cohort['force_include'] = hash_dict(cohort['force_include'], salt)
```

#### In runtime

```python
from ABTesting.utils import hash_dict

hashed_user_profile = hash_dict(
    {
        'persona': user.persona,
        'employee': user.isEmployee,
    },
    salt
)

# Make sure config is hashed with the same salt
controller = ABTestingController(config, user.id, hashed_user_profile)
```

# Configuration File Reference

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

## Configuration File Hashing and Protecting private information

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

## Example configuration and common use case

### Excluding a user from an experiment

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

### Internal whitelist

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
