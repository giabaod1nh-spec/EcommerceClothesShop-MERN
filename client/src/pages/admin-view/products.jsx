import ProductImageUpload from "@/components/admin-view/image-upload";
import AdminProductTile from "@/components/admin-view/product-tile";
import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { addProductFormElements } from "@/config";
import {
  addNewProduct,
  deleteProduct,
  editProduct,
  fetchAllProducts,
} from "@/store/admin/products-slice";
import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const initialFormData = {
  image: null,
  title: "",
  description: "",
  category: "",
  brand: "",
  price: "",
  salePrice: "",
  totalStock: "",
  averageReview: 0,
};

function AdminProducts() {
  const [openCreateProductsDialog, setOpenCreateProductsDialog] =
    useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);

  const { productList } = useSelector((state) => state.adminProducts);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function isFormValid() {
    // Existing validation
    const basicValidation = Object.keys(formData)
      .filter((currentKey) => currentKey !== "averageReview")
      .map((key) => formData[key] !== "")
      .every((item) => item);

    // Price validation
    const price = parseFloat(formData.price) || 0;
    const salePrice = parseFloat(formData.salePrice) || 0;

    // If sale price exists and is greater than or equal to price, form is invalid
    const priceValidation = salePrice === 0 || salePrice < price;

    return basicValidation && priceValidation;
  }

  function onSubmit(event) {
    event.preventDefault();

    // Check price validation before submitting
    const price = parseFloat(formData.price) || 0;
    const salePrice = parseFloat(formData.salePrice) || 0;

    if (salePrice > 0 && salePrice >= price) {
      toast({
        title: "Invalid Price",
        description: "Sale price must be less than regular price!",
        variant: "destructive",
      });
      return;
    }

    currentEditedId !== null
      ? dispatch(
          editProduct({
            id: currentEditedId,
            formData,
          })
        ).then((data) => {
          console.log(data, "edit");

          if (data?.payload?.success) {
            dispatch(fetchAllProducts());
            setFormData(initialFormData);
            setOpenCreateProductsDialog(false);
            setCurrentEditedId(null);
          }
        })
      : dispatch(
          addNewProduct({
            ...formData,
            image: uploadedImageUrl,
          })
        ).then((data) => {
          if (data.payload.success) {
            dispatch(fetchAllProducts());
            setOpenCreateProductsDialog(false);
            setImageFile(null);
            setFormData(initialFormData);
            toast({
              title: "Product add successfully",
            });
          }
        });
  }

  function handleDelete(getCurrentProductId) {
    dispatch(deleteProduct(getCurrentProductId)).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllProducts());
      }
    });
  }

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  function handleImageChange(e) {
    const file = e.target.files[0];

    // Debug file information
    console.log("File selected:", {
      name: file.name,
      type: file.type,
      size: file.size / 1024 + "KB",
    });

    setImageFile(file);
  }

  // Add this function to show immediate feedback
  function handleFormChange(field, value) {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Check price validation for price and salePrice fields
    if (field === "price" || field === "salePrice") {
      const price = parseFloat(field === "price" ? value : formData.price) || 0;
      const salePrice =
        parseFloat(field === "salePrice" ? value : formData.salePrice) || 0;

      if (salePrice > 0 && salePrice >= price) {
        toast({
          title: "Price Warning",
          description: "Sale price should be less than regular price",
          variant: "destructive",
        });
      }
    }
  }

  console.log(formData, "productList");

  return (
    <Fragment>
      <div className="mb-5 w-full flex justify-end">
        <Button onClick={() => setOpenCreateProductsDialog(true)}>
          Add New Product
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {productList && productList.length > 0
          ? productList.map((productItem) => (
              <AdminProductTile
                setFormData={setFormData}
                setOpenCreateProductsDialog={setOpenCreateProductsDialog}
                setCurrentEditedId={setCurrentEditedId}
                product={productItem}
                handleDelete={handleDelete}
              />
            ))
          : null}
      </div>
      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={() => {
          setOpenCreateProductsDialog(false);
          setCurrentEditedId(null);
          setFormData(initialFormData);
        }}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>
              {currentEditedId !== null ? "Edit Product" : "Add New Product"}
            </SheetTitle>
          </SheetHeader>
          <ProductImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
            isEditMode={currentEditedId !== null}
            onChange={(url) => {
              console.log("Image URL from upload component:", url);
              setUploadedImageUrl(url); // Make sure URL is stored in parent component state
            }}
          />
          <div className="py-6">
            <CommonForm
              onSubmit={onSubmit}
              formData={formData}
              setFormData={(newData) => {
                const changedField = Object.keys(newData).find(
                  (key) => newData[key] !== formData[key]
                );
                if (changedField) {
                  handleFormChange(changedField, newData[changedField]);
                }
              }}
              buttonText={currentEditedId !== null ? "Edit" : "Add"}
              formControls={addProductFormElements}
              isBtnDisabled={!isFormValid()}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminProducts;
