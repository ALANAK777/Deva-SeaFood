import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { APP_CONSTANTS } from '../../utils/constants';

export interface InputModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (input: string) => void;
  title: string;
  message: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  inputType?: 'text' | 'numeric' | 'password';
  defaultValue?: string;
  closeOnBackdrop?: boolean;
}

const InputModal: React.FC<InputModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  placeholder = '',
  confirmText = 'OK',
  cancelText = 'Cancel',
  inputType = 'text',
  defaultValue = '',
  closeOnBackdrop = true,
}) => {
  const [inputValue, setInputValue] = React.useState(defaultValue);

  React.useEffect(() => {
    if (visible) {
      setInputValue(defaultValue);
    }
  }, [visible, defaultValue]);

  const handleBackdropPress = () => {
    if (closeOnBackdrop) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm(inputValue);
    onClose();
  };

  const getKeyboardType = () => {
    switch (inputType) {
      case 'numeric':
        return 'numeric';
      default:
        return 'default';
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
              <View style={styles.iconContainer}>
                <Icon name="create-outline" size={48} color={APP_CONSTANTS.COLORS.PRIMARY} />
              </View>
              
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
              
              <TextInput
                style={styles.textInput}
                value={inputValue}
                onChangeText={setInputValue}
                placeholder={placeholder}
                placeholderTextColor={APP_CONSTANTS.COLORS.TEXT_SECONDARY}
                keyboardType={getKeyboardType()}
                secureTextEntry={inputType === 'password'}
                autoFocus={true}
                selectionColor={APP_CONSTANTS.COLORS.PRIMARY}
              />
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                  <Text style={styles.cancelButtonText}>{cancelText}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.confirmButton} 
                  onPress={handleConfirm}
                >
                  <Text style={styles.confirmButtonText}>{confirmText}</Text>
                </TouchableOpacity>
              </View>
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
    marginBottom: APP_CONSTANTS.SIZES.MARGIN,
    lineHeight: 22,
  },
  textInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: APP_CONSTANTS.COLORS.BORDER,
    borderRadius: APP_CONSTANTS.SIZES.BORDER_RADIUS,
    paddingHorizontal: APP_CONSTANTS.SIZES.PADDING,
    paddingVertical: APP_CONSTANTS.SIZES.PADDING / 1.5,
    fontSize: 16,
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    backgroundColor: APP_CONSTANTS.COLORS.WHITE,
    marginBottom: APP_CONSTANTS.SIZES.MARGIN * 1.5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: APP_CONSTANTS.SIZES.MARGIN,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: APP_CONSTANTS.SIZES.PADDING,
    borderRadius: APP_CONSTANTS.SIZES.BORDER_RADIUS,
    borderWidth: 1,
    borderColor: APP_CONSTANTS.COLORS.BORDER,
    backgroundColor: APP_CONSTANTS.COLORS.LIGHT_GRAY,
  },
  cancelButtonText: {
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: APP_CONSTANTS.SIZES.PADDING,
    borderRadius: APP_CONSTANTS.SIZES.BORDER_RADIUS,
    backgroundColor: APP_CONSTANTS.COLORS.PRIMARY,
  },
  confirmButtonText: {
    color: APP_CONSTANTS.COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default InputModal;
