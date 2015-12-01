# React YellowBox

> This is a direct port of React Native’s YellowBox developer tool to React.js.
> Original source can be viewed at:
> https://github.com/facebook/react-native/blob/master/Libraries/ReactIOS/YellowBox.js


YellowBox renders warnings at the bottom of the app being developed.

Warnings help guard against subtle yet significant issues that can impact the
quality of the app. This "in your face" style of warning allows developers to
notice and correct these issues as quickly as possible.

By default, the warning box is enabled when the NODE_ENV is not 'production'.
Set the following flag to disable it (and call `console.warn` to update any
rendered <YellowBox>):

```js
  console.disableYellowBox = true;
  console.warn('YellowBox is disabled.');
```

Warnings can be ignored programmatically by setting the array:

```js
  console.ignoredYellowBox = ['Warning: ...'];
```

Strings in `console.ignoredYellowBox` can be a prefix of the warning that
should be ignored.

## Example Usage

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import YellowBox from 'yellowbox-react';
import App from './your-app.js';

// ignore HMR (hot module replacement) warnings
console.ignoredYellowBox = ['[HMR]'];

ReactDOM.render((
  <div>
    <App />
    <YellowBox />
  </div>
), document.getElemenById('app'));
```

## License

Copyright (c) 2015 Dustan Kasten | dustan.kasten@gmail.com
Licensed under the MIT license.

