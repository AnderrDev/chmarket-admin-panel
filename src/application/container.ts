// src/application/container.ts
import { SupabaseProductDataSource } from '@/data/datasources/ProductDataSource';
import { ProductRepositoryImpl } from '@/data/repositories/ProductRepositoryImpl';
import { SupabaseUploadDataSource } from '@/data/datasources/UploadDataSource';
import { UploadRepositoryImpl } from '@/data/repositories/UploadRepositoryImpl';
import { SupabaseCategoryDataSource } from '@/data/datasources/CategoryDataSource';
import { CategoryRepositoryImpl } from '@/data/repositories/CategoryRepositoryImpl';
import { SupabaseAuthDataSource } from '@/data/datasources/AuthDataSource';
import { AuthRepositoryImpl } from '@/data/repositories/AuthRepositoryImpl';
import { SupabaseDiscountDataSource } from '@/data/datasources/DiscountDataSource';
import { DiscountRepositoryImpl } from '@/data/repositories/DiscountRepositoryImpl';
import { SupabaseOrderDataSource } from '@/data/datasources/OrderDataSource';
import { OrderRepositoryImpl } from '@/data/repositories/OrderRepositoryImpl';
import { ListProductsUseCase } from '@/domain/usecases/product/ListProducts';
import { CreateProductUseCase } from '@/domain/usecases/product/CreateProduct';
import { UpdateProductUseCase } from '@/domain/usecases/product/UpdateProduct';
import { DeleteProductUseCase } from '@/domain/usecases/product/DeleteProduct';
import { GetProductVariantsUseCase } from '@/domain/usecases/product/GetProductVariants';
import { CreateVariantUseCase } from '@/domain/usecases/product/CreateVariant';
import { UpdateVariantUseCase } from '@/domain/usecases/product/UpdateVariant';
import { DeleteVariantUseCase } from '@/domain/usecases/product/DeleteVariant';
import { UploadImagesUseCase } from '@/domain/usecases/upload/UploadImages';
import { RemoveImagesUseCase } from '@/domain/usecases/upload/RemoveImages';
import { LoginUseCase } from '@/domain/usecases/auth/Login';
import { LogoutUseCase } from '@/domain/usecases/auth/Logout';
import { GetSessionUseCase } from '@/domain/usecases/auth/GetSession';
import { ListCategoriesUseCase } from '@/domain/usecases/category/ListCategories';
import { CreateCategoryUseCase } from '@/domain/usecases/category/CreateCategory';
import { UpdateCategoryUseCase } from '@/domain/usecases/category/UpdateCategory';
import { DeleteCategoryUseCase } from '@/domain/usecases/category/DeleteCategory';
import { ListDiscountsUseCase } from '@/domain/usecases/discount/ListDiscounts';
import { CreateDiscountUseCase } from '@/domain/usecases/discount/CreateDiscount';
import { UpdateDiscountUseCase } from '@/domain/usecases/discount/UpdateDiscount';
import { DeleteDiscountUseCase } from '@/domain/usecases/discount/DeleteDiscount';
import { ToggleDiscountStatusUseCase } from '@/domain/usecases/discount/ToggleDiscountStatus';
import { GetActiveDiscountsUseCase } from '@/domain/usecases/discount/GetActiveDiscounts';
import { ListOrdersUseCase } from '@/domain/usecases/order/ListOrders';
import { GetOrderUseCase } from '@/domain/usecases/order/GetOrder';
import { GetOrderItemsUseCase } from '@/domain/usecases/order/GetOrderItems';
import { UpdateOrderStatusUseCase } from '@/domain/usecases/order/UpdateOrderStatus';
import { GetOrdersByStatusUseCase } from '@/domain/usecases/order/GetOrdersByStatus';
import { GetOrdersStatsUseCase } from '@/domain/usecases/order/GetOrdersStats';
import { ProductViewModel } from '@/presentation/viewmodels/ProductViewModel';
import { AuthViewModel } from '@/presentation/viewmodels/AuthViewModel';
import { CategoryViewModel } from '@/presentation/viewmodels/CategoryViewModel';
import { notificationService } from '@/application/services/NotificationService';

