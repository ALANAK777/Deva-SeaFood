import axios from 'axios';

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
}

interface CloudinaryErrorResponse {
  error: {
    message: string;
    http_code: number;
  };
}

class CloudinaryService {
  private cloudName: string;
  private uploadPreset: string;

  constructor() {
    const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error(
        'Cloudinary configuration missing. Please add EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME and EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET to your .env file'
      );
    }

    this.cloudName = cloudName;
    this.uploadPreset = uploadPreset;
  }

  /**
   * Upload image to Cloudinary from a file URI or base64 string
   * @param imageUri - The local file URI from expo-image-picker or base64 string
   * @param options - Additional upload options
   * @returns Promise resolving to Cloudinary secure URL
   */
  async uploadImage(
    imageUri: string, 
    options?: {
      folder?: string;
      tags?: string[];
      transformation?: string;
      public_id?: string;
    }
  ): Promise<string> {
    try {
      console.log('🔄 Starting Cloudinary upload...');
      
      // Create FormData for the upload
      const formData = new FormData();
      
      // Handle different types of image input
      if (imageUri.startsWith('data:')) {
        // Base64 image
        formData.append('file', imageUri);
      } else if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
        // Remote URL - just return it if it's already a Cloudinary URL
        if (imageUri.includes('cloudinary.com')) {
          console.log('✅ Image is already a Cloudinary URL');
          return imageUri;
        }
        formData.append('file', imageUri);
      } else {
        // Local file URI
        const filename = imageUri.split('/').pop() || 'image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formData.append('file', {
          uri: imageUri,
          type: type,
          name: filename,
        } as any);
      }

      // Add required parameters
      formData.append('upload_preset', this.uploadPreset);
      
      // Add optional parameters
      if (options?.folder) {
        formData.append('folder', options.folder);
      }
      
      if (options?.tags && options.tags.length > 0) {
        formData.append('tags', options.tags.join(','));
      }
      
      if (options?.public_id) {
        formData.append('public_id', options.public_id);
      }

      // Add automatic optimization
      formData.append('quality', 'auto');
      formData.append('fetch_format', 'auto');

      const uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
      
      console.log('🌐 Uploading to Cloudinary...');
      
      const response = await axios.post<CloudinaryUploadResponse>(uploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout
      });

      console.log('✅ Cloudinary upload successful:', response.data.secure_url);
      
      return response.data.secure_url;
    } catch (error: any) {
      console.error('❌ Cloudinary upload failed:', error);
      
      if (axios.isAxiosError(error)) {
        const cloudinaryError = error.response?.data as CloudinaryErrorResponse;
        if (cloudinaryError?.error) {
          throw new Error(`Cloudinary upload failed: ${cloudinaryError.error.message}`);
        }
        throw new Error(`Upload failed: ${error.message}`);
      }
      
      throw new Error('Failed to upload image to Cloudinary');
    }
  }

  /**
   * Upload multiple images to Cloudinary
   * @param imageUris - Array of image URIs
   * @param options - Upload options
   * @returns Promise resolving to array of Cloudinary URLs
   */
  async uploadMultipleImages(
    imageUris: string[],
    options?: {
      folder?: string;
      tags?: string[];
      public_id?: string;
    }
  ): Promise<string[]> {
    try {
      console.log(`🔄 Uploading ${imageUris.length} images to Cloudinary...`);
      
      const uploadPromises = imageUris.map((uri, index) =>
        this.uploadImage(uri, {
          ...options,
          public_id: options?.public_id ? `${options.public_id}_${index}` : undefined,
        })
      );

      const results = await Promise.all(uploadPromises);
      console.log('✅ All images uploaded successfully');
      return results;
    } catch (error) {
      console.error('❌ Multiple image upload failed:', error);
      throw error;
    }
  }

  /**
   * Delete image from Cloudinary
   * @param publicId - The public_id of the image to delete
   * @returns Promise resolving to deletion result
   */
  async deleteImage(publicId: string): Promise<boolean> {
    try {
      console.log('🗑️ Deleting image from Cloudinary:', publicId);
      
      // Note: For security reasons, deletion requires server-side implementation
      // with API secret. This is a placeholder for future implementation.
      console.warn('⚠️ Image deletion requires server-side implementation for security');
      return true;
    } catch (error) {
      console.error('❌ Failed to delete image:', error);
      return false;
    }
  }

  /**
   * Generate optimized Cloudinary URL with transformations
   * @param publicId - The public_id of the image
   * @param transformations - Array of transformation strings
   * @returns Optimized Cloudinary URL
   */
  generateOptimizedUrl(
    publicId: string,
    transformations: string[] = ['q_auto', 'f_auto']
  ): string {
    const transformationString = transformations.join(',');
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformationString}/${publicId}`;
  }

  /**
   * Extract public_id from Cloudinary URL
   * @param cloudinaryUrl - The Cloudinary URL
   * @returns The public_id or null if not a valid Cloudinary URL
   */
  extractPublicId(cloudinaryUrl: string): string | null {
    try {
      if (!cloudinaryUrl.includes('cloudinary.com')) {
        return null;
      }

      const regex = /\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/;
      const match = cloudinaryUrl.match(regex);
      return match ? match[1] : null;
    } catch (error) {
      console.error('Failed to extract public_id:', error);
      return null;
    }
  }
}

// Export singleton instance
export const cloudinaryService = new CloudinaryService();

// Export types
export type {
  CloudinaryUploadResponse,
  CloudinaryErrorResponse,
};
