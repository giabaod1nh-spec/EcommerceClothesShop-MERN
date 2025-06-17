const crypto = require("crypto");
const moment = require("moment");
const qs = require("qs");
const hmacSHA512 = require("crypto-js/hmac-sha512");
// Cấu hình VNPay
const vnpayConfig = {
  vnp_TmnCode: process.env.VNP_TMNCODE,
  vnp_HashSecret: process.env.VNP_HASH_SECRET,
  vnp_Url: process.env.VNP_URL,
  vnp_ReturnUrl: process.env.VNP_RETURN_URL,
};

function getReturnUrl(req, res, next) {
  let vnp_Params = req.query;

  let secureHash = vnp_Params["vnp_SecureHash"];

  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  vnp_Params = sortObject(vnp_Params);

  let config = require("config");
  let tmnCode = config.get("vnp_TmnCode");
  let secretKey = config.get("vnp_HashSecret");

  let querystring = require("qs");
  let signData = querystring.stringify(vnp_Params, { encode: false });
  let crypto = require("crypto");
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");

  if (secureHash === signed) {
    //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua
    console.log("success");
    //res.render('success', {code: vnp_Params['vnp_ResponseCode']})
    return vnp_Params["vnp_ResponseCode"];
  } else {
    return "97";
  }
}

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

function getCurrentDateTime() {
  return moment().format("YYYYMMDDHHmmss");
}

function createPaymentUrl(amount, bankCode, userId) {
  const vnpParams = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: vnpayConfig.vnp_TmnCode,
    vnp_Amount: amount * 100,
    vnp_CurrCode: "VND",
    vnp_Locale: "vn",
    vnp_OrderInfo: "Thanh toan don hang",
    vnp_OrderType: "200000",
    vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
    vnp_CreateDate: getCurrentDateTime(),
    vnp_IpAddr: "127.0.0.1",
    vnp_TxnRef: userId + "_" + getCurrentDateTime(),
    vnp_BankCode: "VNBANK",
  };

  if (bankCode && bankCode !== "") {
    vnpParams.vnp_BankCode = bankCode;
  }

  vnp_Params = sortObject(vnpParams);
  const signData = qs.stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac("sha512", vnpayConfig.vnp_HashSecret);
  let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  vnp_Params.vnp_SecureHash = signed;
  const finalQueryString = qs.stringify(vnp_Params, { encode: false });
  const paymentUrl = vnpayConfig.vnp_Url + "?" + finalQueryString;
  return paymentUrl;
}

function createPaymentEndpoint(req, res) {
  try {
    const { amount, bankCode, userId, orderType = "other" } = req;
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount is required and must be greater than 0",
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const paymentUrl = createPaymentUrl(
      parseInt(amount),
      bankCode || "",
      userId
    );

    const inforPayment = {
      success: true,
      paymentUrl: paymentUrl
    }

    return inforPayment;
  } catch (error) {
    console.error("Create payment error:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while creating payment URL",
    });
  }
}

function verifyReturnUrl(vnpParams) {
  const secureHash = vnpParams.vnp_SecureHash;
  delete vnpParams.vnp_SecureHash;
  delete vnpParams.vnp_SecureHashType;
  const sortedParams = {};
  Object.keys(vnpParams)
    .sort()
    .forEach((key) => {
      sortedParams[key] = vnpParams[key];
    });

  const queryString = qs.stringify(sortedParams, { encode: false });
  const calculatedHash = hmacSHA512(vnpayConfig.vnp_HashSecret, queryString);

  return secureHash === calculatedHash;
}

function handlePaymentReturn(req, res) {
  try {
    const vnpParams = req.query;
    const isValidSignature = verifyReturnUrl({ ...vnpParams });

    if (isValidSignature) {
      const responseCode = vnpParams.vnp_ResponseCode;
      const orderId = vnpParams.vnp_TxnRef;
      const amount = vnpParams.vnp_Amount / 100;

      if (responseCode === "00") {
        console.log(
          `Payment successful for order: ${orderId}, amount: ${amount}`
        );
        res.json({
          success: true,
          message: "Payment successful",
          orderId: orderId,
          amount: amount,
        });
      } else {
        console.log(
          `Payment failed for order: ${orderId}, code: ${responseCode}`
        );

        res.json({
          success: false,
          message: "Payment failed",
          responseCode: responseCode,
        });
      }
    } else {
      console.log("Invalid signature from VNPay");
      res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }
  } catch (error) {
    console.error("Handle payment return error:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while processing payment return",
    });
  }
}

module.exports = {
  getReturnUrl,
  createPaymentUrl,
  createPaymentEndpoint,
  handlePaymentReturn,
  verifyReturnUrl,
};
