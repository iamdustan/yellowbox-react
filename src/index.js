/** @flow */

'use strict';

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  _warningEmitter,
  _warningMap,
  isWarningIgnored,
} from './common';

const WarningRow = ({count, warning, onClick}) => {
  const countText = count > 1 ?
    <span style={styles.listRowCount}>{'(' + count + ') '}</span> :
    null;

  return (
    <div style={styles.listRow}>
      <button
        onClick={onClick}
        style={styles.listRowContent}>
        <span style={styles.listRowText}>
          {countText}
          {warning}
        </span>
      </button>
    </div>
  );
};

const WarningInspector = ({
  count,
  warning,
  onClose,
  onDismiss,
  onDismissAll,
}) => {
  const countSentence =
    'Warning encountered ' + count + ' time' + (count - 1 ? 's' : '') + '.';

  return (
    <div
      tabIndex={0}
      onClick={onClose}
      style={styles.inspector}>
      <div style={styles.inspectorContent}>
        <div style={styles.inspectorCount}>
          <span style={styles.inspectorCountText}>{countSentence}</span>
        </div>
        <div style={styles.inspectorWarning}>
          <span style={styles.inspectorWarningText}>{warning}</span>
        </div>
        <div style={styles.inspectorButtons}>
          <button
            onClick={onDismiss}
            style={styles.inspectorButton}>
            <span style={styles.inspectorButtonText}>Dismiss</span>
          </button>
          <button
            onClick={onDismissAll}
            style={styles.inspectorButton}>
            <span style={styles.inspectorButtonText}>
              Dismiss All
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

class YellowBox extends Component {
  state: {
    inspecting: ?string;
    warningMap: Map;
  };
  _listener: any;
  dismissWarning: Function;

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
        this.setState({warningMap });
      });
    });
  }

  componentWillUnmount() {
    if (this._listener && typeof this._listener.remove === 'function') {
      this._listener.remove();
    }
  }

  render():?ReactElement {
    if (console.disableYellowBox || this.state.warningMap.size === 0) {
      return null;
    }

    const {inspecting} = this.state;
    const inspector = inspecting !== null ?
      <WarningInspector
        count={this.state.warningMap.get(inspecting)}
        warning={inspecting}
        onClose={() => this.setState({inspecting: null})}
        onDismiss={() => this.dismissWarning(inspecting)}
        onDismissAll={() => this.dismissWarning(null)}
      /> :
      null;

    const rows = [];
    this.state.warningMap.forEach((count, warning) => {
      if (!isWarningIgnored(warning)) {
        rows.push(
          <WarningRow
            key={warning}
            count={count}
            warning={warning}
            onClick={() => this.setState({inspecting: warning})}
            onDismiss={() => this.dismissWarning(warning)}
          />
        );
      }
    });

    const listStyle = Object.assign(
      {},
      styles.list,
      // Additional `0.4` so the 5th row can peek into view.
      {height: Math.min(rows.length, 4.4) * (rowGutter + rowHeight)},
      this.props.style
    );
    return (
      <div style={inspector ? styles.fullScreen : listStyle}>
        <div style={Object.assign({}, listStyle, {overflowY: 'auto'})}>
          {rows}
        </div>
        {inspector}
      </div>
    );
  }
}

YellowBox.propTypes = {
  style: PropTypes.object
};

const backgroundColor = opacity => 'rgba(250, 186, 48, ' + opacity + ')';
const textColor = 'white';
const rowGutter = 0;
const rowHeight = 46;

var styles = {
  fullScreen: {
    backgroundColor: 'transparent',
    position: 'fixed',
    display: 'flex',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 10000
  },
  inspector: {
    backgroundColor: backgroundColor(0.95),
    flex: 1
  },
  inspectorContainer: {
    flex: 1
  },
  inspectorButtons: {
    flexDirection: 'row',
    position: 'absolute',
    left: 200,
    right: 0,
    top: 0
  },
  inspectorButton: {
    background: 'transparent',
    border: 0,
    flex: 1,
    padding: 22
  },
  inspectorButtonText: {
    color: textColor,
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center'
  },
  inspectorContent: {
    flex: 1,
    paddingTop: 5
  },
  inspectorCount: {
    padding: 15,
    paddingBottom: 0
  },
  inspectorCountText: {
    color: textColor,
    fontSize: 14
  },
  inspectorWarning: {
    padding: 15,
    position: 'absolute',
    top: 39,
    bottom: 300,
    left: 0,
    right: 0
  },
  inspectorWarningText: {
    color: textColor,
    fontSize: 16,
    fontWeight: '600'
  },
  list: {
    backgroundColor: 'transparent',
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0
  },
  listRow: {
    position: 'relative',
    backgroundColor: backgroundColor(0.95),
    borderWidth: '1px 0',
    borderStyle: 'solid none',
    borderTopColor: 'rgba(255, 255, 255, 0.5)',
    borderBottomColor: 'rgba(250, 186, 48, 1)',
    height: rowHeight - 2, // for border
    marginTop: rowGutter,
  },
  listRowContent: {
    background: 'transparent',
    border: 0,
    lineHeight: rowHeight + 'px',
    textAlign: 'left',
    width: '100%',
  },
  listRowCount: {
    color: 'rgba(255, 255, 255, 0.5)'
  },
  listRowText: {
    color: textColor,
    marginLeft: 15,
    marginRight: 15
  }
};

export default YellowBox;
