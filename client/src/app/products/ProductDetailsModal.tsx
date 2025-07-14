"use client";

import type { Product } from "@/state/api";
import { X, Edit2, Check, X as XIcon, Printer } from "lucide-react";
import { useState, useRef } from "react";
import Rating from "@/app/components/Rating";
import Barcode from "react-barcode";
import { useAppSelector } from "@/hooks/useAppSelector";
import BarcodePrintingModal from "@/app/components/BarcodePrintingModal";

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onUpdate: (productId: string, updates: Partial<Product>) => Promise<void>;
  onDelete: (productId: string) => Promise<void>;
}

const ProductDetailsModal = ({ isOpen, onClose, product, onUpdate, onDelete }: ProductDetailsModalProps) => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Product>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(product.imageUrl || null);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleEdit = (field: string) => {
    setEditingField(field);
    setEditValues({ [field]: product[field as keyof Product] });
  };

  const handleEditAll = () => {
    setIsEditing(true);
    setEditingField('all');
    setEditValues({ ...product });
  };

  const handleSave = async (field: string) => {
    try {
      await onUpdate(product.productId, { [field]: editValues[field as keyof Product] });
      setEditingField(null);
    } catch (error) {
      console.error('Failed to update product:', error);
      alert('Failed to update product');
    }
  };

  const handleSaveAll = async () => {
    try {
      await onUpdate(product.productId, editValues);
      setIsEditing(false);
      setEditingField(null);
    } catch (error) {
      console.error('Failed to update product:', error);
      alert('Failed to update product');
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValues({});
  };

  const handleCancelAll = () => {
    setIsEditing(false);
    setEditingField(null);
    setEditValues({});
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPendingImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSaveImage = () => {
    if (pendingImage) {
      setImagePreview(pendingImage);
      setPendingImage(null);
      onUpdate(product.productId, { imageUrl: pendingImage });
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setPendingImage(null);
    onUpdate(product.productId, { imageUrl: "" });
  };

  const renderEditableField = (
    field: string,
    label: string,
    value: any,
    type: 'text' | 'number' | 'textarea' = 'text',
    className: string = '',
    inputProps: any = {}
  ) => (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</h3>
      </div>
      {isEditing || editingField === field ? (
        <div className="flex items-center gap-2">
          {type === 'textarea' ? (
            <textarea
              value={editValues[field as keyof Product] as string || ''}
              onChange={(e) => setEditValues({ ...editValues, [field]: e.target.value })}
              className={`w-full p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'} ${className}`}
              rows={3}
              {...inputProps}
            />
          ) : (
            <input
              type={type}
              value={editValues[field as keyof Product] || ''}
              onChange={(e) => {
                const val = type === 'number' ? Number(e.target.value) : e.target.value;
                setEditValues({ ...editValues, [field]: val });
              }}
              className={`w-full p-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'} ${className}`}
              {...inputProps}
            />
          )}
          <button
            onClick={() => handleSave(field)}
            className="text-green-500 hover:text-green-700 transition-colors"
          >
            <Check className="w-5 h-5" />
          </button>
          <button
            onClick={handleCancel}
            className="text-red-500 hover:text-red-700 transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <p className={`${isDarkMode ? 'text-gray-100' : 'text-gray-900'} ${className}`}>{value}</p>
      )}
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div
          className={`${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900'} border rounded-2xl p-10 max-w-6xl w-full mx-auto relative shadow-2xl max-h-[95vh] overflow-y-auto custom-scrollbar`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Floating close button */}
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 ${isDarkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-white border-gray-200 hover:bg-gray-100'} border rounded-full p-2 shadow transition z-20`}
            title="Close"
          >
            <X className={`w-6 h-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`} />
          </button>
          {/* Single edit pen icon at top right */}
          <button
            onClick={isEditing ? handleCancelAll : handleEditAll}
            className="absolute top-4 right-16 text-blue-500 hover:text-blue-700 transition-colors z-10"
            title={isEditing ? 'Cancel Edit' : 'Edit All'}
          >
            {isEditing ? <XIcon className="w-6 h-6" /> : <Edit2 className="w-6 h-6" />}
          </button>
          {/* Save button appears when editing */}
          {isEditing && (
            <button
              onClick={handleSaveAll}
              className="absolute top-4 right-32 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-colors z-10 border border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
              <Check className="w-5 h-5 mr-1" />
              Save Changes
            </button>
          )}

          <div className="flex flex-col md:flex-row gap-12">
            {/* Product Image Section (Left Column) */}
            <div className={`w-full md:w-1/2 flex flex-col items-center justify-start ${isDarkMode ? 'bg-gray-700' : 'bg-white'} rounded-xl p-8 space-y-8`}>
              <div className={`w-[450px] h-[450px] rounded-xl flex items-center justify-center overflow-hidden shadow-md relative ${imagePreview || pendingImage ? `${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border` : `${isDarkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-50 border-gray-200'} border-2 border-dashed`}`}>
                {pendingImage ? (
                  <img src={pendingImage} alt="Product preview" className="object-contain w-full h-full" />
                ) : imagePreview ? (
                  <img src={imagePreview} alt="Product" className="object-contain w-full h-full" />
                ) : (
                  <svg className={`w-36 h-36 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="40" r="12" stroke="currentColor" strokeWidth="2" fill="none" />
                    <circle cx="48" cy="40" r="12" stroke="currentColor" strokeWidth="2" fill="none" />
                    <path d="M4 40c0-6 4-12 12-12m32 0c8 0 12 6 12 12" stroke="currentColor" strokeWidth="2" fill="none" />
                    <path d="M28 40h8" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
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
                  {imagePreview || pendingImage ? 'Change Image' : 'Upload Image'}
                </button>
                {(pendingImage || imagePreview) && (
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    {pendingImage && (
                      <button
                        type="button"
                        onClick={handleSaveImage}
                        className="bg-green-500 text-white rounded-full px-4 py-2 text-sm font-semibold shadow hover:bg-green-600"
                      >
                        Save
                      </button>
                    )}
                    {(pendingImage || imagePreview) && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="bg-red-500 text-white rounded-full px-4 py-2 text-sm font-semibold shadow hover:bg-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </div>
              {/* Product Overview (Description) - moved here */}
              <div className="w-full">
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-3`}>About this item</h3>
                <div className={`border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-100'} mb-4`} />
                {renderEditableField('description', 'Description', product.description, 'textarea', `${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-base leading-relaxed`, { rows: 6 })}
              </div>
            </div>

            {/* Product Details Section (Right Column) */}
            <div className="w-full md:w-1/2 space-y-6">
              {/* Product Name & Brand */}
              <div>
                <h3 className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase mb-1 tracking-wider`}>Product Info</h3>
                {renderEditableField('brand', 'Brand', product.brand, 'text', `${isDarkMode ? 'text-blue-400' : 'text-blue-700'} text-base uppercase font-semibold mb-2`)}
                {renderEditableField('name', 'Product Name', product.name, 'text', `text-3xl font-extrabold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} leading-tight`)}
              </div>
              <div className={`border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-100'} my-4`} />

              {/* SKU */}
              {renderEditableField('sku', 'SKU', product.sku, 'text', `text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`)}

              {/* Barcode (Real EAN) */}
              <div className="mb-4 flex flex-col gap-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider`}>Barcode</h3>
                  {product.barcode && (
                    <button
                      onClick={() => setShowPrintModal(true)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isDarkMode 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                      }`}
                    >
                      <Printer className="w-4 h-4" />
                      Print
                    </button>
                  )}
                </div>
                <div className="flex flex-col items-center">
                  {product.barcode && /^[0-9]{12}$/.test(product.barcode) ? (
                    <Barcode value={product.barcode} width={4} height={48} fontSize={16} displayValue background="#fff" lineColor="#222" />
                  ) : product.barcode ? (
                    <div className={`px-4 py-2 ${isDarkMode ? 'bg-yellow-900/30 border-yellow-600 text-yellow-300' : 'bg-yellow-100 border-yellow-400 text-yellow-700'} border rounded-lg font-mono text-lg tracking-widest select-none shadow-inner`} style={{ minWidth: '120px' }}>
                      Invalid barcode
                    </div>
                  ) : (
                    <div className={`px-4 py-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-gray-100 border-gray-300 text-gray-400'} border rounded-lg font-mono text-lg tracking-widest italic select-none shadow-inner`} style={{ minWidth: '120px' }}>
                      No barcode
                    </div>
                  )}
                </div>
              </div>
              <div className={`border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-100'} my-4`} />

              {/* Rating */}
              {product.rating !== undefined && (
                <div className="flex items-center gap-3">
                  <Rating rating={editingField === 'rating' ? (editValues.rating ?? product.rating) : product.rating} />
                  <span className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-700 hover:text-blue-900'} cursor-pointer text-base font-semibold`}>
                    {(editingField === 'rating' ? (editValues.rating ?? product.rating) : product.rating)?.toFixed(1)} out of 5 stars
                  </span>
                  {editingField === 'rating' ? (
                    <div className="flex items-center gap-3 ml-6">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={editValues.rating ?? ''}
                        onChange={(e) => setEditValues({ ...editValues, rating: Number(e.target.value) })}
                        className={`w-28 p-2 border rounded-md text-base ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                      <button
                        onClick={() => handleSave('rating')}
                        className={`p-2 text-green-600 ${isDarkMode ? 'hover:bg-green-900/30' : 'hover:bg-green-50'} rounded-full transition-colors`}
                      >
                        <Check className="w-6 h-6" />
                      </button>
                      <button
                        onClick={handleCancel}
                        className={`p-2 text-red-600 ${isDarkMode ? 'hover:bg-red-900/30' : 'hover:bg-red-50'} rounded-full transition-colors`}
                      >
                        <XIcon className="w-6 h-6" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEdit('rating')}
                      className={`p-2 text-blue-600 ${isDarkMode ? 'hover:bg-blue-900/30' : 'hover:bg-blue-50'} rounded-full transition-colors ml-6`}
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}
              <div className={`border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-100'} my-4`} />

              {/* Price */}
              {renderEditableField('price', 'Price', ` 9${product.price.toFixed(2)}`, 'number', `text-2xl font-extrabold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`, { step: "0.01" })}

              {/* Stock Quantity */}
              {renderEditableField('stockQuantity', 'Availability', product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of Stock', 'number', product.stockQuantity > 0 ? `text-base ${isDarkMode ? 'text-green-400' : 'text-green-700'} font-semibold` : `text-base ${isDarkMode ? 'text-red-400' : 'text-red-700'} font-semibold`, { step: "1", min: "0" })}

              {/* Category and Product ID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div>
                  <h3 className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase mb-1 tracking-wider`}>Category</h3>
                  <span className={`inline-block px-3 py-1 ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-700'} rounded-full text-xs font-semibold capitalize`}>{product.category}</span>
                </div>
                <div>
                  <h3 className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase mb-1 tracking-wider`}>Product ID</h3>
                  <p className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-800'} break-all`}>{product.productId}</p>
                </div>
              </div>

              {/* Delete Button */}
              <div className="mt-8">
                <button
                  onClick={() => setShowDeleteWarning(true)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-colors"
                >
                  Delete Product
                </button>
              </div>
              {/* Caution Modal */}
              {showDeleteWarning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                  <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900'} border rounded-xl p-8 shadow-2xl max-w-md w-full flex flex-col items-center`}>
                    <h2 className="text-2xl font-bold text-red-700 mb-4">Caution!</h2>
                    <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 text-center`}>Are you sure you want to <span className='font-bold text-red-600'>delete this product</span>? This action <span className='font-bold'>cannot be undone</span>.</p>
                    <div className="flex gap-4">
                      <button
                        onClick={async () => {
                          try {
                            await onDelete(product.productId);
                            setShowDeleteWarning(false);
                            onClose();
                          } catch (error) {
                            console.error('Failed to delete product:', error);
                            alert('Failed to delete product.');
                          }
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full shadow"
                      >
                        Yes, Delete
                      </button>
                      <button
                        onClick={() => setShowDeleteWarning(false)}
                        className={`${isDarkMode ? 'bg-gray-600 hover:bg-gray-700 text-gray-100' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} font-bold py-2 px-6 rounded-full shadow`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Barcode Printing Modal */}
      <BarcodePrintingModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        products={[product]}
        title={`Print Barcode - ${product.name}`}
      />
    </>
  );
};

export default ProductDetailsModal;