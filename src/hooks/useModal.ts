import { useState } from 'react';

export interface UseModalReturn {
  // Custom Modal
  showModal: (title: string, message: string, type?: 'info' | 'error' | 'success' | 'warning') => void;
  isModalVisible: boolean;
  modalProps: {
    title: string;
    message: string;
    type: 'info' | 'error' | 'success' | 'warning';
  };
  hideModal: () => void;

  // Confirm Modal
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    type?: 'danger' | 'warning' | 'info',
    confirmText?: string,
    cancelText?: string
  ) => void;
  isConfirmVisible: boolean;
  confirmProps: {
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'info';
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
  };
  hideConfirm: () => void;

  // Input Modal
  showInput: (
    title: string,
    message: string,
    onConfirm: (input: string) => void,
    placeholder?: string,
    inputType?: 'text' | 'numeric' | 'password',
    defaultValue?: string,
    confirmText?: string,
    cancelText?: string
  ) => void;
  isInputVisible: boolean;
  inputProps: {
    title: string;
    message: string;
    placeholder: string;
    inputType: 'text' | 'numeric' | 'password';
    defaultValue: string;
    confirmText: string;
    cancelText: string;
    onConfirm: (input: string) => void;
  };
  hideInput: () => void;

  // Toast Modal
  showToast: (
    message: string,
    type?: 'success' | 'error' | 'warning' | 'info',
    duration?: number
  ) => void;
  isToastVisible: boolean;
  toastProps: {
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration: number;
  };
  hideToast: () => void;
}

export const useModal = (): UseModalReturn => {
  // Custom Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalProps, setModalProps] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'error' | 'success' | 'warning',
  });

  // Confirm Modal State
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [confirmProps, setConfirmProps] = useState({
    title: '',
    message: '',
    type: 'info' as 'danger' | 'warning' | 'info',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: () => {},
  });

  // Input Modal State
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [inputProps, setInputProps] = useState({
    title: '',
    message: '',
    placeholder: '',
    inputType: 'text' as 'text' | 'numeric' | 'password',
    defaultValue: '',
    confirmText: 'OK',
    cancelText: 'Cancel',
    onConfirm: (_input: string) => {},
  });

  // Toast Modal State
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [toastProps, setToastProps] = useState({
    message: '',
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    duration: 3000,
  });

  // Custom Modal Methods
  const showModal = (
    title: string,
    message: string,
    type: 'info' | 'error' | 'success' | 'warning' = 'info'
  ) => {
    setModalProps({ title, message, type });
    setIsModalVisible(true);
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  // Confirm Modal Methods
  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: 'danger' | 'warning' | 'info' = 'info',
    confirmText: string = 'Confirm',
    cancelText: string = 'Cancel'
  ) => {
    setConfirmProps({ title, message, type, confirmText, cancelText, onConfirm });
    setIsConfirmVisible(true);
  };

  const hideConfirm = () => {
    setIsConfirmVisible(false);
  };

  // Input Modal Methods
  const showInput = (
    title: string,
    message: string,
    onConfirm: (input: string) => void,
    placeholder: string = '',
    inputType: 'text' | 'numeric' | 'password' = 'text',
    defaultValue: string = '',
    confirmText: string = 'OK',
    cancelText: string = 'Cancel'
  ) => {
    setInputProps({
      title,
      message,
      placeholder,
      inputType,
      defaultValue,
      confirmText,
      cancelText,
      onConfirm,
    });
    setIsInputVisible(true);
  };

  const hideInput = () => {
    setIsInputVisible(false);
  };

  // Toast Modal Methods
  const showToast = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'success',
    duration: number = 3000
  ) => {
    setToastProps({ message, type, duration });
    setIsToastVisible(true);
  };

  const hideToast = () => {
    setIsToastVisible(false);
  };

  return {
    // Custom Modal
    showModal,
    isModalVisible,
    modalProps,
    hideModal,

    // Confirm Modal
    showConfirm,
    isConfirmVisible,
    confirmProps,
    hideConfirm,

    // Input Modal
    showInput,
    isInputVisible,
    inputProps,
    hideInput,

    // Toast Modal
    showToast,
    isToastVisible,
    toastProps,
    hideToast,
  };
};
