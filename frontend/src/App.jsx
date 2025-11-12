import { Routes, Route } from "react-router-dom";
import UnregisterHome from "./components/UnregisterHome";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import PrivateRoute from "./components/PrivateRoute";
import UserComponent from "./components/UserComponent";
import AdminComponent from "./components/AdminComponent";
import Dashboard from "./components/Dashboard";
import Invoices from "./components/Invoices";
import Products from "./components/Products";
import AddProduct from "./components/AddProduct";
import EditProduct from "./components/EditProduct";
import ViewProduct from "./components/ViewProduct";
import Customers from "./components/Customers";
import Reports from "./components/Reports";
import Pricing_billing from "./components/Pricing_billing";
import AiAssistant from "./components/AiAssistant";
import Settings from "./components/Settings";
import ErrorPage from "./components/ErrorPage";
import AddCustomer from "./components/AddCustomer";
import EditCustomer from "./components/EditCustomer";
import AddInvoice from "./components/AddInvoice";
import InvoicePreviewPage from "./components/InvoicePreviewPage";
import GoogleCallback from "./components/GoogleCallback";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import ViewCustomer from "./components/ViewCustomer";
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY, {
  advancedFraudSignals: false,
});
//card number for testing=4242 4242 4242 4242

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<UnregisterHome />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRoles={["user"]}>
              <UserComponent />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="invoice" element={<Invoices />} />
          <Route path="invoice/add" element={<AddInvoice />} />
          <Route path="invoice/edit/:id" element={<AddInvoice />} />
          <Route path="invoice/preview" element={<InvoicePreviewPage />} />
          <Route path="invoice/preview/:id" element={<InvoicePreviewPage />} />
          <Route path="product" element={<Products />} />
          <Route path="product/product/add" element={<AddProduct />} />
          <Route path="product/product/edit/:id" element={<EditProduct />} />
          <Route path="product/product/view/:id" element={<ViewProduct />} />

          <Route path="customer" element={<Customers />} />
          <Route path="customer/customer/add" element={<AddCustomer />} />
          <Route path="customer/customer/edit/:id" element={<EditCustomer />} />
          <Route path="customer/customer/view/:id" element={<ViewCustomer />} />
          <Route path="reports" element={<Reports />} />
          <Route
            path="pricing_billing"
            element={
              <Elements stripe={stripePromise}>
                <Pricing_billing />
              </Elements>
            }
          />

          <Route path="assistant" element={<AiAssistant />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <AdminComponent />
            </PrivateRoute>
          }
        >
          {/* Not added Yet... */}
          <Route path="mypath" element={<h1>This is for Admin</h1>} />
        </Route>

        <Route path="logout" element={<UnregisterHome />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </>
  );
}

export default App;
