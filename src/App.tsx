import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout.tsx'
import Login from './pages/Login.tsx'
import Dashboard from './pages/Dashboard.tsx'
import Products from './pages/Products.tsx'
import ProductForm from './pages/ProductForm.tsx'
import Categories from './pages/Categories.tsx'
import Orders from './pages/Orders.tsx'
import OrderDetail from './pages/OrderDetail.tsx'
import Discounts from './pages/Discounts.tsx'
import DiscountForm from './pages/DiscountForm.tsx'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/products" element={
          <ProtectedRoute>
            <Layout>
              <Products />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/products/new" element={
          <ProtectedRoute>
            <Layout>
              <ProductForm />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/products/:id/edit" element={
          <ProtectedRoute>
            <Layout>
              <ProductForm />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/categories" element={
          <ProtectedRoute>
            <Layout>
              <Categories />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute>
            <Layout>
              <Orders />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/orders/:id" element={
          <ProtectedRoute>
          <Layout>
            <OrderDetail />
          </Layout>
          </ProtectedRoute>
        } />
        <Route path="/discounts" element={
          <ProtectedRoute>
            <Layout>
              <Discounts />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/discounts/new" element={
          <ProtectedRoute>
            <Layout>
              <DiscountForm />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/discounts/:id/edit" element={
          <ProtectedRoute>
            <Layout>
              <DiscountForm />
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  )
}

export default App
