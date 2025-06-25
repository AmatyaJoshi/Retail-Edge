"use client";

import { useCreateProductMutation, useGetProductsQuery, useUpdateProductMutation, useDeleteProductMutation } from "@/state/api";
import type { Product } from "@/state/api";
import { PlusCircleIcon, SearchIcon, ChevronLeft, ChevronRight, ArrowDownWideNarrow, ArrowUpWideNarrow } from "lucide-react";
import { useState } from "react";
import Header from "@/app/(components)/Header";
import Rating from "@/app/(components)/Rating";
import CreateProductModal from "./CreateProductModal";
import ProductDetailsModal from "./ProductDetailsModal";
import Image from "next/image";

// Eyewear SVG icon from svgrepo.com
const EyewearIcon = () => (
  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="40" r="12" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="48" cy="40" r="12" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M4 40c0-6 4-12 12-12m32 0c8 0 12 6 12 12" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M28 40h8" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

type ProductFormData = {
  name: string;
  price: number;
  stockQuantity: number;
  rating: number;
};

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const {
    data: products,
    isLoading,
    isError,
    refetch
  } = useGetProductsQuery({ searchTerm, sortField, sortOrder });

  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const handleCreateProduct = async (productData: ProductFormData) => {
    await createProduct(productData);
    refetch();
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

  const handleUpdateProduct = async (productId: string, updates: Partial<Product>) => {
    try {
      // Optimistically update the selected product for immediate UI feedback
      setSelectedProduct(prev => {
        if (prev && prev.productId === productId) {
          return { ...prev, ...updates };
        }
        return prev;
      });

      await updateProduct({
        productId,
        updates
      });
      refetch(); // This will re-fetch and ensure data consistency from the server
    } catch (error) {
      console.error("Failed to update product:", error);
      alert("Failed to update product."); // Show alert to user
      // If optimistic update failed, revert to previous state or re-fetch immediately
      refetch(); // Re-fetch to get the actual state from DB
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
    <div className="mx-auto pb-5 w-full">
      {/* SEARCH BAR AND FILTER DROPDOWN */}
      <div className="mb-6 flex space-x-4">
        <div className="flex items-center border-2 border-gray-200 rounded flex-grow">
          <SearchIcon className="w-5 h-5 text-gray-500 m-2" />
          <input
            className="w-full py-2 px-4 rounded bg-white"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="py-2 px-4 border rounded-md bg-white text-gray-700"
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
        >
          <option value="name">Sort by Name</option>
          <option value="rating">Sort by Rating</option>
          <option value="stockQuantity">Sort by Stock</option>
          <option value="createdAt">Sort by Date Created</option>
        </select>
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="p-2 border rounded-md bg-white text-gray-700 hover:bg-gray-100"
        >
          {sortOrder === "asc" ? <ArrowUpWideNarrow className="w-5 h-5" /> : <ArrowDownWideNarrow className="w-5 h-5" />}
        </button>
      </div>

      {/* HEADER BAR */}
      <div className="flex justify-between items-center mb-6">
        <Header name="Products" />
        <button
          className="flex items-center bg-blue-500 hover:bg-blue-700 text-gray-200 font-bold py-2 px-4 rounded"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusCircleIcon className="w-5 h-5 mr-2 !text-gray-200" /> Create
          Product
        </button>
      </div>

      {/* Products Container with Background */}
      <div className="bg-gray-50 rounded-lg p-4">
        {/* Scrollable Products Grid */}
        <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {isLoading ? (
              <div>Loading...</div>
            ) : (
              currentProducts?.map((product) => (
                <div
                  key={product.productId}
                  className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="p-4">
                    <div className="flex flex-col items-center">
                      <div className="flex justify-center mb-2">
                        <div className="w-[100px] h-[100px] bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {product.imageUrl ? (
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              width={100}
                              height={100}
                              className="object-contain"
                            />
                          ) : (
                            <EyewearIcon />
                          )}
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 text-center">
                        {product.name}
                      </h3>
                      <p className="text-lg font-medium text-blue-600 mt-1">
                        ₹{product.price}
                      </p>
                      <div className="flex items-center justify-between w-full mt-2">
                        <span className="text-sm text-gray-600">
                          Stock: {product.stockQuantity}
                        </span>
                        {product.rating && (
                          <div className="flex items-center">
                            <Rating rating={product.rating} />
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReduceStock(product);
                        }}
                        className="mt-3 w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md"
                      >
                        Manage Stock
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded-lg ${
                    currentPage === page
                      ? "bg-blue-500 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
};

export default Products;