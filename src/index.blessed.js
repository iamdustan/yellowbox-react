/** @flow */

'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  _warningEmitter,
  _warningMap,
  isWarningIgnored,
} from './common';

const MIN_ROW_HEIGHT = 3;
const MAX_ROW_HEIGHT = 5;
const ROWS_TO_DISPLAY = 3.5;

const styles = {
  base: {
    left: '0',
    width: '100%',
  },

  warningText: {
    style: {
      bg: 'yellow',
      fg: 'black',
    },
    width: '95%',
    border: {type: 'line', fg: 'yellow', bg: 'yellow'},
  },
  dismissButton: {
    left: '95%',
    width: '5%',
    border: {type: 'line', fg: 'red'},
    hover: {
      border: {type: 'line', fg: 'yellow'}
    },
  },
};

const WarningRow = ({
  count,
  warning,
  onDismiss,
  top,
  height,
}) => (
  <box top={top} height={height}>
    <box class={styles.warningText} height={height}>
      {`(${count}) ${warning}`}
    </box>
    <box
      clickable={true}
      height={height}
      class={styles.dismissButton}
      onClick={onDismiss}>×</box>
  </box>
);


class Yellowbox extends Component {
  constructor(props: mixed, context: mixed) {
    super(props, context);
    this.state = {
      inspecting: null,
      warningMap: _warningMap,
    };
    this.dismissWarning = warning => {
      const {inspecting, warningMap} = this.state;
      if (warning) {
        warningMap.delete(warning);
      } else {
        warningMap.clear();
      }
      this.setState({
        inspecting: (warning && inspecting !== warning) ? inspecting : null,
        warningMap,
      });
    };
  }

  componentDidMount() {
    let scheduled = null;
    this._listener = _warningEmitter.addListener('warning', warningMap => {
      // Use `setImmediate` because warnings often happen during render, but
      // state cannot be set while rendering.
      scheduled = scheduled || setImmediate(() => {
        scheduled = null;
        this.setState({warningMap});
      });
    });
  }

  componentWillUnmount() {
    if (this._listener && typeof this._listener.remove === 'function') {
      this._listener.remove();
    }
  }

  render() {
    const {layout, style} = this.props;

    if (console.disableYellowBox || this.state.warningMap.size === 0) {
      // react blessed needs a null element
      return (
        <element class={{top: '100%', width: '0%'}}>nada</element>
      );
    }

    const rowHeight = Math.max(MIN_ROW_HEIGHT, Math.min(
      MAX_ROW_HEIGHT,
      Math.floor(layout.height / ROWS_TO_DISPLAY)
    ));
    const rows = [];

    this.state.warningMap.forEach((count, warning) => {
      if (!isWarningIgnored(warning)) {
        rows.push(
          <WarningRow
            key={warning}
            top={rowHeight * rows.length}
            height={rowHeight}
            count={count}
            warning={warning}
            onClick={() => this.setState({inspecting: warning})}
            onDismiss={() => this.dismissWarning(warning)}
          />
        );
      }
    });

    return (
      <box
        class={styles.base}
        {...style}
        {...layout}
        scrollable={true}
        alwaysScroll={true}
      >
        {rows}
      </box>
    );
  }
};

Yellowbox.propTypes = {
  layout: PropTypes.shape({
    height: PropTypes.number
  }),
};

Yellowbox.defaultProps = {
  style: {},
};

export default Yellowbox;
