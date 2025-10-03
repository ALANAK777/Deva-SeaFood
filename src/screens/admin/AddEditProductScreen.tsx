import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
  ActionSheetIOS,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { APP_CONSTANTS } from '../../utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { Product, CreateProductData, productService } from '../../services/productService';
import { cloudinaryService } from '../../services/cloudinaryService';
import { CustomModal, ToastModal, ConfirmModal, InputModal } from '../../components/modals';
import { useModal } from '../../hooks/useModal';

interface AddEditProductScreenProps {
  navigation: any;
  route?: {
    params?: {
      product?: Product;
    };
  };
}

export const AddEditProductScreen: React.FC<AddEditProductScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const isEditing = !!route?.params?.product;
  const existingProduct = route?.params?.product;
  
  const { 
    showModal, 
    isModalVisible, 
    modalProps, 
    hideModal,
    showToast, 
    isToastVisible, 
    toastProps, 
    hideToast,
    showConfirm,
    isConfirmVisible,
    confirmProps,
    hideConfirm,
    showInput,
    isInputVisible,
    inputProps,
    hideInput
  } = useModal();

  const [formData, setFormData] = useState<CreateProductData>({
    name: '',
    description: '',
    price: 0,
    category: 'Fresh Fish',
    image_url: '',
    stock_quantity: 0,
    unit: 'kg',
    is_available: true,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imagePickerLoading, setImagePickerLoading] = useState(false);
  const [uploadingToCloudinary, setUploadingToCloudinary] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const categories = [
    'Fresh Fish',
    'Prawns & Shrimp',
    'Crabs',
    'Dried Fish',
    'Fish Curry Cut',
  ];

  const units = ['kg', 'piece', 'gram'];

  useEffect(() => {
    if (isEditing && existingProduct) {
      setFormData({
        name: existingProduct.name,
        description: existingProduct.description,
        price: existingProduct.price,
        category: existingProduct.category,
        image_url: existingProduct.image_url || '',
        stock_quantity: existingProduct.stock_quantity,
        unit: existingProduct.unit,
        is_available: existingProduct.is_available,
      });
      
      // Set the selected image for editing mode
      if (existingProduct.image_url) {
        setSelectedImage(existingProduct.image_url);
      }
    }
  }, [isEditing, existingProduct]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (!formData.stock_quantity || formData.stock_quantity < 0) {
      newErrors.stock_quantity = 'Stock quantity cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      if (isEditing && existingProduct) {
        await productService.updateProduct(existingProduct.id, formData);
        showToast('Product updated successfully', 'success');
      } else {
        await productService.createProduct(formData);
        showToast('Product created successfully', 'success');
      }

      navigation.goBack();
    } catch (error: any) {
      showModal('Error', error.message || 'Failed to save product', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof CreateProductData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || galleryStatus !== 'granted') {
      showModal(
        'Permissions Required',
        'Please grant camera and gallery permissions to add product images.',
        'warning'
      );
      return false;
    }
    return true;
  };

  const uploadImageToCloudinary = async (imageUri: string): Promise<string> => {
    try {
      setUploadingToCloudinary(true);
      console.log('📤 Uploading image to Cloudinary:', imageUri);
      
      const cloudinaryUrl = await cloudinaryService.uploadImage(imageUri, {
        folder: 'products',
        tags: ['product', 'fishmarket'],
      });
      
      console.log('✅ Image uploaded to Cloudinary:', cloudinaryUrl);
      return cloudinaryUrl;
    } catch (error: any) {
      console.error('❌ Cloudinary upload failed:', error);
      showModal(
        'Upload Failed',
        'Failed to upload image to cloud storage. Please try again.',
        'error'
      );
      throw error;
    } finally {
      setUploadingToCloudinary(false);
    }
  };

  const pickImageFromCamera = async () => {
    try {
      setImagePickerLoading(true);
      const hasPermissions = await requestPermissions();
      if (!hasPermissions) return;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const localImageUri = result.assets[0].uri;
        setSelectedImage(localImageUri);
        
        // Upload to Cloudinary in the background
        try {
          const cloudinaryUrl = await uploadImageToCloudinary(localImageUri);
          updateFormData('image_url', cloudinaryUrl);
          setSelectedImage(cloudinaryUrl);
          setUploadSuccess(true);
          
          // Hide success indicator after 3 seconds
          setTimeout(() => setUploadSuccess(false), 3000);
        } catch (error) {
          // Keep the local image if Cloudinary upload fails
          updateFormData('image_url', localImageUri);
        }
      }
    } catch (error) {
      showModal('Error', 'Failed to take photo', 'error');
    } finally {
      setImagePickerLoading(false);
    }
  };

  const pickImageFromGallery = async () => {
    try {
      setImagePickerLoading(true);
      const hasPermissions = await requestPermissions();
      if (!hasPermissions) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const localImageUri = result.assets[0].uri;
        setSelectedImage(localImageUri);
        
        // Upload to Cloudinary in the background
        try {
          const cloudinaryUrl = await uploadImageToCloudinary(localImageUri);
          updateFormData('image_url', cloudinaryUrl);
          setSelectedImage(cloudinaryUrl);
          setUploadSuccess(true);
          
          // Hide success indicator after 3 seconds
          setTimeout(() => setUploadSuccess(false), 3000);
        } catch (error) {
          // Keep the local image if Cloudinary upload fails
          updateFormData('image_url', localImageUri);
        }
      }
    } catch (error) {
      showModal('Error', 'Failed to pick image', 'error');
    } finally {
      setImagePickerLoading(false);
    }
  };

  // Note: Individual gallery/camera buttons are now used instead of showImagePickerOptions

  const renderInput = (
    label: string,
    field: keyof CreateProductData,
    placeholder: string,
    keyboardType: 'default' | 'numeric' | 'email-address' = 'default',
    multiline: boolean = false
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
          errors[field] && styles.inputError,
        ]}
        placeholder={placeholder}
        value={String(formData[field])}
        onChangeText={(text) => {
          const value = keyboardType === 'numeric' ? parseFloat(text) || 0 : text;
          updateFormData(field, value);
        }}
        keyboardType={keyboardType}
        multiline={multiline}
        placeholderTextColor={APP_CONSTANTS.COLORS.TEXT_SECONDARY}
      />
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  const renderPicker = (
    label: string,
    field: keyof CreateProductData,
    options: string[]
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pickerContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.pickerOption,
              formData[field] === option && styles.selectedPickerOption,
            ]}
            onPress={() => updateFormData(field, option)}
          >
            <Text
              style={[
                styles.pickerOptionText,
                formData[field] === option && styles.selectedPickerOptionText,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={APP_CONSTANTS.COLORS.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Product' : 'Add New Product'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Image Preview */}
        <View style={styles.imageSection}>
          <Text style={styles.label}>Product Image</Text>
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: selectedImage || formData.image_url || 'https://via.placeholder.com/150x150/CCCCCC/FFFFFF?text=No+Image',
              }}
              style={styles.imagePreview}
            />
            
            {/* Upload Success Indicator */}
            {uploadSuccess && (
              <View style={styles.uploadSuccessIndicator}>
                <Ionicons name="checkmark-circle" size={24} color={APP_CONSTANTS.COLORS.SUCCESS} />
                <Text style={styles.uploadSuccessText}>Uploaded to Cloud</Text>
              </View>
            )}
            <View style={styles.imageButtonsContainer}>
              <TouchableOpacity 
                style={[
                  styles.imagePickerButton, 
                  styles.galleryButton,
                  (imagePickerLoading || uploadingToCloudinary) && styles.imagePickerButtonDisabled
                ]}
                onPress={pickImageFromGallery}
                disabled={imagePickerLoading || uploadingToCloudinary}
              >
                <Ionicons 
                  name="images-outline" 
                  size={20} 
                  color={APP_CONSTANTS.COLORS.PRIMARY} 
                />
                <Text style={styles.imagePickerText}>
                  {Platform.OS === 'ios' ? 'Gallery' : 'Gallery'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.imagePickerButton, 
                  styles.cameraButton,
                  (imagePickerLoading || uploadingToCloudinary) && styles.imagePickerButtonDisabled
                ]}
                onPress={pickImageFromCamera}
                disabled={imagePickerLoading || uploadingToCloudinary}
              >
                <Ionicons 
                  name="camera-outline" 
                  size={20} 
                  color={APP_CONSTANTS.COLORS.PRIMARY} 
                />
                <Text style={styles.imagePickerText}>
                  Camera
                </Text>
              </TouchableOpacity>
            </View>
            
            {(imagePickerLoading || uploadingToCloudinary) && (
              <View style={styles.uploadStatus}>
                <Ionicons 
                  name={
                    uploadingToCloudinary ? "cloud-upload-outline" : "hourglass-outline"
                  } 
                  size={16} 
                  color={APP_CONSTANTS.COLORS.TEXT_SECONDARY} 
                />
                <Text style={styles.uploadStatusText}>
                  {uploadingToCloudinary ? 'Uploading to Cloud...' : 'Processing...'}
                </Text>
              </View>
            )}
            
            {(selectedImage || formData.image_url) && (
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => {
                  setSelectedImage(null);
                  updateFormData('image_url', '');
                }}
              >
                <Ionicons name="trash-outline" size={16} color="#F44336" />
                <Text style={styles.removeImageText}>Remove Image</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.manualUrlButton}
              onPress={() => {
                if (Platform.OS === 'ios') {
                  showInput(
                    'Image URL',
                    'Enter image URL manually (optional)',
                    async (url: string) => {
                      if (url && url.trim()) {
                        const trimmedUrl = url.trim();
                        
                        // If it's already a Cloudinary or external URL, use it directly
                        if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
                          setSelectedImage(trimmedUrl);
                          updateFormData('image_url', trimmedUrl);
                        } else {
                          // If it's a local path, try to upload to Cloudinary
                          try {
                            const cloudinaryUrl = await uploadImageToCloudinary(trimmedUrl);
                            setSelectedImage(cloudinaryUrl);
                            updateFormData('image_url', cloudinaryUrl);
                          } catch (error) {
                            setSelectedImage(trimmedUrl);
                            updateFormData('image_url', trimmedUrl);
                          }
                        }
                      }
                    },
                    'Enter URL here...',
                    'text',
                    formData.image_url
                  );
                } else {
                  // For Android, we'll just show an info message
                  showModal(
                    'Manual URL Entry',
                    'Manual URL entry is available on iOS. For Android, please use camera or gallery options.',
                    'info'
                  );
                }
              }}
            >
              <Ionicons name="link-outline" size={16} color={APP_CONSTANTS.COLORS.TEXT_SECONDARY} />
              <Text style={styles.manualUrlText}>Add URL manually</Text>
            </TouchableOpacity>
          </View>
        </View>

        {renderInput('Product Name', 'name', 'Enter product name')}
        {renderInput('Description', 'description', 'Enter product description', 'default', true)}
        {renderInput('Price (₹)', 'price', 'Enter price', 'numeric')}
        {renderInput('Stock Quantity', 'stock_quantity', 'Enter stock quantity', 'numeric')}

        {renderPicker('Category', 'category', categories)}
        {renderPicker('Unit', 'unit', units)}

        {/* Availability Toggle */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Availability</Text>
          <View style={styles.switchContainer}>
            <Switch
              value={formData.is_available}
              onValueChange={(value) => updateFormData('is_available', value)}
              trackColor={{
                false: APP_CONSTANTS.COLORS.BORDER,
                true: APP_CONSTANTS.COLORS.PRIMARY,
              }}
              thumbColor={formData.is_available ? '#FFFFFF' : '#F4F3F4'}
            />
            <Text style={styles.switchLabel}>
              {formData.is_available ? 'Available for sale' : 'Not available'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : (isEditing ? 'Update Product' : 'Add Product')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <CustomModal
        visible={isModalVisible}
        onClose={hideModal}
        title={modalProps.title}
        message={modalProps.message}
        type={modalProps.type}
      />
      
      <ConfirmModal
        visible={isConfirmVisible}
        onClose={hideConfirm}
        onConfirm={confirmProps.onConfirm}
        title={confirmProps.title}
        message={confirmProps.message}
        type={confirmProps.type}
        confirmText={confirmProps.confirmText}
        cancelText={confirmProps.cancelText}
      />
      
      <InputModal
        visible={isInputVisible}
        onClose={hideInput}
        onConfirm={inputProps.onConfirm}
        title={inputProps.title}
        message={inputProps.message}
        placeholder={inputProps.placeholder}
        inputType={inputProps.inputType}
        defaultValue={inputProps.defaultValue}
        confirmText={inputProps.confirmText}
        cancelText={inputProps.cancelText}
      />
      
      <ToastModal
        visible={isToastVisible}
        message={toastProps.message}
        type={toastProps.type}
        duration={toastProps.duration}
        onHide={hideToast}
      />
    </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: APP_CONSTANTS.COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: APP_CONSTANTS.SIZES.PADDING,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: APP_CONSTANTS.COLORS.BORDER,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginLeft: -40, // Compensate for back button
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: APP_CONSTANTS.SIZES.PADDING,
  },
  imageSection: {
    marginBottom: 24,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  imagePreview: {
    width: 150,
    height: 150,
    borderRadius: 12,
    marginBottom: 12,
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  imagePickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: APP_CONSTANTS.COLORS.PRIMARY,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  galleryButton: {
    // Additional styles for gallery button if needed
  },
  cameraButton: {
    // Additional styles for camera button if needed
  },
  imagePickerButtonDisabled: {
    opacity: 0.6,
  },
  imagePickerText: {
    marginLeft: 6,
    color: APP_CONSTANTS.COLORS.PRIMARY,
    fontWeight: '600',
    fontSize: 14,
  },
  uploadStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  uploadStatusText: {
    marginLeft: 6,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
    fontSize: 14,
    fontStyle: 'italic',
  },
  removeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  removeImageText: {
    marginLeft: 4,
    color: '#F44336',
    fontSize: 14,
  },
  manualUrlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 4,
  },
  manualUrlText: {
    marginLeft: 4,
    color: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: APP_CONSTANTS.COLORS.BORDER,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
    backgroundColor: '#FFFFFF',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#F44336',
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    marginTop: 4,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: APP_CONSTANTS.COLORS.BORDER,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  selectedPickerOption: {
    backgroundColor: APP_CONSTANTS.COLORS.PRIMARY,
    borderColor: APP_CONSTANTS.COLORS.PRIMARY,
  },
  pickerOptionText: {
    fontSize: 14,
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
  },
  selectedPickerOptionText: {
    color: '#FFFFFF',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    marginLeft: 12,
    fontSize: 16,
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
    marginBottom: 32,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: APP_CONSTANTS.COLORS.BORDER,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: APP_CONSTANTS.COLORS.TEXT_PRIMARY,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: APP_CONSTANTS.COLORS.PRIMARY,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  uploadSuccessIndicator: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
  },
  uploadSuccessText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
