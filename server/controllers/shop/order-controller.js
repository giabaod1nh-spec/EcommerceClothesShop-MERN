
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const { createPaymentEndpoint, handlePaymentReturn, getReturnUrl } = require('../../helpers/vnpay');


const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus,
      totalAmount,
      orderDate,
      orderUpdateDate,
      paymentId,
      payerId,
      cartId,
    } = req.body;

    const paramVnpay  = {
      amount: req.body.totalAmount, 
      bankCode: '',
      userId: req.body.userId,
      otherType: '200000'
    } 
    const newlyCreatedOrder = new Order({
          userId,
          cartId,
          cartItems,
          addressInfo,
          orderStatus,
          paymentMethod,
          paymentStatus,
          totalAmount,
          orderDate,
          orderUpdateDate,
          paymentId,
          payerId,
        });
    // const checkPayment = handlePaymentReturn(paramVnpay, res);
    // if(checkPayment.res.status){
    //   await newlyCreatedOrder.save();
    // }   
    // await newlyCreatedOrder.save();
    // console.log("add order to db")

    try {
      console.log('Order data before save:', newlyCreatedOrder);
    const savedOrder = await newlyCreatedOrder.save();
    console.log('Order saved successfully:', savedOrder._id);
    const verifyOrder = await Order.findById(savedOrder._id);
    console.log('Verify order exists:', verifyOrder ? 'YES' : 'NO');
    } catch (err) {
    console.error("Error when saving order:", err);
    }
    const body = createPaymentEndpoint(paramVnpay, res);
    res.status(200).json(body)
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const capturePayment = async (req, res) => {
  try{
    getReturnUrl(req, res);
    res.status(200).json({
      success: true,
      message: getReturnUrl(req, res),
      data: order,
    });
  }
  catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId });

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
};

