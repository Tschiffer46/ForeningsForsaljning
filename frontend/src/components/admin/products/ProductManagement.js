import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../../contexts/AdminContext';
import LoadingSpinner from '../../shared/LoadingSpinner';
import Toast from '../../shared/Toast';
import ConfirmDialog from '../../shared/ConfirmDialog';
import ProductList from './ProductList';
import ProductForm from './ProductForm';

const ProductManagement = () => {
  const {
    products,
    productsLoading,
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toast,
    hideToast,
  } = useAdmin();

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleAdd = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = (product) => {
    setDeleteConfirm(product);
  };

  const confirmDelete = async () => {
    if (deleteConfirm) {
      try {
        await deleteProduct(deleteConfirm.id);
        setDeleteConfirm(null);
      } catch (error) {
        // Error handled by context
      }
    }
  };

  const handleSubmit = async (productData) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await createProduct(productData);
      }
      setShowForm(false);
      setEditingProduct(null);
    } catch (error) {
      // Error handled by context
      throw error;
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleToggleActive = async (product) => {
    try {
      await updateProduct(product.id, { ...product, active: product.active ? 0 : 1 });
    } catch (error) {
      // Error handled by context
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesActive = showInactive || product.active;
    return matchesSearch && matchesActive;
  });

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h2 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937' }}>
          Product Management
        </h2>
        <button
          onClick={handleAdd}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#7c3aed',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
        >
          + Add Product
        </button>
      </div>

      <div style={{
        marginBottom: '1.5rem',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center'
      }}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '1rem'
          }}
        />
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: 'pointer',
          userSelect: 'none'
        }}>
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <span>Show inactive</span>
        </label>
      </div>

      {productsLoading && <LoadingSpinner message="Loading products..." />}

      {!productsLoading && (
        <>
          {showForm ? (
            <ProductForm
              product={editingProduct}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          ) : (
            <ProductList
              products={filteredProducts}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          )}
        </>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      {deleteConfirm && (
        <ConfirmDialog
          title="Delete Product"
          message={`Are you sure you want to delete "${deleteConfirm.name}"? This will deactivate the product.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm(null)}
          confirmText="Delete"
          type="danger"
        />
      )}
    </div>
  );
};

export default ProductManagement;
