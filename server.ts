import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { SEED_PRODUCTS, SEED_DELIVERY_ZONES, PROMO_CODES } from "./src/data/coffeeData";
import { Order, OrderStatus, PaymentMethod, PaymentStatus, OrderItem } from "./src/types";

// Initialize Gemini SDK with custom agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "MOCK_KEY",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// JSON file storage for persistent orders
const ORDERS_FILE_PATH = path.join(process.cwd(), "orders-db.json");

// Read existing orders or create empty list
function loadOrders(): Order[] {
  try {
    if (fs.existsSync(ORDERS_FILE_PATH)) {
      const data = fs.readFileSync(ORDERS_FILE_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading orders database:", err);
  }
  return [];
}

// Write orders in JSON format
function saveOrders(orders: Order[]) {
  try {
    fs.writeFileSync(ORDERS_FILE_PATH, JSON.stringify(orders, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing to orders database:", err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsers
  app.use(express.json());

  // Initialize DB JSON with pre-loaded mock orders if empty
  let ordersList = loadOrders();
  if (ordersList.length === 0) {
    // Write sample baseline order
    const sampleItem: OrderItem = {
      id: "item-seed-1",
      orderId: "MUGI-9843",
      variantId: "var-aa-wb-250",
      productName: "Mugi Signature Kenya AA",
      variantLabel: "250g bag",
      imageUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=600&auto=format&fit=crop",
      qty: 2,
      unitPrice: 750,
    };
    const sampleOrder: Order = {
      id: "MUGI-9843",
      guestName: "Diana Mugoh",
      guestEmail: "dianamugoh.va@gmail.com",
      guestPhone: "0711223344",
      status: OrderStatus.CONFIRMED,
      subtotalKes: 1500,
      deliveryFeeKes: 250,
      totalKes: 1750,
      deliveryZoneId: "zone-suburbs-west",
      deliveryAddress: "Westlands, Nairobi, Kenya",
      notes: "Please deliver around 3 PM, leave at front desk.",
      promoCode: "MUGISTART",
      discountKes: 150,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [sampleItem],
      payment: {
        method: PaymentMethod.MPESA,
        status: PaymentStatus.SUCCESS,
        mpesaReceipt: "MUG9843STK7",
        checkoutRequestId: "mock-checkout-req-id",
      }
    };
    ordersList = [sampleOrder];
    saveOrders(ordersList);
  }

  // 1. API: Get Products
  app.get("/api/products", (req, res) => {
    res.json({ products: SEED_PRODUCTS });
  });

  // 2. API: Get Delivery Zones
  app.get("/api/delivery-zones", (req, res) => {
    res.json({ zones: SEED_DELIVERY_ZONES });
  });

  // 3. API: Validate Promo Code
  app.post("/api/promo/validate", (req, res) => {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ valid: false, message: "Code parameter is missing" });
    }
    const cleanCode = code.toUpperCase().trim();
    const match = PROMO_CODES.find((p) => p.code === cleanCode && p.isActive);
    if (match) {
      return res.json({ valid: true, discountPercent: match.discountPercent, message: `Promo code successfully applied: ${match.discountPercent}% off!` });
    }
    return res.json({ valid: false, message: "Invalid or expired promo code" });
  });

  // 4. API: Create Order
  app.post("/api/orders", (req, res) => {
    const {
      guestName,
      guestEmail,
      guestPhone,
      deliveryZoneId,
      deliveryAddress,
      notes,
      promoCode,
      items,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order items list cannot be empty." });
    }

    if (!guestName || !guestPhone || !guestEmail || !deliveryZoneId) {
      return res.status(400).json({ error: "Missing required customer or delivery data." });
    }

    // Calculate details
    let subtotalKes = 0;
    const orderItems: OrderItem[] = [];

    // Find zone
    const zone = SEED_DELIVERY_ZONES.find((z) => z.id === deliveryZoneId);
    if (!zone) {
      return res.status(400).json({ error: "Invalid delivery zone selected." });
    }

    const orderId = "MUGI-" + Math.floor(1000 + Math.random() * 9000);

    for (const lineItem of items) {
      // Find variant across products
      let foundVariant = null;
      let foundProduct = null;
      for (const p of SEED_PRODUCTS) {
        const v = p.variants.find((v) => v.id === lineItem.variantId);
        if (v) {
          foundVariant = v;
          foundProduct = p;
          break;
        }
      }

      if (!foundVariant || !foundProduct) {
        return res.status(400).json({ error: `Product variant ${lineItem.variantId} not found.` });
      }

      const qty = Number(lineItem.qty) || 1;
      const unitPrice = foundVariant.priceKes;
      subtotalKes += unitPrice * qty;

      orderItems.push({
        id: `item-${orderId}-${foundVariant.id}`,
        orderId,
        variantId: foundVariant.id,
        productName: foundProduct.name,
        variantLabel: foundVariant.weightLabel + (foundVariant.grindType ? ` · Grind: ${foundVariant.grindType}` : ""),
        imageUrl: foundProduct.images[0],
        qty,
        unitPrice,
      });
    }

    // Handle Promo discount
    let discountPercent = 0;
    if (promoCode) {
      const matchPromo = PROMO_CODES.find((p) => p.code === promoCode.toUpperCase().trim() && p.isActive);
      if (matchPromo) {
        discountPercent = matchPromo.discountPercent;
      }
    }

    const discountKes = Math.round((subtotalKes * discountPercent) / 100);
    
    // Delivery rule: Free delivery threshold is 2,500 KES (only for Nairobi delivery zones)
    // Pickup zone stays 0 KES.
    const isPickupZone = zone.feeKes === 0;
    const isNairobiZone = zone.id.includes("cbd") || zone.id.includes("suburbs");
    const eligibleForFreeDelivery = subtotalKes >= 2500 && isNairobiZone;

    const deliveryFeeKes = eligibleForFreeDelivery && !isPickupZone ? 0 : zone.feeKes;
    const totalKes = subtotalKes - discountKes + deliveryFeeKes;

    const newOrder: Order = {
      id: orderId,
      guestName,
      guestEmail,
      guestPhone,
      status: OrderStatus.PENDING_PAYMENT,
      subtotalKes,
      deliveryFeeKes,
      totalKes,
      deliveryZoneId,
      deliveryAddress: isPickupZone ? `Collection from: ${zone.name}` : deliveryAddress,
      notes,
      promoCode,
      discountKes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: orderItems,
      payment: {
        method: PaymentMethod.MPESA,
        status: PaymentStatus.PENDING,
      },
    };

    ordersList = [newOrder, ...ordersList];
    saveOrders(ordersList);

    res.status(201).json({
      orderId: newOrder.id,
      totalKes: newOrder.totalKes,
      status: newOrder.status,
    });
  });

  // 5. API: Get Order Status / Details
  app.get("/api/orders/:id", (req, res) => {
    const order = ordersList.find((o) => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  });

  // 6. API: Update Order Status (Admin Flow)
  app.post("/api/orders/:id/status", (req, res) => {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Missing status parameter." });
    }

    const oIndex = ordersList.findIndex((o) => o.id === req.params.id);
    if (oIndex === -1) {
      return res.status(404).json({ error: "Order not found." });
    }

    ordersList[oIndex] = {
      ...ordersList[oIndex],
      status: status as OrderStatus,
      updatedAt: new Date().toISOString(),
    };
    saveOrders(ordersList);

    res.json({ success: true, order: ordersList[oIndex] });
  });

  // 7. API: Get All Orders (Admin Dashboard)
  app.get("/api/admin/orders", (req, res) => {
    res.json(ordersList);
  });

  // 8. API: Initiate Safaricom MPESA STK Push
  app.post("/api/mpesa/stkpush", (req, res) => {
    const { orderId, phone } = req.body;
    if (!orderId || !phone) {
      return res.status(400).json({ error: "Missing orderId or phone number." });
    }

    const order = ordersList.find((o) => o.id === orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    // Normalize Kenya phone number. Accept '07XXXXXXXX' or '01XXXXXXXX' or '+254' or '254'
    let cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "254" + cleanPhone.substring(1);
    } else if (cleanPhone.startsWith("254")) {
      // already normalized
    } else if (cleanPhone.length === 9) {
      cleanPhone = "254" + cleanPhone;
    } else {
      return res.status(400).json({ error: "Invalid Kenya phone number format. Use 07XXXXXXXX or similar." });
    }

    const checkoutRequestId = "ws_CO_STK_" + Math.random().toString(36).substring(2, 10).toUpperCase();

    // Trigger MPESA webhook simulator. In exactly 5.5 seconds, we execute a simulated Safaricom Webhook
    // POST request callback internally to confirm the transaction.
    setTimeout(async () => {
      try {
        const callbackPayload = {
          Body: {
            stkCallback: {
              MerchantRequestID: "MUGI-MERCH-" + Math.floor(100000 + Math.random() * 900000),
              CheckoutRequestID: checkoutRequestId,
              ResultCode: 0, // '0' stands for absolute SUCCESS in Daraja API
              ResultDesc: "The service request is processed successfully.",
              CallbackMetadata: {
                Item: [
                  { Name: "Amount", Value: order.totalKes },
                  { Name: "MpesaReceiptNumber", Value: "MUG" + Math.random().toString(36).substring(2, 9).toUpperCase() },
                  { Name: "TransactionDate", Value: Number(new Date().toISOString().replace(/\D/g, "").substring(0, 14)) },
                  { Name: "PhoneNumber", Value: Number(cleanPhone) },
                ],
              },
            },
          },
        };

        // Post back to our callback API route internally to drive true, async payment loop processing
        const callbackUrl = `http://localhost:${PORT}/api/mpesa/callback`;
        const fetchResponse = await fetch(callbackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(callbackPayload),
        });
        console.log(`[STK-WEBHOOK-SIMULATOR] Callback route execution result: ${fetchResponse.status}`);
      } catch (err) {
        console.error("[STK-WEBHOOK-SIMULATOR] Error scheduling async callback:", err);
      }
    }, 5500);

    // Save checkout request ID to the order
    const orderIdx = ordersList.findIndex((o) => o.id === orderId);
    if (orderIdx !== -1) {
      ordersList[orderIdx] = {
        ...ordersList[orderIdx],
        payment: {
          method: PaymentMethod.MPESA,
          status: PaymentStatus.PENDING,
          checkoutRequestId: checkoutRequestId,
        },
      };
      saveOrders(ordersList);
    }

    return res.json({
      success: true,
      MerchantRequestID: "MUGI-MERCH-843821",
      CheckoutRequestID: checkoutRequestId,
      message: "STK push initiated successfully. Pin pop-up scheduled in phone.",
    });
  });

  // 9. API: Safaricom MPESA Webhook Endpoint (Callback)
  app.post("/api/mpesa/callback", (req, res) => {
    try {
      const { Body } = req.body;
      if (!Body || !Body.stkCallback) {
        return res.status(400).json({ error: "Invalid callback payload structures." });
      }

      const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = Body.stkCallback;
      console.log(`[MPESA-CALLBACK] Received STK Callback. ID: ${CheckoutRequestID}, Result: ${ResultCode}`);

      // Locate corresponding order in DB
      const orderIdx = ordersList.findIndex((o) => o.payment?.checkoutRequestId === CheckoutRequestID);
      if (orderIdx === -1) {
        console.warn(`[MPESA-CALLBACK] Warning: No active order matches CheckoutRequestID '${CheckoutRequestID}'`);
        return res.status(200).json({ ResponseCode: "0", ResponseDesc: "Callback received but order untracked." });
      }

      const targetOrder = ordersList[orderIdx];

      if (ResultCode === 0) {
        // Success
        const mpesaReceipt = CallbackMetadata?.Item?.find((item: any) => item.Name === "MpesaReceiptNumber")?.Value || ("MUG" + Math.random().toString(36).substring(2, 9).toUpperCase());
        ordersList[orderIdx] = {
          ...targetOrder,
          status: OrderStatus.CONFIRMED,
          updatedAt: new Date().toISOString(),
          payment: {
            method: PaymentMethod.MPESA,
            status: PaymentStatus.SUCCESS,
            mpesaReceipt,
            checkoutRequestId: CheckoutRequestID,
          },
        };
        console.log(`[MPESA-CALLBACK] Payment approved. Order '${targetOrder.id}' transitions directly to CONFIRMED!`);
        saveOrders(ordersList);
      } else {
        // Failed / Canceled
        ordersList[orderIdx] = {
          ...targetOrder,
          status: OrderStatus.CANCELLED,
          updatedAt: new Date().toISOString(),
          payment: {
            method: PaymentMethod.MPESA,
            status: PaymentStatus.FAILED,
            checkoutRequestId: CheckoutRequestID,
          },
        };
        console.log(`[MPESA-CALLBACK] Payment failed or canceled. Order '${targetOrder.id}' canceled.`);
        saveOrders(ordersList);
      }

      // Fast response as Safaricom expects immediate 200 responses
      return res.status(200).json({ ResponseCode: "0", ResponseDesc: "Success" });
    } catch (err) {
      console.error("[MPESA-CALLBACK] Webhook router processing crash:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // 10. API: Coffee Sommelier AI Recommendation Endpoint via Google Gemini
  app.post("/api/coffee-sommelier", async (req, res) => {
    const { tastePreference, brewMethod, experienceLabel } = req.body;

    if (!tastePreference || !brewMethod) {
      return res.status(400).json({ error: "Missing required preferences options." });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Graceful fallback if no actual client api key is set
      return res.json({
        recommendation: `☕ **MUGI COFFEE ROASTER PICK**
Our Mugi micro-lot specialists analyzed your preference for **${tastePreference}** using **${brewMethod}**:

We highly recommend the **Mugi Signature Kenya AA**! 
- **Why it fits you**: Sourced at 2020 MASL, its rich **washed/wet-processed** profile draws out bright citrus acidity and deep blackcurrant flavors that contrast beautifully with ${tastePreference} profiles.
- **Your Personalized Brewing Recipe (${brewMethod})**:
  1. **Ratio**: 15g of medium-ground coffee to 240g of pure water (1:16 ratio).
  2. **Water Temp**: Heated to exactly 93°C (let boiling water rest 30 seconds).
  3. **Method**: Pour 50ml of water to fully saturate (bloom phase) for 35 seconds. This lets the Mt. Kenya Highlands gases escape. Slowly spiral-pour the rest over 2.5 minutes.
  
*Note: Connect your Gemini API Key in Settings > Secrets for customized dynamic AI generated recommendations!*`,
      });
    }

    try {
      const prompt = `You are a world-class certified Q-Grader and coffee sommelier at "Mugi Coffee Distributor" in Kenya.
We sell the following premium coffees:
${JSON.stringify(SEED_PRODUCTS, null, 2)}

Recommend one of our products that fits perfectly based on:
- User taste preference: ${tastePreference}
- Preferred brewing method: ${brewMethod}
- User experience level: ${experienceLabel || "coffee enthusiast"}

Provide a warm, premium, highly technical and engaging response. Include:
1. Reco: The exact name of the Mugi Coffee selection you recommend.
2. Sourcing: Mention the specific Kenya altitude (e.g. MASL) and processing method from the seed list.
3. Why: A professional, rich flavor-wheel justification matching their favorite tastes.
4. Recipe: A professional step-by-step custom brewing instructions with precise parameters (ratio, grind coarseness, water temperature in Celcius, bloom time) engineered for the user's selected brew method: ${brewMethod}.

Format using beautiful, structured Markdown. Use bullet points and headers. Be concise and write in a sophisticated, artisanal tone. Speak directly to the user as a valued patron.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You represent Mugi Coffee Distributor, a premium Kenyan roaster. Share wisdom with passion.",
        },
      });

      res.json({ recommendation: response.text });
    } catch (err: any) {
      console.error("[GEMINI-SOMMELIER] Error calling Gemini API:", err);
      res.status(500).json({ error: "AI Coffee Sommelier is resting. Try our simulated recommendation!" });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[MUGI-SERVER] Server running on http://localhost:${PORT}`);
  });
}

startServer();