// Data Layer
const productDataSource = new SupabaseProductDataSource();
const productRepository = new ProductRepositoryImpl(productDataSource);

const uploadDataSource = new SupabaseUploadDataSource();
const uploadRepository = new UploadRepositoryImpl(uploadDataSource);

const categoryDataSource = new SupabaseCategoryDataSource();
const categoryRepository = new CategoryRepositoryImpl(categoryDataSource);

const authDataSource = new SupabaseAuthDataSource();
const authRepository = new AuthRepositoryImpl(authDataSource);

const discountDataSource = new SupabaseDiscountDataSource();
const discountRepository = new DiscountRepositoryImpl(discountDataSource);

const orderDataSource = new SupabaseOrderDataSource();
const orderRepository = new OrderRepositoryImpl(orderDataSource);

// Domain Layer - Use Cases
export const listProductsUseCase = new ListProductsUseCase(productRepository);
export const createProductUseCase = new CreateProductUseCase(productRepository);
export const updateProductUseCase = new UpdateProductUseCase(productRepository);
export const deleteProductUseCase = new DeleteProductUseCase(productRepository);
export const getProductVariantsUseCase = new GetProductVariantsUseCase(
  productRepository
);
export const createVariantUseCase = new CreateVariantUseCase(productRepository);
export const updateVariantUseCase = new UpdateVariantUseCase(productRepository);
export const deleteVariantUseCase = new DeleteVariantUseCase(productRepository);

export const uploadImagesUseCase = new UploadImagesUseCase(uploadRepository);
export const removeImagesUseCase = new RemoveImagesUseCase(uploadRepository);

export const loginUseCase = new LoginUseCase(authRepository);
export const logoutUseCase = new LogoutUseCase(authRepository);
export const getSessionUseCase = new GetSessionUseCase(authRepository);

export const listCategoriesUseCase = new ListCategoriesUseCase(
  categoryRepository
);
export const createCategoryUseCase = new CreateCategoryUseCase(
  categoryRepository
);
export const updateCategoryUseCase = new UpdateCategoryUseCase(
  categoryRepository
);
export const deleteCategoryUseCase = new DeleteCategoryUseCase(
  categoryRepository
);

export const listDiscountsUseCase = new ListDiscountsUseCase(
  discountRepository
);
export const createDiscountUseCase = new CreateDiscountUseCase(
  discountRepository
);
export const updateDiscountUseCase = new UpdateDiscountUseCase(
  discountRepository
);
export const deleteDiscountUseCase = new DeleteDiscountUseCase(
  discountRepository
);
export const toggleDiscountStatusUseCase = new ToggleDiscountStatusUseCase(
  discountRepository
);
export const getActiveDiscountsUseCase = new GetActiveDiscountsUseCase(
  discountRepository
);

export const listOrdersUseCase = new ListOrdersUseCase(orderRepository);
export const getOrderUseCase = new GetOrderUseCase(orderRepository);
export const getOrderItemsUseCase = new GetOrderItemsUseCase(orderRepository);
export const updateOrderStatusUseCase = new UpdateOrderStatusUseCase(
  orderRepository
);
export const getOrdersByStatusUseCase = new GetOrdersByStatusUseCase(
  orderRepository
);
export const getOrdersStatsUseCase = new GetOrdersStatsUseCase(orderRepository);

// Presentation Layer
export const productViewModel = new ProductViewModel(
  listProductsUseCase,
  createProductUseCase,
  updateProductUseCase,
  deleteProductUseCase,
  getProductVariantsUseCase,
  createVariantUseCase,
  updateVariantUseCase,
  deleteVariantUseCase,
  notificationService
);

export const authViewModel = new AuthViewModel(
  loginUseCase,
  logoutUseCase,
  getSessionUseCase,
  authRepository,
  notificationService
);

export const categoryViewModel = new CategoryViewModel(
  listCategoriesUseCase,
  createCategoryUseCase,
  updateCategoryUseCase,
  deleteCategoryUseCase,
  notificationService
);
