import homeIcon from "../assets/home.png";
import homeActiveIcon from "../assets/home_active.png";
import homeDarkIcon from "../assets/home-dark.png";
import invoiceIcon from "../assets/invoice.png";
import invoiceActiveIcon from "../assets/invoice_active.png";
import invoiceDarkIcon from "../assets/invoice-dark.png";
import productIcon from "../assets/product.png";
import productActiveIcon from "../assets/product_active.png";
import productDarkIcon from "../assets/product-dark.png";
import customerIcon from "../assets/customer.png";
import customerActiveIcon from "../assets/customer_active.png";
import customerDarkIcon from "../assets/customer-dark.png";
import reportIcon from "../assets/report.png";
import reportActiveIcon from "../assets/report_active.png";
import reportDarkIcon from "../assets/report-dark.png";
import billingIcon from "../assets/pricing_billing.png";
import billingActiveIcon from "../assets/pricing_billing_active.png";
import billingDarkIcon from "../assets/pricing_billing-dark.png";
import assistantIcon from "../assets/ai_assistant.png";
import assistantActiveIcon from "../assets/ai_assistant_active.png";
import assistantDarkIcon from "../assets/ai_assistant-dark.png";
import settingsIcon from "../assets/settings.png";
import settingsActiveIcon from "../assets/setting_active.png";
import settingsDarkIcon from "../assets/settings-dark.png";
import logoutIcon from "../assets/logout.png";
import logoutDarkIcon from "../assets/logout-dark.png";
const navItems = [
  {
    to: "/dashboard",
    icon: homeIcon,
    activeIcon: homeActiveIcon,
    darkIcon: homeDarkIcon,
    label: "Dashboard",
  },
  {
    to: "/dashboard/invoice",
    icon: invoiceIcon,
    activeIcon: invoiceActiveIcon,
    darkIcon: invoiceDarkIcon,
    label: "Invoices",
  },
  {
    to: "/dashboard/product",
    icon: productIcon,
    activeIcon: productActiveIcon,
    darkIcon: productDarkIcon,
    label: "Products",
  },
  {
    to: "/dashboard/customer",
    icon: customerIcon,
    activeIcon: customerActiveIcon,
    darkIcon: customerDarkIcon,
    label: "Customers",
  },
  {
    to: "/dashboard/reports",
    icon: reportIcon,
    activeIcon: reportActiveIcon,
    darkIcon: reportDarkIcon,
    label: "Reports",
  },
  {
    to: "/dashboard/pricing_billing",
    icon: billingIcon,
    activeIcon: billingActiveIcon,
    darkIcon: billingDarkIcon,
    label: "Billing_Pricing",
  },
  {
    to: "/dashboard/assistant",
    icon: assistantIcon,
    activeIcon: assistantActiveIcon,
    darkIcon: assistantDarkIcon,
    label: "AI_Assistance",
  },
  {
    to: "/dashboard/settings",
    icon: settingsIcon,
    activeIcon: settingsActiveIcon,
    darkIcon: settingsDarkIcon,
    label: "Settings",
  },
  { to: "/", icon: logoutIcon, darkIcon: logoutDarkIcon, label: "Logout" },
];

export { navItems };
