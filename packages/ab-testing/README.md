# AB Testing

AB testing library supporting multi-variance testing with a deterministic algorithm not requiring any complex backend or database.

The segmentation logic is maintained in the AB testing client and based itself on a centralized configuration. The cohort assignment logic is deterministic and follows a simple hash pattern based on the `crc32c` algorithm (`crc32c(userId + crc32c(experimentName)) % 100`)

# Installation

```sh
npm install @appannie/ab-testing
# or
yarn add @appannie/ab-testing
```

# Usage

Note: The [configuration file format is documented here](../../README.md).

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

# Credits

Made with ❤️ by [Zhang Tao](https://github.com/BananaWanted) and [Simon Boudrias](https://github.com/SBoudrias) from the App Annie Beijing office.

Available for public use under the MIT license.
