import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";

import User from "../models/user.model.js";
import { companyModel as Company } from "../models/company.model.js";
import { productModel as Product } from "../models/product.model.js";
import Invoice from "../models/invoice.model.js";
import { customerModel as Customer } from "../models/customer.model.js";
import PricingBilling from "../models/pricing_billing.model.js";

dotenv.config();

const users = [
  {
    username: "Admin One",
    email: "admin1@example.com",
    password: "admin123",
    passwordConfirmation: "admin123",
    role: "admin",
    phone: "01234567890",
    verified: true,
  },
  {
    username: "Admin Two",
    email: "admin2@example.com",
    password: "admin123",
    passwordConfirmation: "admin123",
    role: "admin",
    phone: "01234567890",
    verified: true,
  },
  {
    username: "User One",
    email: "user1@example.com",
    password: "user123",
    passwordConfirmation: "user123",
    role: "user",
    phone: "01234567890",
  },
  {
    username: "User Two",
    email: "user2@example.com",
    password: "user123",
    passwordConfirmation: "user123",
    role: "user",
    phone: "01234567890",
  },
  {
    username: "Google User",
    email: "googleuser@example.com",
    googleId: "google-123456789",
    role: "user",
    phone: "01234567890",
    verified: true,
  },
];

const companyTemplates = [
  {
    name: "User One Company",
    companyLogo:
      "https://static.vecteezy.com/system/resources/thumbnails/047/656/219/small_2x/abstract-logo-design-for-any-corporate-brand-business-company-vector.jpg",
    invoicePrefix: "UOC",
    currency: "USD",
  },
  {
    name: "User Two Company",
    companyLogo:
      "https://static.vecteezy.com/system/resources/thumbnails/047/656/219/small_2x/abstract-logo-design-for-any-corporate-brand-business-company-vector.jpg",
    invoicePrefix: "UTC",
    currency: "EUR",
  },
  {
    name: "Google User Company",
    companyLogo:
      "https://static.vecteezy.com/system/resources/thumbnails/047/656/219/small_2x/abstract-logo-design-for-any-corporate-brand-business-company-vector.jpg",
    invoicePrefix: "GUC",
    currency: "EGP",
  },
];

const seedData = async () => {
  try {
    await connectDB();

    await Promise.all([
      User.deleteMany(),
      Company.deleteMany(),
      Product.deleteMany(),
      Customer.deleteMany(),
      Invoice.deleteMany(),
      PricingBilling.deleteMany(),
    ]);

    const createdUsers = [];
    for (const u of users) {
      const user = await User.create(u);
      createdUsers.push(user);
    }

    const normalUsers = createdUsers.filter((u) => u.role === "user");

    for (let i = 0; i < normalUsers.length; i++) {
      const user = normalUsers[i];
      const companyData = { ...companyTemplates[i], user: user._id };

      const company = await Company.create(companyData);

      // 🔗 Fix: connect the user back to the company
      user.company = company._id;
      await user.save();

      const products = [];
      products.push(
        await Product.create({
          title: `${company.name} Product A`,
          sku: `A123-${company.name}`,
          titleAr: `${company.name} المنتج A`,
          price: 100,
          discount: 10,
          description: "A sample product description",
          descriptionAr: "وصف المنتج التجريبي",
          quantity: 50,
          imgCover:
            "https://static.vecteezy.com/system/resources/thumbnails/047/656/219/small_2x/abstract-logo-design-for-any-corporate-brand-business-company-vector.jpg",
          category: "Category A",
          vendor: company.name,
          company: company._id,
        })
      );
      products.push(
        await Product.create({
          title: `${company.name} Product B`,
          sku: `B123-${company.name}`,
          titleAr: `${company.name} المنتج B`,
          price: 200,
          discount: 0,
          description: "Another product description",
          descriptionAr: "وصف منتج آخر",
          quantity: 30,
          imgCover:
            "https://static.vecteezy.com/system/resources/thumbnails/047/656/219/small_2x/abstract-logo-design-for-any-corporate-brand-business-company-vector.jpg",
          category: "Category B",
          vendor: company.name,
          company: company._id,
        })
      );

      const customers = [];
      customers.push(
        await Customer.create({
          name: `${company.name} Customer One`,
          email: `cust1_${user.email}`,
          phone: "+201000000001",
          address: "Cairo, Egypt",
          company: company._id,
        })
      );
      customers.push(
        await Customer.create({
          name: `${company.name} Customer Two`,
          email: `cust2_${user.email}`,
          phone: "+201000000002",
          address: "Alexandria, Egypt",
          company: company._id,
        })
      );

      const invoices = [];
      invoices.push(
        await Invoice.create({
          invoiceId: Math.floor(Math.random() * 100000),
          orderDate: new Date(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: "Pending",
          paymentMethod: "Cash",
          subTotal: products[0].price * 2,
          total: (products[0].price - products[0].discount) * 2,
          discount: products[0].discount,
          products: [
            { product: products[0]._id, quantity: 2, price: products[0].price },
          ],
          customer: customers[0]._id,
          company: company._id,
        })
      );
      invoices.push(
        await Invoice.create({
          invoiceId: Math.floor(Math.random() * 100000),
          orderDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          status: "Paid",
          paymentMethod: "Credit | Debit Card",
          subTotal: products[1].price * 5,
          total: products[1].price * 5,
          discount: 0,
          products: [
            { product: products[1]._id, quantity: 5, price: products[1].price },
          ],
          customer: customers[1]._id,
          company: company._id,
        })
      );
      invoices.push(
        await Invoice.create({
          invoiceId: Math.floor(Math.random() * 100000),
          orderDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          dueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          status: "Paid",
          paymentMethod: "Credit | Debit Card",
          subTotal: products[0].price * 1 + products[1].price * 2,
          total:
            (products[0].price - products[0].discount) * 1 +
            products[1].price * 2,
          discount: products[0].discount,
          products: [
            { product: products[0]._id, quantity: 1, price: products[0].price },
            { product: products[1]._id, quantity: 2, price: products[1].price },
          ],
          customer: customers[0]._id,
          company: company._id,
        })
      );

      company.products = products.map((p) => p._id);
      company.customers = customers.map((c) => c._id);
      company.invoices = invoices.map((inv) => inv._id);
      await company.save();

      await PricingBilling.create({
        user: user._id,
        cardLast4: "4242",
        cardType: "credit",
        cardBrand: "Visa",
        cardExpMonth: 12,
        cardExpYear: 2026,
        usage: {
          invoices: invoices.length,
          products: products.length,
          customers: customers.length,
        },
        limits: { invoices: 5, products: 3, customers: 5 },
        pricing: {
          invoiceUnitPrice: 3,
          productUnitPrice: 5,
          customerUnitPrice: 0.5,
        },
        totalDue: 0,
        stripeCustomerId: "cus_test123",
        stripePaymentMethodId: "pm_card_visa",
        currency: company.currency.toLowerCase(),
      });
    }

    console.log("✅ Full dataset seeded successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding data:", err);
    process.exit(1);
  }
};

const deleteData = async () => {
  try {
    await connectDB();
    await Promise.all([
      User.deleteMany(),
      Company.deleteMany(),
      Product.deleteMany(),
      Customer.deleteMany(),
      Invoice.deleteMany(),
      PricingBilling.deleteMany(),
    ]);
    console.log("🗑️ All data deleted successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Error deleting data:", err);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  deleteData();
} else {
  seedData();
}
