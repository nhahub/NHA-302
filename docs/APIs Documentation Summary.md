# APIs Documentation

This document lists the backend API routes, grouped by base path, HTTP method, route, controller handler, and auth/role protection.
## /uploads
*   GET /uploads/\* — static file serving for uploaded assets (company logos, etc.)
## /api/auth
*   POST /api/auth/signup — signup (auth.controller.signup) — public
*   POST /api/auth/login — login (auth.controller.login) — public
*   GET /api/auth/logout — logout (auth.controller.logout) — public
*   GET /api/auth/users/:id — get current user (auth.controller.getCurrentUser) — protect, restrictTo("user")
*   PATCH /api/auth/update/:id — update user (auth.controller.updateUser) — protect, restrictTo("user")
*   PATCH /api/auth/updatePassword — update password (auth.controller.updatePassword) — protect, restrictTo("user")
*   GET /api/auth/google — start Google OAuth (passport.authenticate) — public
*   GET /api/auth/google/callback — Google OAuth callback (passport.authenticate -> cookie set + redirect) — public callback
*   DELETE /api/auth/delete-account — delete own account (auth.controller.deleteAccount) — protect, restrictTo("user")
### Admin-related auth endpoints
*   GET /api/auth/users — get all users (auth.controller.getAllUsers) — protect, restrictTo("admin")
*   DELETE /api/auth/users/:id — delete user (auth.controller.deleteUser) — protect, restrictTo("admin")
*   POST /api/auth/admin — create admin (auth.controller.createAdmin) — public (creates admin)
*   GET /api/auth/admin/:id — get admin (auth.controller.getAdmin) — protect, restrictTo("admin")
*   GET /api/auth/admin — get all admins (auth.controller.getAllAdmins) — protect, restrictTo("admin")
*   PATCH /api/auth/admin/:id — update admin (auth.controller.updateAdmin) — protect, restrictTo("admin")
*   DELETE /api/auth/admin/:id — delete admin (auth.controller.deleteAdmin) — protect, restrictTo("admin")
## /api/product
*   GET /api/product/ — get all products (product.controller.getAllProducts) — protect, restrictTo("admin")
*   POST /api/product/ — create product (product.controller.createProduct) — protect
*   GET /api/product/overview — get products overview (product.controller.getProductsOverview) — protect, restrictTo("admin")
*   GET /api/product/:id — get product by id (product.controller.getProductById) — protect
*   PATCH /api/product/:id — update product (product.controller.updateProduct) — protect
*   DELETE /api/product/:id — delete product (product.controller.deleteProductById) — protect
*   GET /api/product/stock/:id — get stock status (product.controller.getStockStatus) — protect, restrictTo("user")
*   GET /api/product/export/:id — export products (product.controller.exportProducts) — protect, restrictTo("user")
*   GET /api/product/company/:id — get products by company (product.controller.getProductsByCompany) — protect, restrictTo("user")
## /api/pricing\_billing
*   POST /api/pricing\_billing/add-card — attach card (pricing\_billing.controller.attatchCard) — protect
*   POST /api/pricing\_billing/track-usage — track usage (pricing\_billing.controller.UsageTracker) — protect
*   DELETE /api/pricing\_billing/remove-card — remove card (pricing\_billing.controller.deleteCard) — protect
*   GET /api/pricing\_billing/summary — get billing summary (pricing\_billing.controller.getBillingSummary) — protect
*   GET /api/pricing\_billing/admin-summary — get admin billing summary (pricing\_billing.controller.getAdminBillingSummary) — protect, restrictTo("admin")
*   POST /api/pricing\_billing/charge-all — manual charge all users (pricing\_billing.controller.chargeAllUsersManual) — protect, restrictTo("admin")
## /api/customer
*   POST /api/customer/ — create customer (customer.controller.createCustomer) — protect
*   GET /api/customer/ — get all customers (customer.controller.getAllCustomers) — protect, restrictTo("admin")
*   GET /api/customer/:id — get customer by id (customer.controller.getCustomerById) — protect
*   PATCH /api/customer/:id — update customer (customer.controller.updateCustomer) — protect
*   DELETE /api/customer/:id — delete customer (customer.controller.deleteCustomer) — protect
*   GET /api/customer/:id/invoices — get customer invoices (customer.controller.getCustomerInvoices) — protect, restrictTo("user")
*   GET /api/customer/:id/company — get customer by company (customer.controller.getCustomerByCompany) — protect, restrictTo("user")
*   GET /api/customer/:id/count — get customer count by company (customer.controller.getCustomerCountByCompany) — protect, restrictTo("admin")
## /api/company
*   POST /api/company/ — create company (company.controller.createCompany) — protect
*   GET /api/company/ — get all companies (company.controller.getAllCompanies) — protect, restrictTo("admin")
*   GET /api/company/summary/:id — get company summary (company.controller.getCompanySummary) — protect, restrictTo("admin")
*   GET /api/company/:id — get company by id (company.controller.getCompanyById) — protect, restrictTo("user")
*   PATCH /api/company/:id — update company (company.controller.updateCompany) — protect, (uploadCompanyLogo middleware used)
*   DELETE /api/company/:id — delete company (company.controller.deleteCompany) — protect
## /api/invoice
*   GET /api/invoice/stats — get invoice stats (invoice.controller.getInvoiceStats) — protect
*   GET /api/invoice/ — get all invoices (invoice.controller.getAllInvoices) — protect
*   GET /api/invoice/status/:status — get invoices by status (invoice.controller.getInvoicesByStatus) — protect
*   GET /api/invoice/:id — get invoice by id (invoice.controller.getInvoiceById) — protect
*   PATCH /api/invoice/:id — update invoice (invoice.controller.updateInvoice) — protect
*   DELETE /api/invoice/:id — delete invoice (invoice.controller.deleteInvoice) — protect
*   POST /api/invoice/ — create invoice (invoice.controller.createInvoice) — protect
*   GET /api/invoice/export/:id — export invoices (invoice.controller.exportInvoices) — protect
*   GET /api/invoice/company/:id — get invoices by company (invoice.controller.getInvoicesByCompany) — protect
## /api/reports
*   GET /api/reports/stats — get report stats (report.controller.getReportStats) — protect
*   GET /api/reports/revenue — get revenue over time (report.controller.getRevenueOverTime) — protect
*   GET /api/reports/top-products — get top products (report.controller.getTopProducts) — protect
*   GET /api/reports/top-customers — get top customers (report.controller.getTopCustomers) — protect
## /api/ai
*   POST /api/ai/ask — send prompt to AI assistant (aiAssistance.controller.askAI) — protect
## Other important server endpoints & behavior
*   GET any other path → 404 handled by AppError middleware (next(new AppError(...)))
*   Global error handling via `globalErrorHandler` middleware
*   Cron job: scheduled daily batch charge (node-cron) calls `chargeAllUsers()` in `pricing_billing.service.js`
## Notes & observations
*   Auth middleware usage:
    *   protect — requires authentication (token)
    *   restrictTo("admin" | "user") — role-based access
*   OAuth:
    *   Google OAuth path: GET /api/auth/google and GET /api/auth/google/callback — callback redirects to frontend with token in query param.
*   File uploads:
    *   `PATCH /api/company/:id` uses `uploadCompanyLogo` middleware — company logo file handling; static files served under `/uploads`.
*   Base API mounting is defined in `backend/src/index.js`:
    *   app.use("/api/auth", AuthRoutes);
    *   app.use("/api/product", ProductRoutes);
    *   app.use("/api/pricing\_billing", PricingBillingRoutes);
    *   app.use("/api/customer", CustomerRoutes);
    *   app.use("/api/company", CompanyRoutes);
    *   app.use("/api/invoice", InvoiceRoutes);
    *   app.use("/api/reports", ReportRoutes);
    *   app.use("/api/ai", AIAssistanceRoutes);