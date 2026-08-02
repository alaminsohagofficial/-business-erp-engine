/**
 * Real-Time Inventory & Multi-Warehouse Stock Engine
 * Manages Stock In, Serialized Item Tracking, Reserves, and ERP Valuation.
 */

const erpStockLedger = new Map(); // Fast In-Memory Stock Lookup

exports.manageStockMovement = async (req, res) => {
  try {
    const { warehouseId, itemCode, serialNumbers, movementType, quantity, unitPrice } = req.body;

    if (!warehouseId || !itemCode || !movementType || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Warehouse ID, Item Code, Movement Type, and Quantity are required."
      });
    }

    const stockKey = `${warehouseId}:${itemCode}`;
    let currentStock = erpStockLedger.get(stockKey) || {
      warehouseId,
      itemCode,
      availableQty: 0,
      reservedQty: 0,
      totalValuationPoisha: 0
    };

    const parsedQty = Math.abs(parseInt(quantity, 10));
    const priceInPoisha = Math.round(Number(unitPrice || 0) * 100);

    // Stock Movement Logic Engine
    switch (movementType.toUpperCase()) {
      case "STOCK_IN": // (Factory to Warehouse Ingestion)
        currentStock.availableQty += parsedQty;
        currentStock.totalValuationPoisha += parsedQty * priceInPoisha;
        break;

      case "STOCK_OUT": // (Dealer Dispatch / Sales Order)
        if (currentStock.availableQty < parsedQty) {
          return res.status(422).json({
            success: false,
            message: `Insufficient stock in Warehouse ${warehouseId}. Current available: ${currentStock.availableQty}`
          });
        }
        currentStock.availableQty -= parsedQty;
        currentStock.totalValuationPoisha -= parsedQty * priceInPoisha;
        break;

      case "RESERVE": // (Credit Hold Check Passed -> Lock Stock for Dispatch)
        if (currentStock.availableQty < parsedQty) {
          return res.status(422).json({
            success: false,
            message: "Cannot reserve stock. Available quantity insufficient."
          });
        }
        currentStock.availableQty -= parsedQty;
        currentStock.reservedQty += parsedQty;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid Movement Type. Allowed: STOCK_IN, STOCK_OUT, RESERVE"
        });
    }

    // Save updated state back to ledger
    erpStockLedger.set(stockKey, currentStock);

    return res.status(200).json({
      success: true,
      message: `Stock successfully updated via ${movementType}`,
      inventorySummary: {
        warehouseId,
        itemCode,
        availableQuantity: currentStock.availableQty,
        reservedQuantity: currentStock.reservedQty,
        totalValuationAmount: currentStock.totalValuationPoisha / 100,
        status: currentStock.availableQty < 10 ? "LOW_STOCK_ALERT" : "STOCK_HEALTHY"
      }
    });

  } catch (error) {
    console.error("Stock Engine Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in Inventory Engine.",
      error: error.message
    });
  }
};
