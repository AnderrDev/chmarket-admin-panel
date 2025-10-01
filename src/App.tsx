import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout.tsx';

// Lazy load pages for better performance
const Login = lazy(() => import('./pages/Login.tsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.tsx'));
const Products = lazy(() => import('./pages/Products.tsx'));
const ProductForm = lazy(() => import('./pages/ProductForm.tsx'));
const Categories = lazy(() => import('./pages/Categories.tsx'));
const Orders = lazy(() => import('./pages/Orders.tsx'));
const OrderDetail = lazy(() => import('./pages/OrderDetail.tsx'));
const Discounts = lazy(() => import('./pages/Discounts.tsx'));
const DiscountForm = lazy(() => import('./pages/DiscountForm.tsx'));

// Loading component for Suspense
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <Layout>
                  <Products />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/new"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProductForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/:id/edit"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProductForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <Layout>
                  <Categories />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Layout>
                  <Orders />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <OrderDetail />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/discounts"
            element={
              <ProtectedRoute>
                <Layout>
                  <Discounts />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/discounts/new"
            element={
              <ProtectedRoute>
                <Layout>
                  <DiscountForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/discounts/:id/edit"
            element={
              <ProtectedRoute>
                <Layout>
                  <DiscountForm />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
