export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type CustomerTabParamList = {
  Catalog: undefined;
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
};

export type CustomerStackParamList = {
  CustomerTabs: undefined;
  ProductDetail: { productId: string };
  Checkout: undefined;
  OrderConfirmation: { orderId: string };
  OrderDetails: { orderId: string };
  EditProfile: undefined;
};

export type AdminStackParamList = {
  Dashboard: undefined;
  Products: undefined;
  AddProduct: undefined;
  EditProduct: { productId: string };
  Orders: undefined;
  OrderDetails: { orderId: string };
  Customers: undefined;
  CustomerDetails: { customerId: string };
  Reports: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Customer: undefined;
  Admin: undefined;
};
