/** @flow */

import {EventEmitter} from 'events';

export const _warningEmitter = new EventEmitter();
export const _warningMap = new Map();

/**
 * YellowBox renders warnings at the bottom of the app being developed.
 *
 * Warnings help guard against subtle yet significant issues that can impact the
 * quality of the app. This "in your face" style of warning allows developers to
 * notice and correct these issues as quickly as possible.
 *
 * By default, the warning box is enabled when the NODE_ENV is not 'production'.
 * Set the following flag to disable it (and call `console.warn` to update any
 * rendered <YellowBox>):
 *
 *   console.disableYellowBox = true;
 *   console.warn('YellowBox is disabled.');
 *
 * Warnings can be ignored programmatically by setting the array:
 *
 *   console.ignoredYellowBox = ['Warning: ...'];
 *
 * Strings in `console.ignoredYellowBox` can be a prefix of the warning that
 * should be ignored.
 */

if (process.env.NODE_ENV !== 'production') {
  const {error, warn} = console;
  console.error = function() {
    error.apply(console, arguments);
    // Show yellow box for the `warning` module.
    if (typeof arguments[0] === 'string' &&
        arguments[0].startsWith('Warning: ')) {
      updateWarningMap.apply(null, arguments);
    }
  };
  console.warn = function() {
    // this is a cheap trick to keep blessed environment from printining
    // warnings in the UI while still allowing React web to print them.
    if (typeof window !== 'undefined') {
      warn.apply(console, arguments);
    }
    updateWarningMap.apply(null, arguments);
  };
}

/**
 * Simple function for formatting strings.
 *
 * Replaces placeholders with values passed as extra arguments
 *
 * @param {string} format the base string
 * @param ...args the values to insert
 * @return {string} the replaced string
 */
function sprintf(format, ...args) {
  var index = 0;
  return format.replace(/%s/g, match => args[index++]);
}

function updateWarningMap(format, ...args): void {
  const stringifySafe = require('json-stringify-safe');

  format = String(format);
  const argCount = (format.match(/%s/g) || []).length;
  const warning = [
    sprintf(format, ...args.slice(0, argCount)),
    ...args.slice(argCount).map(arg => stringifySafe(arg)),
  ].join(' ');

  const count = _warningMap.has(warning) ? _warningMap.get(warning) : 0;
  _warningMap.set(warning, count + 1);
  _warningEmitter.emit('warning', _warningMap);
}

export function isWarningIgnored(warning: string): boolean {
  return (
    Array.isArray(console.ignoredYellowBox) &&
    console.ignoredYellowBox.some(
      ignorePrefix => warning.startsWith(ignorePrefix)
    )
  );
}
