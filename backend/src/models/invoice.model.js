import mongoose from "mongoose";
const invoiceSchema = new mongoose.Schema({
  invoiceId: {
    type: Number,
    required: [true, "Please enter an invoice ID"],
    unique: true,
    min: [1, "Invoice ID must be greater than 0"],
  },
  orderDate: {
    type: Date,
    required: [true, "Please enter an order date"],
  },
  dueDate: {
    type: Date,
    required: [true, "Please enter a due date"],
  },

  status: {
    type: String,
    enum: ["Paid", "Pending", "Overdue"],
    default: "Pending",
  },
  paymentMethod: {
    type: String,
    enum: ["Cash", "Credit | Debit Card", "Other"],
    default: "Cash",
  },
  subTotal: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  products: [
    {
      product: {
        type: mongoose.Schema.ObjectId,
        ref: "product",
        required: true,
      },
      quantity: { type: Number, required: true, min: 1 },
    },
  ],

  customer: {
    type: mongoose.Schema.ObjectId,
    ref: "customer",
  },
  company: {
    type: mongoose.Schema.ObjectId,
    ref: "company",
  },
});

// Middleware to update customer stats after creating an invoice
invoiceSchema.post("save", async function (doc) {
  if (doc.customer) {
    try {
      // Add invoice to customer's invoices array and update stats
      const Customer = mongoose.model("customer");
      
      // Get all invoices for this customer
      const Invoice = mongoose.model("invoice");
      const customerInvoices = await Invoice.find({ customer: doc.customer });
      
      // Calculate totals
      const totalOrders = customerInvoices.length;
      const totalPurchases = customerInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
      
      // Update customer with new stats and add invoice to array if not already present
      await Customer.findByIdAndUpdate(
        doc.customer,
        {
          $addToSet: { invoices: doc._id },
          $set: {
            totalOrders: totalOrders,
            totalPurchases: totalPurchases,
          },
        }
      );
    } catch (error) {
      console.error("Error updating customer stats:", error);
    }
  }
});

// Middleware to update customer stats after deleting an invoice
invoiceSchema.post("findOneAndDelete", async function (doc) {
  if (doc && doc.customer) {
    try {
      const Customer = mongoose.model("customer");
      const Invoice = mongoose.model("invoice");
      
      // Get remaining invoices for this customer
      const customerInvoices = await Invoice.find({ customer: doc.customer });
      
      // Calculate totals
      const totalOrders = customerInvoices.length;
      const totalPurchases = customerInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
      
      // Update customer with new stats and remove invoice from array
      await Customer.findByIdAndUpdate(
        doc.customer,
        {
          $pull: { invoices: doc._id },
          $set: {
            totalOrders: totalOrders,
            totalPurchases: totalPurchases,
          },
        }
      );
    } catch (error) {
      console.error("Error updating customer stats after delete:", error);
    }
  }
});

// Middleware to update customer stats after updating an invoice
invoiceSchema.post("findOneAndUpdate", async function (doc) {
  if (doc && doc.customer) {
    try {
      const Customer = mongoose.model("customer");
      const Invoice = mongoose.model("invoice");
      
      // Get all invoices for this customer
      const customerInvoices = await Invoice.find({ customer: doc.customer });
      
      // Calculate totals
      const totalOrders = customerInvoices.length;
      const totalPurchases = customerInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
      
      // Update customer stats
      await Customer.findByIdAndUpdate(
        doc.customer,
        {
          $set: {
            totalOrders: totalOrders,
            totalPurchases: totalPurchases,
          },
        }
      );
    } catch (error) {
      console.error("Error updating customer stats after update:", error);
    }
  }
});

export default mongoose.model("invoice", invoiceSchema);
