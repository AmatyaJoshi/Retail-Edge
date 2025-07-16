import React, { useState, useRef } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { v4 } from "uuid";
import { X, Package, DollarSign, Box, Star, Tag, Hash, Barcode, Image as ImageIcon, FileText, RefreshCw } from "lucide-react";
import { useAppSelector } from "@/hooks/useAppSelector";
import type { NewProduct } from "@/state/api";


type ProductFormData = NewProduct;

type FormErrors = {
  name?: string;
  description?: string;
  price?: string;
  stockQuantity?: string;
  category?: string;
  brand?: string;
  rating?: string;
  sku?: string;
  barcode?: string;
  imageUrl?: string;
};

type CreateProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: ProductFormData) => void;
};

const PRODUCT_CATEGORIES = [
  'Eyeglasses',
  'Sunglasses',
  'Contact Lenses',
  'Frames',
  'Lens Solutions',
  'Accessories',
  'Tools',
  'Other'
];

const CreateProductModal = ({
  isOpen,
  onClose,
  onCreate,
}: CreateProductModalProps) => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const [formData, setFormData] = useState<ProductFormData>({
    productId: v4(),
    name: "",
    description: "",
    price: 0,
    stockQuantity: 0,
    category: "Eyeglasses",
    brand: "",
    rating: 0,
    sku: "",
    barcode: "",
    imageUrl: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isGeneratingSKU, setIsGeneratingSKU] = useState(false);
  const [isGeneratingBarcode, setIsGeneratingBarcode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "price" || name === "stockQuantity" || name === "rating"
          ? value === '' ? 0 : parseFloat(value)
          : value,
    });
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSaveImage = () => {
    if (selectedFile) {
      setImagePreview(URL.createObjectURL(selectedFile));
      setFormData(prev => ({ ...prev, imageUrl: URL.createObjectURL(selectedFile) }));
      setSelectedFile(null);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
  };

  // Auto-generation functions
  const handleGenerateSKU = async () => {
    setIsGeneratingSKU(true);
    try {
      const response = await fetch('/api/products/generate-sku', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: formData.category,
          brand: formData.brand
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, sku: data.sku }));
        if (errors.sku) {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.sku;
            return newErrors;
          });
        }
      }
    } catch (error) {
      console.error('Error generating SKU:', error);
    } finally {
      setIsGeneratingSKU(false);
    }
  };

  const handleGenerateAlternativeSKU = async () => {
    setIsGeneratingSKU(true);
    try {
      const response = await fetch('/api/products/generate-alternative-sku', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brand: formData.brand
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, sku: data.sku }));
        if (errors.sku) {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.sku;
            return newErrors;
          });
        }
      }
    } catch (error) {
      console.error('Error generating alternative SKU:', error);
    } finally {
      setIsGeneratingSKU(false);
    }
  };

  const handleGenerateSequentialBarcode = async () => {
    setIsGeneratingBarcode(true);
    try {
      const response = await fetch('/api/products/generate-barcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'sequential'
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, barcode: data.barcode }));
        if (errors.barcode) {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.barcode;
            return newErrors;
          });
        }
      }
    } catch (error) {
      console.error('Error generating sequential barcode:', error);
    } finally {
      setIsGeneratingBarcode(false);
    }
  };

  const handleGenerateRandomBarcode = async () => {
    setIsGeneratingBarcode(true);
    try {
      const response = await fetch('/api/products/generate-barcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'unique'
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, barcode: data.barcode }));
        if (errors.barcode) {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.barcode;
            return newErrors;
          });
        }
      }
    } catch (error) {
      console.error('Error generating random barcode:', error);
    } finally {
      setIsGeneratingBarcode(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (formData.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    if (formData.stockQuantity < 0) {
      newErrors.stockQuantity = "Stock quantity cannot be negative";
    }

    if (!formData.brand.trim()) {
      newErrors.brand = "Brand is required";
    }

    if (!formData.sku.trim()) {
      newErrors.sku = "SKU is required";
    }

    if (formData.rating < 0 || formData.rating > 5) {
      newErrors.rating = "Rating must be between 0 and 5";
    }

    if (formData.barcode && !/^[0-9]{12,13}$/.test(formData.barcode)) {
      newErrors.barcode = "Barcode must be exactly 12 or 13 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (validateForm()) {
      if (selectedFile) {
        const form = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (key !== 'imageUrl') form.append(key, value as any);
        });
        form.append('image', selectedFile);
        await fetch('/api/products', {
          method: 'POST',
          body: form,
        });
      } else {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      onClose();
      // Reset form
      setFormData({
        productId: v4(),
        name: "",
        description: "",
        price: 0,
        stockQuantity: 0,
        category: "Eyeglasses",
        brand: "",
        rating: 0,
        sku: "",
        barcode: "",
        imageUrl: "",
      });
      setImagePreview(null);
      setSelectedFile(null);
      setErrors({});
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 custom-scrollbar">
      <div className={`relative mx-auto border shadow-2xl rounded-2xl ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900'} w-full max-w-4xl max-h-[95vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-8 border-b ${isDarkMode ? 'border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700' : 'border-gray-200 bg-gradient-to-r from-gray-50 to-white'} rounded-t-2xl sticky top-0 z-10`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
              <Package className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Create New Product</h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                Add a new product to your inventory
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'}`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              {/* Product Name */}
              <div className="space-y-3">
                <label htmlFor="productName" className={`flex items-center gap-2 text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  <Package className="w-5 h-5" />
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  id="productName"
                  placeholder="Enter product name"
                  onChange={handleChange}
                  value={formData.name}
                  className={`w-full p-4 text-lg border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'} ${errors.name ? 'border-red-500' : ''}`}
                  required
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>

              {/* Brand */}
              <div className="space-y-3">
                <label htmlFor="brand" className={`flex items-center gap-2 text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  <Tag className="w-5 h-5" />
                  Brand *
                </label>
                <input
                  type="text"
                  name="brand"
                  id="brand"
                  placeholder="Enter brand name"
                  onChange={handleChange}
                  value={formData.brand}
                  className={`w-full p-4 text-lg border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'} ${errors.brand ? 'border-red-500' : ''}`}
                  required
                />
                {errors.brand && <p className="text-red-500 text-sm">{errors.brand}</p>}
              </div>

              {/* Category */}
              <div className="space-y-3">
                <label htmlFor="category" className={`flex items-center gap-2 text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  <Tag className="w-5 h-5" />
                  Category *
                </label>
                <select
                  name="category"
                  id="category"
                  onChange={handleChange}
                  value={formData.category}
                  className={`w-full p-4 text-lg border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                >
                  {PRODUCT_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* SKU */}
              <div className="space-y-3">
                <label htmlFor="sku" className={`flex items-center gap-2 text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  <Hash className="w-5 h-5" />
                  SKU *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="sku"
                    id="sku"
                    placeholder="Enter SKU or generate automatically"
                    onChange={handleChange}
                    value={formData.sku}
                    className={`flex-1 p-4 text-lg border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'} ${errors.sku ? 'border-red-500' : ''}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={handleGenerateSKU}
                    disabled={isGeneratingSKU}
                    className={`px-4 py-4 border-2 rounded-xl transition-all duration-200 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-gray-100' : 'border-gray-300 text-gray-600 hover:bg-gray-50'} ${isGeneratingSKU ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Generate SKU based on category and brand"
                  >
                    <RefreshCw className={`w-5 h-5 ${isGeneratingSKU ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateAlternativeSKU}
                    disabled={isGeneratingSKU}
                    className={`px-4 py-4 border-2 rounded-xl transition-all duration-200 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-gray-100' : 'border-gray-300 text-gray-600 hover:bg-gray-50'} ${isGeneratingSKU ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Generate SKU with date format"
                  >
                    <Tag className="w-5 h-5" />
                  </button>
                </div>
                {errors.sku && <p className="text-red-500 text-sm">{errors.sku}</p>}
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Auto-generate SKU or enter manually. Format: CAT-BRAN-0001
                </p>
              </div>

              {/* Barcode */}
              <div className="space-y-3">
                <label htmlFor="barcode" className={`flex items-center gap-2 text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  <Barcode className="w-5 h-5" />
                  Barcode (12 digits)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="barcode"
                    id="barcode"
                    placeholder="Enter 12-digit barcode or generate automatically"
                    onChange={handleChange}
                    value={formData.barcode}
                    maxLength={13}
                    className={`flex-1 p-4 text-lg border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'} ${errors.barcode ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={handleGenerateSequentialBarcode}
                    disabled={isGeneratingBarcode}
                    className={`px-4 py-4 border-2 rounded-xl transition-all duration-200 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-gray-100' : 'border-gray-300 text-gray-600 hover:bg-gray-50'} ${isGeneratingBarcode ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Generate sequential barcode"
                  >
                    <RefreshCw className={`w-5 h-5 ${isGeneratingBarcode ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateRandomBarcode}
                    disabled={isGeneratingBarcode}
                    className={`px-4 py-4 border-2 rounded-xl transition-all duration-200 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-gray-100' : 'border-gray-300 text-gray-600 hover:bg-gray-50'} ${isGeneratingBarcode ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Generate random barcode"
                  >
                    <Barcode className="w-5 h-5" />
                  </button>
                </div>
                {errors.barcode && <p className="text-red-500 text-sm">{errors.barcode}</p>}
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Auto-generate EAN-13 barcode or enter manually (12-13 digits)
                </p>
              </div>
            </div>

            {/* Right Column - Pricing & Stock */}
            <div className="space-y-6">
              {/* Price */}
              <div className="space-y-3">
                <label htmlFor="productPrice" className={`flex items-center gap-2 text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  <DollarSign className="w-5 h-5" />
                  Price *
                </label>
                <div className="relative">
                  <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>₹</span>
                  <input
                    type="number"
                    name="price"
                    id="productPrice"
                    placeholder="0.00"
                    onChange={handleChange}
                    value={formData.price}
                    className={`w-full p-4 pl-12 text-lg border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'} ${errors.price ? 'border-red-500' : ''}`}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
              </div>

              {/* Stock Quantity */}
              <div className="space-y-3">
                <label htmlFor="stockQuantity" className={`flex items-center gap-2 text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  <Box className="w-5 h-5" />
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  name="stockQuantity"
                  id="stockQuantity"
                  placeholder="0"
                  onChange={handleChange}
                  value={formData.stockQuantity}
                  className={`w-full p-4 text-lg border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'} ${errors.stockQuantity ? 'border-red-500' : ''}`}
                  min="0"
                  required
                />
                {errors.stockQuantity && <p className="text-red-500 text-sm">{errors.stockQuantity}</p>}
              </div>

              {/* Rating */}
              <div className="space-y-3">
                <label htmlFor="rating" className={`flex items-center gap-2 text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  <Star className="w-5 h-5" />
                  Rating
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="rating"
                    id="rating"
                    placeholder="0.0"
                    onChange={handleChange}
                    value={formData.rating}
                    className={`w-full p-4 pr-16 text-lg border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'} ${errors.rating ? 'border-red-500' : ''}`}
                    step="0.1"
                    min="0"
                    max="5"
                  />
                  <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>/ 5</span>
                </div>
                {errors.rating && <p className="text-red-500 text-sm">{errors.rating}</p>}
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Enter a rating between 0.0 and 5.0
                </p>
              </div>

              {/* Product Image */}
              <div className="space-y-3">
                <label className={`flex items-center gap-2 text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  <ImageIcon className="w-5 h-5" />
                  Product Image
                </label>
                <div className={`w-full h-48 rounded-xl flex items-center justify-center overflow-hidden shadow-md relative ${imagePreview ? `${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border` : `${isDarkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-50 border-gray-200'} border-2 border-dashed`}`}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Product preview" className="object-contain w-full h-full" />
                  ) : (
                    <div className="text-center">
                      <ImageIcon className={`w-12 h-12 mx-auto mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No image selected</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <button
                    type="button"
                    onClick={handleImageUploadClick}
                    className={`absolute bottom-4 right-4 ${isDarkMode ? 'bg-gray-600/80 border-gray-500 text-gray-200 hover:bg-gray-500' : 'bg-white/80 border-gray-300 text-blue-700 hover:bg-blue-50'} border rounded-full px-4 py-2 text-sm font-semibold shadow`}
                  >
                    {imagePreview ? 'Change Image' : 'Upload Image'}
                  </button>
                  {imagePreview && (
                    <div className="absolute bottom-4 left-4 flex gap-2">
                      <button
                        type="button"
                        onClick={handleSaveImage}
                        className="bg-green-500 text-white rounded-full px-4 py-2 text-sm font-semibold shadow hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="bg-red-500 text-white rounded-full px-4 py-2 text-sm font-semibold shadow hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description - Full Width */}
          <div className="space-y-3">
            <label htmlFor="description" className={`flex items-center gap-2 text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              <FileText className="w-5 h-5" />
              Description *
            </label>
            <textarea
              name="description"
              id="description"
              placeholder="Enter product description..."
              onChange={handleChange}
              value={formData.description}
              rows={4}
              className={`w-full p-4 text-lg border-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'} ${errors.description ? 'border-red-500' : ''}`}
              required
            />
            {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
          </div>

          {/* Action Buttons */}
          <div className={`flex gap-4 pt-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-4 px-6 text-lg font-semibold rounded-xl transition-all duration-200 ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-gray-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-800'}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-4 px-6 text-lg font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 shadow-lg hover:shadow-xl"
            >
              Create Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductModal;