const express = require("express");
const cartController = require("../../controllers/shop/cart-controller");

const router = express.Router();

router.post("/add", cartController.addToCart);
router.get("/get/:userId", cartController.fetchCartItems);
router.put("/update-cart", cartController.updateCartItemQty);
router.delete("/:userId/:productId", cartController.deleteCartItem);
router.delete("/user/:userId/clear", cartController.clearCart);

module.exports = router;
