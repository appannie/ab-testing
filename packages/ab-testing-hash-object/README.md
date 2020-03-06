# Hash object

Utility to hash common objects used within the ab-testing framework (user profile and the configuration `force_include` section.)

The hashing algorithm used is `sha256`, and we're using a universal implementation ([`create-hash`](https://www.npmjs.com/package/create-hash)) that'll work both in Node and the browser.

# Installation

```sh
npm install @appannie/ab-testing-hash-object
# or
yarn add @appannie/ab-testing-hash-object
```

# Usage

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

# Credits

Made with ❤️ by [Zhang Tao](https://github.com/BananaWanted) and [Simon Boudrias](https://github.com/SBoudrias) from the App Annie Beijing office.

Available for public use under the MIT license.
