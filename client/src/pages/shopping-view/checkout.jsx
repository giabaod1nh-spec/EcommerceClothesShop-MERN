import Address from "@/components/shopping-view/address";
import img from "../../assets/account.jpg";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { createNewOrder } from "@/store/shop/order-slice";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/utils/formatCurrency";
import moment from 'moment'
function getCurrentDateTime() {
  return moment().format("YYYYMMDDHHmmss");
}


function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { approvalURL } = useSelector((state) => state.shopOrder);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isPaymentStart, setIsPaymemntStart] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();

  console.log(currentSelectedAddress, "cartItems");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const vnpResponseCode = urlParams.get('vnp_ResponseCode');
    const vnpTransactionStatus = urlParams.get('vnp_TransactionStatus');
    const vnpAmount = urlParams.get('vnp_Amount');
    const vnpOrderInfo = urlParams.get('vnp_OrderInfo');
    const vnpPayDate = urlParams.get('vnp_PayDate');
    const vnpTransactionNo = urlParams.get('vnp_TransactionNo');
    const vnpTxnRef = urlParams.get('vnp_TxnRef');
    const vnpSecureHash = urlParams.get('vnp_SecureHash');
    console.log("responsecode: " + vnpResponseCode)

    if (vnpResponseCode == '00') {
      console.log('VNPAY Payment Response:', {
        responseCode: vnpResponseCode,
        transactionStatus: vnpTransactionStatus,
        amount: vnpAmount,
        orderInfo: vnpOrderInfo,
        payDate: vnpPayDate,
        transactionNo: vnpTransactionNo,
        txnRef: vnpTxnRef,
        secureHash: vnpSecureHash
      });

      if (vnpResponseCode === '00' && vnpTransactionStatus === '00') {

        toast({
          title: "Thanh toán thành công!",
          description: `Giao dịch ${vnpTransactionNo} đã được xử lý thành công.`,
          variant: "default",
        });
        window.history.replaceState({}, document.title, window.location.pathname);
        
      } else {
        toast({
          title: "Thanh toán thất bại!",
          description: "Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.",
          variant: "destructive",
        });
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
    else if(vnpResponseCode === '24'){
      toast({
          title: "Thanh toán thất bại!",
          description: "",
          variant: "destructive",
        });
        window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  const totalCartAmount =
    cartItems && cartItems.items && cartItems.items.length > 0
      ? cartItems.items.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0;

  function handleInitiatePaypalPayment() {
    if (cartItems.length === 0) {
      toast({
        title: "Your cart is empty. Please add items to proceed",
        variant: "destructive",
      });

      return;
    }
    if (currentSelectedAddress === null) {
      toast({
        title: "Please select one address to proceed.",
        variant: "destructive",
      });

      return;
    }

    const orderData = {
      userId: user?.id,
      cartId: cartItems?._id,
      cartItems: cartItems.items.map((singleCartItem) => ({
        productId: singleCartItem?.productId,
        title: singleCartItem?.title,
        image: singleCartItem?.image,
        price:
          singleCartItem?.salePrice > 0
            ? singleCartItem?.salePrice
            : singleCartItem?.price,
        quantity: singleCartItem?.quantity,
      })),
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        city: currentSelectedAddress?.city,
        pincode: currentSelectedAddress?.pincode,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes || "",
      },
      orderStatus: "pending",
      paymentMethod: "paypal",
      paymentStatus: "pending",
      totalAmount: totalCartAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      paymentId: user?.id + '_' + getCurrentDateTime(),
      payerId: "",
    };

    console.log(orderData)

    dispatch(createNewOrder(orderData)).then((data) => {
      console.log("data response: ", data)
      if (data?.payload?.success) {
        const urlPaymentVNPAY = data.payload.paymentUrl
        window.location.href = urlPaymentVNPAY;
        setIsPaymemntStart(true);
      } else {
        setIsPaymemntStart(false);
      }
    });
  }

  if (approvalURL) {
    window.location.href = approvalURL;
  }

  return (
    <div className="flex flex-col">
      <div className="relative h-[300px] w-full overflow-hidden">
        <img src={img} className="h-full w-full object-cover object-center" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 p-5">
        <Address
          selectedId={currentSelectedAddress}
          setCurrentSelectedAddress={setCurrentSelectedAddress}
        />
        <div className="flex flex-col gap-4">
          {cartItems && cartItems.items && cartItems.items.length > 0
            ? cartItems.items.map((item) => (
                <UserCartItemsContent cartItem={item} />
              ))
            : null}
          <div className="mt-8 space-y-4">
            <div className="flex justify-between">
              <span className="font-bold">Total</span>
              <span className="font-bold">
                {formatCurrency(totalCartAmount)}
              </span>
            </div>
          </div>
          <div className="mt-4 w-full">
            <Button onClick={handleInitiatePaypalPayment} className="w-full">
              {isPaymentStart
                ? "Processing VNPAY Payment..."
                : "Checkout with VNPAY"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;
