const express = require("express");

const {
  createOrder,
  getAllOrdersByUser,
  getOrderDetails,
  capturePayment,
  updateOrderStatus

} = require("../../controllers/shop/order-controller");
//const getReturnUrl = require('../../helpers/vnpay')

const router = express.Router();

router.post("/create", createOrder);
router.post("/capture", capturePayment);
router.get("/list/:userId", getAllOrdersByUser);
router.get("/details/:id", getOrderDetails);
router.put("/updatePaymentStatus", updateOrderStatus)

module.exports = router;
