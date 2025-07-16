"use client";

import { useCreateProductMutation, useGetProductsQuery, useUpdateProductMutation, useDeleteProductMutation } from "@/state/api";
import type { Product, NewProduct } from "@/state/api";
import { PlusCircleIcon, SearchIcon, ChevronLeft, ChevronRight, ArrowDownWideNarrow, ArrowUpWideNarrow, Printer } from "lucide-react";
import { useState } from "react";
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
  const totalPages = products ? Math.ceil(products.length / itemsPerPage) : 0;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products?.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

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
            <div className="relative flex-grow max-w-xl">
              <input
                className="w-full pl-8 pr-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-400 bg-white dark:bg-gray-900 shadow-sm font-sans text-sm transition focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
            </div>
            <div className="hidden md:block w-px h-7 bg-gray-100 dark:bg-gray-700 mx-2" />
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
                  className={`px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition ${
                    currentPage === page
                      ? "bg-blue-500 text-white"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100"
                  }`}
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