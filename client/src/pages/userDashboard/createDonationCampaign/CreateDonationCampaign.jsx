import { useFormik } from "formik";
import { useContext } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from 'yup';
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import axios from "axios";
import { AuthContext } from "../../../components/providers/AuthProvider";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Campaign name is required')
    .min(3, 'Campaign name must be at least 3 characters'),
  max_donation_limit: Yup.number()
    .required('Maximum donation limit is required')
    .min(1, 'Maximum donation limit must be greater than 0'),
  date: Yup.date()
    .required('Last donation date is required')
    .min(new Date(), 'Last donation date must be in the future'),
  shortdesp: Yup.string()
    .required('Short description is required')
    .min(10, 'Short description must be at least 10 characters')
    .max(100, 'Short description must not exceed 100 characters'),
  longdesp: Yup.string()
    .required('Long description is required')
    .min(50, 'Long description must be at least 50 characters')
    .max(1000, 'Long description must not exceed 1000 characters'),
  photo: Yup.mixed()
    .required('Image is required')
});

const CreateDonationCampaign = () => {
  const { user } = useContext(AuthContext);
  const [image, setImage] = useState('');
  const [url, setUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const saveImage = async () => {
    try {
      if (!image) {
        throw new Error("Please upload an image");
      }

      // Check image size
      if (image.size > MAX_IMAGE_SIZE) {
        throw new Error("Image size should be less than 5MB");
      }

      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", image);
      formData.append("upload_preset", "petadding");
      formData.append("cloud_name", "dtwz2gkbz");

      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dtwz2gkbz/image/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data && response.data.secure_url) {
        setUrl(response.data.secure_url);
        return response.data.secure_url;
      } else {
        throw new Error("Image upload failed");
      }
    } catch (error) {
      toast.error(error.message || "Error uploading image. Please try again.");
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const initialValues = {
    name: "",
    max_donation_limit: "",
    date: "",
    shortdesp: "",
    longdesp: "",
    photo: "",
  };

  const { values, errors, touched, handleBlur, handleChange, handleSubmit, setFieldValue } = useFormik({
    initialValues: initialValues,
    validationSchema: validationSchema,
    onSubmit: async () => {
      try {
        // Upload image first
        const imageUrl = await saveImage();
        
        // Create campaign data
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString("en-US");
        const formattedTime = currentDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: true,
        });

        const newdonationcamp = {
          image: imageUrl,
          name: values.name,
          max_donation_limit: values.max_donation_limit,
          last_donation_date: values.date,
          shortdesp: values.shortdesp,
          longdesp: values.longdesp,
          addedDate: `${formattedDate} ${formattedTime}`,
          userEmail: user.email,
          pause: false
        };

        const response = await fetch("http://localhost:5007/adddonationcamp", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(newdonationcamp),
        });

        if (!response.ok) {
          throw new Error('Failed to create donation campaign');
        }

        const data = await response.json();
        console.log('Donation campaign created:', data);

        if (data.insertedId) {
          Swal.fire({
            title: "Success!",
            text: "Donation Campaign Added Successfully",
            icon: "success",
            confirmButtonText: "Ok",
          });
          navigate('/mydonationcamp');
        } else {
          throw new Error('Failed to create donation campaign');
        }
      } catch (error) {
        console.error("Error adding camp:", error);
        Swal.fire({
          title: "Error!",
          text: error.message || "Failed to create donation campaign",
          icon: "error",
          confirmButtonText: "Ok",
        });
      }
    },
  });

  return (
    <div>
      <div className="flex items-center justify-center p-12 w-full lg:w-10/12 mx-auto bg-base-7f00 mt-16 rounded-xl">
        <div className="mx-auto w-full max-w-[550px] shadow-lg p-6 rounded-md">
          <form onSubmit={handleSubmit}>
            <div className='flex'>
              <div className="w-full">
                <label className="mb-3 block text-base font-medium text-[#07074D]">
                  Campaign Image
                </label>
                <div className="input flex justify-end mb-5">
                  <p>Image file:</p>
                  <label
                    htmlFor="file-upload"
                    className="custom-file-upload">
                    {image ? (
                      <img
                        className="w-10 lg:w-10 rounded-xl"
                        src={URL.createObjectURL(image)}
                        alt="Campaign"
                      />
                    ) : (
                      <img
                        src="https://cdn-icons-png.flaticon.com/128/1665/1665680.png"
                        className="w-10"
                        alt="Upload"
                      />
                    )}
                  </label>
                  <input
                    id="file-upload"
                    className='text-white file-input file-input-bordered w-full max-w-xs'
                    type="file"
                    name="photo"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file && file.size > MAX_IMAGE_SIZE) {
                        toast.error("Image size should be less than 5MB");
                        return;
                      }
                      setImage(file);
                      setFieldValue('photo', file);
                    }}
                    onBlur={handleBlur}
                  />
                </div>
                {errors.photo && touched.photo && (
                  <p className="text-error">{errors.photo}</p>
                )}
              </div>
            </div>

            <div className="mb-5">
              <label className="mb-3 block text-base font-medium text-[#07074D]">
                Campaign Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                placeholder="Campaign Name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full appearance-none rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
              />
              {errors.name && touched.name && (
                <p className="text-error">{errors.name}</p>
              )}
            </div>

            <div className="mb-5">
              <label className="mb-3 block text-base font-medium text-[#07074D]">
                Maximum Donation Amount
              </label>
              <input
                type="number"
                name="max_donation_limit"
                id="max_donation_limit"
                placeholder="Maximum Donation Limit"
                value={values.max_donation_limit}
                onChange={handleChange}
                onBlur={handleBlur}
                min="1"
                className="w-full appearance-none rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
              />
              {errors.max_donation_limit && touched.max_donation_limit && (
                <p className="text-error">{errors.max_donation_limit}</p>
              )}
            </div>

            <div className="mb-5">
              <label className="mb-3 block text-base font-medium text-[#07074D]">
                Last Donation Date
              </label>
              <input
                type="date"
                name="date"
                id="date"
                value={values.date}
                onChange={handleChange}
                onBlur={handleBlur}
                min={new Date().toISOString().split('T')[0]}
                className="w-full appearance-none rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
              />
              {errors.date && touched.date && (
                <p className="text-error">{errors.date}</p>
              )}
            </div>

            <div className="mb-5">
              <label className="mb-3 block text-base font-medium text-[#07074D]">
                Short Description
              </label>
              <input
                type="text"
                name="shortdesp"
                id="shortdesp"
                placeholder="Short Description"
                value={values.shortdesp}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full appearance-none rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
              />
              {errors.shortdesp && touched.shortdesp && (
                <p className="text-error">{errors.shortdesp}</p>
              )}
            </div>

            <div className="mb-5">
              <label className="mb-3 block text-base font-medium text-[#07074D]">
                Long Description
              </label>
              <textarea
                name="longdesp"
                id="longdesp"
                placeholder="Long Description"
                value={values.longdesp}
                onChange={handleChange}
                onBlur={handleBlur}
                rows="4"
                className="w-full appearance-none rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md resize-none"
              />
              {errors.longdesp && touched.longdesp && (
                <p className="text-error">{errors.longdesp}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isUploading}
                className={`hover:shadow-form rounded-md hover:bg-blue-400 py-3 px-8 text-center text-base font-semibold text-white outline-none w-full ${
                  isUploading ? 'bg-gray-400' : 'bg-[#ff0000]'
                }`}
              >
                {isUploading ? 'Creating Campaign...' : 'Create Campaign'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateDonationCampaign;