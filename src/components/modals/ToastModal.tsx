import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { APP_CONSTANTS } from '../../utils/constants';

export interface ToastModalProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onHide: () => void;
}

const ToastModal: React.FC<ToastModalProps> = ({
  visible,
  message,
  type = 'success',
  duration = 3000,
  onHide,
}) => {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timeout = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timeout);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      case 'warning':
        return 'warning';
      default:
        return 'information-circle';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return APP_CONSTANTS.COLORS.SUCCESS;
      case 'error':
        return APP_CONSTANTS.COLORS.ERROR;
      case 'warning':
        return APP_CONSTANTS.COLORS.WARNING;
      default:
        return APP_CONSTANTS.COLORS.PRIMARY;
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
      onRequestClose={hideToast}
    >
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.toastContainer,
            {
              backgroundColor: getBackgroundColor(),
              opacity: opacity,
              transform: [{ translateY: translateY }],
            },
          ]}
        >
          <Icon name={getIconName()} size={20} color={APP_CONSTANTS.COLORS.WHITE} />
          <Text style={styles.message} numberOfLines={2}>
            {message}
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: APP_CONSTANTS.SIZES.PADDING,
  },
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: APP_CONSTANTS.SIZES.PADDING,
    paddingHorizontal: APP_CONSTANTS.SIZES.PADDING * 1.5,
    borderRadius: APP_CONSTANTS.SIZES.BORDER_RADIUS * 2,
    marginTop: 10,
    maxWidth: '95%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  message: {
    color: APP_CONSTANTS.COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: APP_CONSTANTS.SIZES.MARGIN,
    flex: 1,
  },
});

export default ToastModal;
