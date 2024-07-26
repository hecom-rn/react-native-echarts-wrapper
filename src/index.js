import React, { Component } from "react";
import { View } from "react-native";
import PropTypes from "prop-types";
import { WebView } from "react-native-webview";

import * as jsBuilder from "./jsBuilder";

class ECharts extends Component {
  static propTypes = {
    onData: PropTypes.func,
    legacyMode: PropTypes.bool,
    canvas: PropTypes.bool,
    onLoadEnd: PropTypes.func,
    backgroundColor: PropTypes.string,
    customTemplatePath: PropTypes.string,
    customSource: PropTypes.any,
    requestDisallowInterceptTouchEvent: PropTypes.bool,
  };

  static defaultProps = {
    onData: () => {},
    legacyMode: false,
    canvas: false,
    onLoadEnd: () => {},
    backgroundColor: "rgba(0, 0, 0, 0)",
    requestDisallowInterceptTouchEvent: true,
  };

  constructor(props) {
    super(props);
    this.onGetHeight = null;
    this.callbacks = {};
  }

  onMessage = (e) => {
    try {
      if (!e) return null;

      const { onData } = this.props;

      const data = JSON.parse(unescape(unescape(e.nativeEvent.data)));

      if (data.types === "DATA") {
        onData(data.payload);
      } else if (data.types === "CALLBACK") {
        /* eslint-disable no-case-declarations */
        const { uuid } = data;
        /* eslint-enable no-case-declarations */
        this.callbacks[uuid](data.payload);
      }
    } catch (error) {
      console.log(error);
    }
  };

  postMessage = (data) => {
    this.webview.postMessage(jsBuilder.convertToPostMessageString(data));
  };

  ID = () => `_${Math.random().toString(36).substr(2, 9)}`;

  setBackgroundColor = (color) => {
    const data = {
      types: "SET_BACKGROUND_COLOR",
      color,
    };
    this.postMessage(data);
  };

  getOption = (callback, properties = undefined) => {
    const uuid = this.ID();
    this.callbacks[uuid] = callback;
    const data = {
      types: "GET_OPTION",
      uuid,
      properties,
    };
    this.postMessage(data);
  };

  setOption = (option, notMerge, lazyUpdate) => {
    const data = {
      types: "SET_OPTION",
      payload: {
        option,
        notMerge: notMerge || false,
        lazyUpdate: lazyUpdate || false,
      },
    };
    this.postMessage(data);
  };

  setDataZoom = (start, end) => {
    const data = {
      types: "SET_ZOOM",
      start,
      end,
    };
    this.postMessage(data);
  };

  legendUnSelect = (name) => {
    const data = {
      types: "legendUnSelect",
      name,
    };
    this.postMessage(data);
  };

  legendSelect = (name) => {
    const data = {
      types: "legendSelect",
      name,
    };
    this.postMessage(data);
  };

  highlight = (config = {}) => {
    const data = {
      types: "highlight",
      config,
    };
    this.postMessage(data);
  };

  downplay = (config = {}) => {
    const data = {
      types: "downplay",
      config,
    };
    this.postMessage(data);
  };

  hideTip = () => this.postMessage({ types: "hideTip" });

  clear = () => {
    const data = {
      types: "CLEAR",
    };
    this.postMessage(data);
  };

  getWebViewRef = (ref) => {
    this.webview = ref;
  };

  onLoadEnd = () => {
    if (this.webview) {
      this.webview.injectJavaScript(jsBuilder.getJavascriptSource(this.props));
    }
    this.props.onLoadEnd();
  };

  render() {
    let source = {};
    if (this.props.customSource) {
      source = this.props.customSource;
    } else if (this.props.customTemplatePath) {
      source = {
        uri: this.props.customTemplatePath,
      };
    }

    return (
      <View style={{ flex: 1 }}>
        <WebView
          ref={this.getWebViewRef}
          originWhitelist={["*"]}
          scrollEnabled={false}
          source={source}
          style={{ opacity: 0.99 }} // 处理android 在webView中的crash
          onMessage={this.onMessage}
          allowFileAccess
          allowUniversalAccessFromFileURLs
          mixedContentMode="always"
          onLoadEnd={this.onLoadEnd}
          requestDisallowInterceptTouchEvent={
            this.props.requestDisallowInterceptTouchEvent
          }
        />
      </View>
    );
  }
}

export { ECharts };
