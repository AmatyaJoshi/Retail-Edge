"use client";

import { useCreateProductMutation, useGetProductsQuery, useUpdateProductMutation, useDeleteProductMutation } from "@/state/api";
import type { Product, NewProduct } from "@/state/api";
import { PlusCircleIcon, SearchIcon, ChevronLeft, ChevronRight, ArrowDownWideNarrow, ArrowUpWideNarrow, Printer, ChevronDown } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import Header from "@/app/components/Header";
import Rating from "@/app/components/Rating";
import CreateProductModal from "./CreateProductModal";
import ProductDetailsModal from "./ProductDetailsModal";
import BarcodePrintingModal from "@/app/components/BarcodePrintingModal";
import Image from "next/image";
import { useProductsDataUpdater } from "@/app/hooks/use-page-data-updater";

// Eyewear SVG icon from svgrepo.com
const EyewearIcon = () => (
  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="40" r="12" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="48" cy="40" r="12" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M4 40c0-6 4-12 12-12m32 0c8 0 12 6 12 12" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M28 40h8" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

type ProductFormData = NewProduct;

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const {
    data: products,
    isLoading,
    isError,
    refetch
  } = useGetProductsQuery({ searchTerm, sortField, sortOrder });

  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  // Update page data for AI Assistant
  useProductsDataUpdater(products || [], 'Products');

  // Use products directly for filtering and rendering, but normalize category for filtering and category list
  const preferredOrder = ['frames', 'sunglasses', 'lenses', 'accessories'];
  const categories = useMemo(() => {
    if (!products) return ['all'];
    const unique = Array.from(new Set(products.map(p => typeof p.category === 'string' ? p.category.toLowerCase() : 'uncategorized')));
    const ordered = [
      'all',
      ...preferredOrder.filter(cat => unique.includes(cat)),
      ...unique.filter(cat => !preferredOrder.includes(cat) && cat !== 'all').sort()
    ];
    return ordered;
  }, [products]);

  // Remove the handleSetCategory function since we're calling setFilterCategory directly

  const filteredProducts = (products || []).filter(product => {
    const productCategory = (product.category || 'uncategorized').toLowerCase();
    const matchesCategory = filterCategory === 'all' || productCategory === filterCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Use filteredProducts for rendering and pagination as before
  const totalPages = filteredProducts ? Math.ceil(filteredProducts.length / itemsPerPage) : 0;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts?.slice(startIndex, endIndex);

  const handleCreateProduct = async (productData: ProductFormData) => {
    try {
      await createProduct(productData);
      refetch();
    } catch (error) {
      console.error("Failed to create product:", error);
      alert("Failed to create product.");
    }
  };

  const handleReduceStock = async (product: Product) => {
    const amount = window.prompt(`Enter amount to reduce from current stock (${product.stockQuantity}):`);
    if (amount === null) return; // User cancelled

    const reduceAmount = parseInt(amount);
    if (isNaN(reduceAmount) || reduceAmount <= 0) {
      alert("Please enter a valid positive number");
      return;
    }

    if (reduceAmount > product.stockQuantity) {
      alert("Cannot reduce more than current stock");
      return;
    }

    try {
      await updateProduct({
        productId: product.productId,
        updates: { stockQuantity: product.stockQuantity - reduceAmount }
      });
      refetch();
    } catch (error) {
      console.error("Failed to update stock:", error);
      alert("Failed to update stock.");
    }
  };

  const handleUpdateProduct = async (productId: string, updates: Partial<Product> | FormData) => {
    try {
      if (!(updates instanceof FormData)) {
      setSelectedProduct(prev => {
        if (prev && prev.productId === productId) {
          return { ...prev, ...updates };
        }
        return prev;
      });
      }
      await updateProduct({
        productId,
        updates,
      });
      refetch();
    } catch (error) {
      console.error("Failed to update product:", error);
      alert("Failed to update product.");
      refetch();
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId);
      refetch();
      // No need to close modal here, it's handled in ProductDetailsModal after successful deletion
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Failed to delete product.");
    }
  };

  // Selection functions
  const toggleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const enterSelectionMode = () => {
    setIsSelectionMode(true);
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedProducts(new Set());
  };

  const selectAllProducts = () => {
    if (products) {
      setSelectedProducts(new Set(products.map(p => p.productId)));
    }
  };

  const clearSelection = () => {
    setSelectedProducts(new Set());
  };

  const getSelectedProducts = () => {
    return products?.filter(p => selectedProducts.has(p.productId)) || [];
  };

  // Calculate pagination
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Reset pagination when filterCategory changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterCategory]);

  // Capitalize category names for display
  const displayCategory = (cat: string) => cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1);

  if (isLoading) {
    return <div className="py-4">Loading...</div>;
  }

  if (isError || !products) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch products
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-950 overflow-x-hidden pt-20">
      <div className="w-full px-4 md:px-8 flex flex-col h-full">
        {/* Header Section */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">Products</h1>
        <p className="text-gray-600 dark:text-gray-300 text-base mb-4">Browse, search, and manage your store's product catalog. Add new products, update stock, and keep your inventory up to date for seamless sales and operations.</p>

        {/* Controls Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 mb-4 shadow-sm flex flex-col gap-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="relative flex-grow max-w-xl flex items-center gap-2">
              <input
                className="w-full pl-8 pr-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-400 bg-white dark:bg-gray-900 shadow-sm font-sans text-sm transition focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
            </div>
            {/* Filter and Sort Controls */}
            <div className="flex gap-2 items-center mt-2 md:mt-0">
              {/* Category Filter Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center justify-between px-4 py-2.5 rounded-full border-2 border-gray-200 dark:border-gray-600 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 text-gray-700 dark:text-gray-100 font-semibold shadow-lg hover:shadow-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-200 focus:outline-none text-sm hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900 dark:hover:to-blue-800 hover:border-blue-300 dark:hover:border-blue-500 hover:scale-105"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  style={{ minWidth: '160px' }}
                >
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    {displayCategory(filterCategory)}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showCategoryDropdown && (
                  <div className="absolute left-0 mt-3 w-56 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-2xl shadow-2xl z-50 py-3 backdrop-blur-sm">
                    <div className="px-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Categories</span>
                    </div>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setFilterCategory(cat.toLowerCase());
                          setShowCategoryDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm rounded-xl mx-2 my-1 transition-all duration-200 font-medium hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900 dark:hover:to-blue-800 ${
                        filterCategory === cat.toLowerCase() 
                          ? 'bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 text-blue-700 dark:text-blue-200 font-semibold shadow-md' 
                          : 'text-gray-700 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-300'
                      }`}
                      >
                        <div className="flex items-center gap-3">
                          {filterCategory === cat.toLowerCase() && (
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          )}
                          <span className={filterCategory === cat.toLowerCase() ? 'ml-0' : 'ml-4'}>
                            {displayCategory(cat)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Sort Controls (existing) */}
              <div className="flex gap-1 items-center">
                <select
                  className="py-1 px-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-100 font-medium shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition focus:outline-none text-sm"
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value)}
                >
                  <option value="name">Sort by Name</option>
                  <option value="rating">Sort by Rating</option>
                  <option value="stockQuantity">Sort by Stock</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="p-1.5 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition focus:outline-none"
                >
                  {sortOrder === "asc" ? <ArrowUpWideNarrow className="w-4 h-4" /> : <ArrowDownWideNarrow className="w-4 h-4" />}
                </button>
              </div>
              {!isSelectionMode ? (
                <button
                  onClick={enterSelectionMode}
                  className="flex items-center bg-gray-600 hover:bg-gray-700 text-white font-bold py-1.5 px-4 rounded-md shadow ml-1 transition focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                >
                  Select
                </button>
              ) : (
                <button
                  onClick={exitSelectionMode}
                  className="flex items-center bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 px-4 rounded-md shadow ml-1 transition focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                >
                  Cancel
                </button>
              )}
              <button
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-4 rounded-md shadow ml-1 transition focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                onClick={() => setIsModalOpen(true)}
              >
                <PlusCircleIcon className="w-4 h-4 mr-1 !text-white" /> Create Product
              </button>
            </div>
          </div>
          
          {/* Bulk Actions */}
          {isSelectionMode && (
            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedProducts.size} product{selectedProducts.size !== 1 ? 's' : ''} selected
                </span>
                {selectedProducts.size > 0 && (
                  <button
                    onClick={clearSelection}
                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Clear selection
                  </button>
                )}
                {selectedProducts.size === 0 && (
                  <button
                    onClick={selectAllProducts}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Select all
                  </button>
                )}
              </div>
              {selectedProducts.size > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPrintModal(true)}
                    disabled={getSelectedProducts().filter(p => p.barcode).length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm"
                  >
                    <Printer className="w-4 h-4" />
                    Print Barcodes ({getSelectedProducts().filter(p => p.barcode).length})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Content: Products Grid */}
        <div className="flex-1 min-h-0">
          <div className="border rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 p-3 h-full overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-y-5 gap-x-3 w-full">
              {isLoading ? (
                <div>Loading...</div>
              ) : (
                currentProducts?.map((product) => (
                  <div
                    key={product.productId}
                    className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-400 hover:scale-[1.025] transition-all duration-200 flex flex-col h-full group ${
                      selectedProducts.has(product.productId) ? 'ring-2 ring-blue-500 border-blue-500' : ''
                    }`}
                  >
                    {/* Selection Checkbox */}
                    {isSelectionMode && (
                      <div className="p-2 flex justify-end">
                        <input
                          type="checkbox"
                          checked={selectedProducts.has(product.productId)}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleProductSelection(product.productId);
                          }}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                    )}
                    
                    <div 
                      className="p-3 flex flex-col items-center flex-1 cursor-pointer"
                      onClick={() => {
                        if (!isSelectionMode) {
                          setSelectedProduct(product);
                        }
                      }}
                    >
                      {/* Product Image - Full width upper section */}
                      <div className="w-full mb-3">
                        <div className="w-full h-48 bg-white dark:bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                          {product.imageUrl ? (
                            <Image
                              src={`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001'}/api/product-image/${product.imageUrl.startsWith('http') ? product.imageUrl.split('/').pop() : product.imageUrl}`}
                              alt={product.name}
                              width={192}
                              height={192}
                              className="object-cover w-full h-full"
                              unoptimized
                            />
                          ) : (
                            <EyewearIcon />
                          )}
                        </div>
                      </div>
                      
                      {/* Product Details */}
                      <div className="w-full text-center">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 text-center truncate w-full mb-1" title={product.name}>
                        {product.name}
                      </h3>
                        <p className="text-base font-medium text-blue-600 dark:text-blue-400 mb-2">
                        ₹{product.price}
                      </p>
                        <div className="flex items-center justify-between w-full mb-3">
                        <span className="text-xs text-gray-600 dark:text-gray-300 flex items-center truncate">
                          Stock: {product.stockQuantity}
                          {product.stockQuantity <= 10 && (
                            <span className="ml-2 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-[11px] font-semibold shadow-sm border border-yellow-200 dark:border-yellow-800">Low</span>
                          )}
                        </span>
                        {product.rating && (
                          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded px-1 py-0.5">
                            <Rating rating={product.rating} />
                          </div>
                        )}
                      </div>
                        <div className="w-full border-t border-gray-200 dark:border-gray-700 mb-3" />
                      {!isSelectionMode && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReduceStock(product);
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
                        >
                          Manage Stock
                        </button>
                      )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="py-3 flex justify-center items-center gap-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-xl mt-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`flex items-center justify-center border transition-all duration-200
                    ${currentPage === page
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold shadow-lg scale-105 border-blue-400 dark:border-blue-700 ring-2 ring-blue-200 dark:ring-blue-800 z-10 rounded-full"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"}
                  `}
                  style={currentPage === page ? { minWidth: '36px', minHeight: '36px', width: '36px', height: '36px', fontSize: '1rem', padding: 0 } : { minWidth: '36px', minHeight: '36px', width: '36px', height: '36px', fontSize: '1rem', padding: 0 }}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Create Product Modal */}
      <CreateProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProduct}
      />

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetailsModal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          product={selectedProduct}
          onUpdate={handleUpdateProduct}
          onDelete={handleDeleteProduct}
        />
      )}

      {/* Barcode Printing Modal */}
      <BarcodePrintingModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        products={getSelectedProducts()}
        title={`Print Barcodes - ${getSelectedProducts().length} products`}
      />
    </div>
  );
};

export default Products;