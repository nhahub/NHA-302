import axios from "axios";
import invoiceModel from "../../models/invoice.model.js";
import { productModel } from "../../models/product.model.js";
import { customerModel } from "../../models/customer.model.js";
import CatchAsync from "../../utils/middlewares/catchAsync.js";
import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// export const askAI = catchAsyncError(async (req, res, next) => {
//   const userQuestion = req.body.question;
//   const userCompany = req.user.company;

//   //fetch live company data
//   const invoices = await invoiceModel.find({ company: userCompany });
//   const products = await productModel.find({ company: userCompany });
//   const customers = await customerModel.find({ company: userCompany });

//   //build context for the AI

//   const context = `
// You are an AI assistant for a company management system.
// Here is the current data for this user's company:

// Products: ${JSON.stringify(products.slice(0, 5))}
// Invoices: ${JSON.stringify(invoices.slice(0, 5))}
// Customers: ${JSON.stringify(customers.slice(0, 5))}

// Now, answer the following user question in a helpful, business-oriented tone:
// "${userQuestion}"
//     `;

//   //call free model API (ollama locally)
//   const response = await axios.post("http://localhost:11434/api/generate", {
//     model: "llama3",
//     prompt: context,
//     stream: false,
//   });

//   res.status(200).json({ status: "success", data: response.data });
// });

export const askAI = CatchAsync(async (req, res, next) => {
  const userQuestion = req.body.question;
  const userCompany = req.user.company;

  // Fetch live company data
  const invoices = await invoiceModel.find({ company: userCompany });
  const products = await productModel.find({ company: userCompany });
  const customers = await customerModel.find({ company: userCompany });

  // Build context
  const context = `
You are an AI assistant for a company management system.
Here is the current data for this user's company:

Products: ${JSON.stringify(products.slice(0, 5))}
Invoices: ${JSON.stringify(invoices.slice(0, 5))}
Customers: ${JSON.stringify(customers.slice(0, 5))}

Now, answer the following user question in a helpful, business-oriented tone:
"${userQuestion}"
  `;

  // Call ChatGPT model
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini", // cheaper + fast
    messages: [{ role: "user", content: context }],
  });

  const reply = completion.choices[0].message.content;

  res.status(200).json({ status: "success", response: reply });
});
