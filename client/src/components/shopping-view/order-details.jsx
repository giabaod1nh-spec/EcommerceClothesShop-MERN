import { useSelector } from "react-redux";
import { Badge } from "../ui/badge";
import { DialogContent } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

function ShoppingOrderDetailsView({ orderDetails }) {
  const { user } = useSelector((state) => state.auth);

  return (
    <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
      <div className="grid gap-6 overflow-y-auto pr-1">
        {/* Order metadata section */}
        <div className="grid gap-2">
          <div className="flex mt-6 items-center justify-between">
            <p className="font-medium">Order ID</p>
            <Label className="text-xs truncate max-w-[200px]">
              {orderDetails?._id}
            </Label>
          </div>

          <div className="flex items-center justify-between">
            <p className="font-medium">Order Date</p>
            <Label>{new Date(orderDetails?.orderDate).toLocaleString()}</Label>
          </div>

          <div className="flex items-center justify-between">
            <p className="font-medium">Total Amount</p>
            <Label>{formatCurrency(orderDetails?.totalAmount)}</Label>
          </div>

          <div className="flex items-center justify-between">
            <p className="font-medium">Payment Method</p>
            <Label>{orderDetails?.paymentMethod}</Label>
          </div>

          <div className="flex items-center justify-between">
            <p className="font-medium">Payment Status</p>
            <Badge
              variant={
                orderDetails?.paymentStatus === "success"
                  ? "success"
                  : "destructive"
              }
            >
              {orderDetails?.paymentStatus}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <p className="font-medium">Order Status</p>
            <Badge variant="outline">{orderDetails?.orderStatus}</Badge>
          </div>
        </div>
        <Separator />

        {/* Order items section with table layout */}
        <div className="grid gap-2">
          <div className="font-medium">Order Details</div>
          <div className="max-h-[250px] overflow-y-auto border rounded-md">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0">
                <TableRow>
                  <TableHead className="w-[40%]">Product</TableHead>
                  <TableHead className="text-center w-[20%]">
                    Quantity
                  </TableHead>
                  <TableHead className="text-center w-[20%]">
                    Unit Price
                  </TableHead>
                  <TableHead className="text-right w-[20%]">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderDetails?.cartItems &&
                orderDetails?.cartItems.length > 0 ? (
                  orderDetails?.cartItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          )}
                          <span className="line-clamp-2">{item.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-center">
                        {formatCurrency(item.price)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.price * item.quantity)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      No items in this order
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Address section */}
        <div className="grid gap-2">
          <div className="font-medium">Shipping Information</div>
          <div className="grid grid-cols-2 gap-2 border rounded-md p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Name:</p>
              <p className="text-sm text-muted-foreground">{user.userName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Phone:</p>
              <p className="text-sm text-muted-foreground">
                {orderDetails?.addressInfo?.phone}
              </p>
            </div>
            <div className="space-y-1 col-span-2">
              <p className="text-sm font-medium">Address:</p>
              <p className="text-sm text-muted-foreground">
                {orderDetails?.addressInfo?.address}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">City:</p>
              <p className="text-sm text-muted-foreground">
                {orderDetails?.addressInfo?.city}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Postal Code:</p>
              <p className="text-sm text-muted-foreground">
                {orderDetails?.addressInfo?.pincode}
              </p>
            </div>
            {orderDetails?.addressInfo?.notes && (
              <div className="space-y-1 col-span-2">
                <p className="text-sm font-medium">Notes:</p>
                <p className="text-sm text-muted-foreground">
                  {orderDetails?.addressInfo?.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

export default ShoppingOrderDetailsView;
