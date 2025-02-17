import * as React from 'react';
import {
  Animated,
  BackHandler,
  Easing,
  StyleProp,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import Surface from './Surface';
import { withTheme } from '../core/theming';
import { Theme } from '../types';

type Props = {
  /**
   * Determines whether clicking outside the modal dismiss it.
   */
  dismissable?: boolean;
  /**
   * Callback that is called when the user dismisses the modal.
   */
  onDismiss?: () => void;
  /**
   * Determines Whether the modal is visible.
   */
  visible: boolean;
  /**
   * Content of the `Modal`.
   */
  children: React.ReactNode;
  /**
   * Style for the content of the modal
   */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /**
   * @optional
   * Overrides Styles for the Wrapper element.
   */
  wrapperStyle?: StyleProp<ViewStyle>;
  /**
   * @optional
   */
  theme: Theme;
};

type State = {
  opacity: Animated.Value;
  rendered: boolean;
};

/**
 * The Modal component is a simple way to present content above an enclosing view.
 * To render the `Modal` above other components, you'll need to wrap it with the [`Portal`](portal.html) component.
 *
 * ## Usage
 * ```js
 * import * as React from 'react';
 * import { Modal, Portal, Text, Button, Provider } from 'react-native-paper';
 *
 * export default class MyComponent extends React.Component {
 *   state = {
 *     visible: false,
 *   };
 *
 *   _showModal = () => this.setState({ visible: true });
 *   _hideModal = () => this.setState({ visible: false });
 *
 *   render() {
 *     const { visible } = this.state;
 *     return (
 *       <Provider>
 *          <Portal>
 *            <Modal visible={visible} onDismiss={this._hideModal}>
 *              <Text>Example Modal</Text>
 *            </Modal>
 *            <Button
 *              style={{ marginTop: 30 }}
 *              onPress={this._showModal}
 *            >
 *              Show
 *            </Button>
 *          </Portal>
 *       </Provider>
 *     );
 *   }
 * }
 * ```
 */

class Modal extends React.Component<Props, State> {
  static defaultProps = {
    dismissable: true,
    visible: false,
  };

  static getDerivedStateFromProps(nextProps: Props, prevState: State) {
    if (nextProps.visible && !prevState.rendered) {
      return {
        rendered: true,
      };
    }

    return null;
  }

  state = {
    opacity: new Animated.Value(this.props.visible ? 1 : 0),
    rendered: this.props.visible,
  };

  componentDidUpdate(prevProps: Props) {
    if (prevProps.visible !== this.props.visible) {
      if (this.props.visible) {
        this._showModal();
      } else {
        this._hideModal();
      }
    }
  }

  _handleBack = () => {
    if (this.props.dismissable) {
      this._hideModal();
    }
    return true;
  };

  _showModal = () => {
    const {
      theme: {
        animation: { scale },
      },
    } = this.props;

    BackHandler.removeEventListener('hardwareBackPress', this._handleBack);
    BackHandler.addEventListener('hardwareBackPress', this._handleBack);
    Animated.timing(this.state.opacity, {
      toValue: 1,
      duration: scale * 280,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  _hideModal = () => {
    const {
      theme: {
        animation: { scale },
      },
    } = this.props;

    BackHandler.removeEventListener('hardwareBackPress', this._handleBack);
    Animated.timing(this.state.opacity, {
      toValue: 0,
      duration: scale * 280,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) {
        return;
      }
      if (this.props.visible && this.props.onDismiss) {
        this.props.onDismiss();
      }
      if (this.props.visible) {
        this._showModal();
      } else {
        this.setState({
          rendered: false,
        });
      }
    });
  };

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this._handleBack);
  }

  render() {
    if (!this.state.rendered) return null;

    const { children, dismissable, theme, wrapperStyle, contentContainerStyle } = this.props;
    const { colors } = theme;
    return (
      <Animated.View
        pointerEvents={this.props.visible ? 'auto' : 'none'}
        accessibilityViewIsModal
        accessibilityLiveRegion="polite"
        style={StyleSheet.absoluteFill}
      >
        <TouchableWithoutFeedback
          onPress={dismissable ? this._hideModal : undefined}
        >
          <Animated.View
            style={[
              styles.backdrop,
              { backgroundColor: colors.backdrop, opacity: this.state.opacity },
            ]}
          />
        </TouchableWithoutFeedback>
        <View
          pointerEvents="box-none"
          style={[
            styles.wrapper,
            wrapperStyle
          ] as StyleProp<ViewStyle>
          }
          >
          <Surface
            style={
              [
                { opacity: this.state.opacity },
                styles.content,
                contentContainerStyle,
              ] as StyleProp<ViewStyle>
            }
          >
            {children}
          </Surface>
        </View>
      </Animated.View>
    );
  }
}

export default withTheme(Modal);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  wrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
  },
  content: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
  },
});
