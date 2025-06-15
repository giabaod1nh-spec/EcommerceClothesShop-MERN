import ProductImageUpload from "@/components/admin-view/image-upload";
import { Button } from "@/components/ui/button";
import { addFeatureImage, getFeatureImages } from "@/store/common-slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

function AdminDashboard() {
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const dispatch = useDispatch();
  const { featureImageList } = useSelector((state) => state.commonFeature);

  console.log(uploadedImageUrl, "uploadedImageUrl");

  function handleUploadFeatureImage() {
    console.log("About to dispatch with URL:", uploadedImageUrl); // Log URL before dispatching

    dispatch(addFeatureImage(uploadedImageUrl)).then((data) => {
      console.log("Feature image response:", data); // Log the response

      if (data?.payload?.success) {
        dispatch(getFeatureImages());
        setImageFile(null);
        setUploadedImageUrl("");
      }
    });
  }

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  console.log(featureImageList, "featureImageList");

  return (
    <div>
      <ProductImageUpload
        imageFile={imageFile}
        setImageFile={setImageFile}
        uploadedImageUrl={uploadedImageUrl}
        setUploadedImageUrl={setUploadedImageUrl}
        setImageLoadingState={setImageLoadingState}
        imageLoadingState={imageLoadingState}
        isCustomStyling={true}
        isEditMode={false}
        onChange={(url) => {
          console.log("Image URL from upload component:", url);
          setUploadedImageUrl(url); // Make sure URL is stored in parent component state
        }}
      />
      <Button onClick={handleUploadFeatureImage} className="mt-5 w-full">
        Upload
      </Button>
      <div className="flex flex-col gap-4 mt-5">
        {featureImageList && featureImageList.length > 0
          ? featureImageList.map((featureImgItem) => (
              <div className="relative">
                <img
                  src={featureImgItem.image}
                  className="w-full h-[300px] object-cover rounded-t-lg"
                />
              </div>
            ))
          : null}
      </div>
      {/* Add this near your form to test the image URL directly */}
      {uploadedImageUrl && (
        <div className="mt-4">
          <h3>Test Image:</h3>
          <img
            src={uploadedImageUrl}
            alt="Test"
            className="w-48 h-48 object-cover border rounded"
          />
          <div className="mt-2 text-xs break-all">{uploadedImageUrl}</div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
