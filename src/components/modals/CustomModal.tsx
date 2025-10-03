import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { APP_CONSTANTS } from '../../utils/constants';

export interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'info' | 'error' | 'success' | 'warning';
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
}

const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  title,
  message,
  type = 'info',
  showCloseButton = true,
  closeOnBackdrop = true,
}) => {
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

  const getIconColor = () => {
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

  const handleBackdropPress = () => {
    if (closeOnBackdrop) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              {showCloseButton && (
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Icon name="close" size={24} color={APP_CONSTANTS.COLORS.TEXT_SECONDARY} />
                </TouchableOpacity>
              )}
              
              <View style={styles.iconContainer}>
                <Icon name={getIconName()} size={48} color={getIconColor()} />
              </View>
              
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
              
              <TouchableOpacity style={[styles.okButton, { backgroundColor: getIconColor() }]} onPress={onClose}>
                <Text style={styles.okButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: APP_CONSTANTS.SIZES.PADDING,
  },
  modalContainer: {
    backgroundColor: APP_CONSTANTS.COLORS.CARD_BACKGROUND,
    borderRadius: APP_CONSTANTS.SIZES.BORDER_RADIUS * 2,
    padding: APP_CONSTANTS.SIZES.PADDING * 2,
    minWidth: 280,
    maxWidth: '90%',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  closeButton: {
    position: 'absolute',
    right: APP_CONSTANTS.SIZES.PADDING,
    top: APP_CONSTANTS.SIZES.PADDING,
    zIndex: 1,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: APP_CONSTANTS.SIZES.MARGIN,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: APP_CONSTANTS.SIZES.MARGIN / 2,
  },
  message: {
    fontSize: 16,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: APP_CONSTANTS.SIZES.MARGIN * 1.5,
    lineHeight: 22,
  },
  okButton: {
    paddingHorizontal: APP_CONSTANTS.SIZES.PADDING * 2,
    paddingVertical: APP_CONSTANTS.SIZES.PADDING,
    borderRadius: APP_CONSTANTS.SIZES.BORDER_RADIUS,
    minWidth: 100,
  },
  okButtonText: {
    color: APP_CONSTANTS.COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CustomModal;
