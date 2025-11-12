import axios from "axios";
import invoiceModel from "../../models/invoice.model.js";
import { productModel } from "../../models/product.model.js";
import { customerModel } from "../../models/customer.model.js";
import CatchAsync from "../../utils/middlewares/catchAsync.js";
import AppError from "../../utils/services/appError.js";

export const askAI = CatchAsync(async (req, res, next) => {
  const userQuestion = req.body.question;
  const userCompany = req.user.company;

  // Validate API key
  if (!process.env.GEMINI_API_KEY) {
    return next(
      new AppError(
        "Gemini API key is not configured. Please contact the administrator.",
        500
      )
    );
  }

  // Fetch live company data
  const invoices = await invoiceModel.find({ company: userCompany });
  const products = await productModel.find({ company: userCompany });
  const customers = await customerModel.find({ company: userCompany });

  // Build context
  const context = `
You are Penny, an AI assistant for a company management system.
Here is the current data for this user's company:

Products: ${JSON.stringify(products.slice(0, 5))}
Invoices: ${JSON.stringify(invoices.slice(0, 5))}
Customers: ${JSON.stringify(customers.slice(0, 5))}

Now, answer the following user question in a helpful, business-oriented tone:
"${userQuestion}"
  `;

  try {
    // Call Gemini API
    const GEMINI_MODEL = "gemini-2.5-flash-preview-05-20";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const response = await axios.post(url, {
      contents: [{
        parts: [{
          text: context
        }]
      }]
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Extract response from Gemini
    if (!response.data.candidates || !response.data.candidates[0]?.content?.parts[0]?.text) {
      return next(
        new AppError(
          "No valid response from Gemini. Please check your API key and model access.",
          500
        )
      );
    }

    const reply = response.data.candidates[0].content.parts[0].text;

    res.status(200).json({ status: "success", response: reply });
  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.message);
    
    let errorMessage = "Failed to get response from AI";
    if (error.response?.data?.error?.message) {
      errorMessage = error.response.data.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return next(
      new AppError(
        `AI service error: ${errorMessage}`,
        500
      )
    );
  }
});
