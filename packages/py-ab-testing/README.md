# Py AB Testing

AB testing library supporting multi-variance testing with a deterministic algorithm not requiring any complex backend or database.

The segmentation logic is maintained in the AB testing client and based itself on a centralized configuration. The cohort assignment logic is deterministic and follows a simple hash pattern based on the `crc32c` algorithm (`crc32c(userId, crc32c(experimentName)) % 100`)

# Installation

```sh
pip install py-ab-testing
# or
pipenv install py-ab-testing
```

# Usage

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

# Protecting Private Information

Similar to the Javascript SDKs, the package comes with an optional util for hashing private information with `sha256`.

## Prepare config file BEFORE make it public

```python
from ABTesting.utils import hash_dict

config['salt'] = salt
for experiment in config['experiments']:
    for cohort in experiment['cohorts']:
        cohort['force_include'] = hash_dict(cohort['force_include'], salt)
```

## In runtime

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

# Credits

Made with ❤️ by [Zhang Tao](https://github.com/BananaWanted) and [Simon Boudrias](https://github.com/SBoudrias) from the App Annie Beijing office.

Available for public use under the MIT license.
