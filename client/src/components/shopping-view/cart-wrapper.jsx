import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import UserCartItemsContent from "./cart-items-content";
import { formatCurrency } from "@/utils/formatCurrency";

function UserCartWrapper({ cartItems, setOpenCartSheet }) {
  const navigate = useNavigate();

  const totalCartAmount =
    cartItems && cartItems.length > 0
      ? cartItems.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0;

  return (
    <SheetContent className="sm:max-w-md flex flex-col h-full">
      <SheetHeader>
        <SheetTitle>Your Cart</SheetTitle>
      </SheetHeader>

      {/* Add max-height and overflow-y-auto to create scrollable container */}
      <div className="mt-8 flex-1 overflow-y-auto max-h-[calc(100vh-200px)]">
        <div className="space-y-4">
          {cartItems && cartItems.length > 0
            ? cartItems.map((item) => <UserCartItemsContent cartItem={item} />)
            : null}
        </div>
      </div>

      <div className="mt-8 space-y-4 pt-4 border-t">
        <div className="flex justify-between">
          <span className="font-bold">Total</span>
          <span className="font-bold">{formatCurrency(totalCartAmount)}</span>
        </div>
      </div>
      <Button
        onClick={() => {
          navigate("/shop/checkout");
          setOpenCartSheet(false);
        }}
        className="w-full mt-6"
      >
        Checkout
      </Button>
    </SheetContent>
  );
}

export default UserCartWrapper;
