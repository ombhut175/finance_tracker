import { toast } from "react-toastify";
import axios from "axios";
import {axiosInstance} from "@/services/fetcher";

// Flag to prevent multiple toasts
let toastCalled = false;

// Toast IDs for consistent reference
const ERROR_TOAST_ID = "error-toast-id";
const SUCCESS_TOAST_ID = "success-toast-id";


export const handleError = (error: unknown) => {
    // If a toast is already active, don't show another one
    if (toastCalled) return;

    // Set the flag to prevent multiple toasts
    toastCalled = true;

    // Log the error to console for debugging
    console.error("Error details:", error);

    let errorMessage = "An unexpected error occurred";

    // Handle different error types
    if (typeof error === "string") {
        errorMessage = error;
    } else if (error instanceof Error) {
        errorMessage = error.message;

        // Special handling for Axios errors
        if (axios.isAxiosError(error)) {
            console.log("Axios error detected");

            // Extract message from Axios error response
            if (error.response?.data) {
                if (typeof error.response.data === "string") {
                    errorMessage = error.response.data;
                } else if (typeof error.response.data === "object") {
                    // Check for common message fields
                    if ("message" in error.response.data) {
                        errorMessage = String(error.response.data.message);
                    } else if ("error" in error.response.data) {
                        errorMessage = String(error.response.data.error);
                    } else if ("detail" in error.response.data) {
                        errorMessage = String(error.response.data.detail);
                    }
                }
            }
        }
    } else if (error && typeof error === "object") {
        // Check for message property
        if ("message" in error) {
            errorMessage = String(error.message);
        }

        // Check for axios error response structure
        if ("response" in error && error.response && typeof error.response === "object") {
            // Check for data property in response
            if ("data" in error.response && error.response.data) {
                if (typeof error.response.data === "string") {
                    errorMessage = error.response.data;
                } else if (typeof error.response.data === "object" && "message" in error.response.data) {
                    errorMessage = String(error.response.data.message);
                }
            }
        }
    }

    console.log("Final error message =", errorMessage);

    // Use a consistent toast ID to prevent duplicates
    toast.error(errorMessage, {
        toastId: ERROR_TOAST_ID,
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        onClose: () => {
            // Reset the flag when the toast is closed
            toastCalled = false;
        }
    });

    // Fallback reset of the flag after 5 seconds
    // This ensures the flag is reset even if the onClose callback doesn't fire
    setTimeout(() => {
        toastCalled = false;
    }, 5000);
};


export const handleSuccess = (responseData:{success?: boolean, message?: string, body?:{}})=>{
    if (!responseData.success){
        return;
    }

    // If a toast is already active, don't show another one
    if (toastCalled) return;

    // Set the flag to prevent multiple toasts
    toastCalled = true;

    if (!responseData?.message) {
        console.warn("handleSuccess called without a message.");
        toastCalled = false; // Reset flag since we're not showing a toast
        return;
    }

    // Use a consistent toast ID to prevent duplicates
    toast.success(responseData.message, {
        toastId: SUCCESS_TOAST_ID,
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        onClose: () => {
            // Reset the flag when the toast is closed
            toastCalled = false;
        }
    });

    // Fallback reset of the flag after 5 seconds
    setTimeout(() => {
        toastCalled = false;
    }, 5000);
}


export const handleResponse = (response: any) => {
    try {
        // First check HTTP status
        if (response.status >= 200 && response.status < 300) {
            // Then check API-specific success indicator if it exists
            if (response.data && !response.data.success) {
                throw new Error(response.data.message || "Operation failed");
            }


            return response.data;
        } else {
            // This block is less likely to execute since axios usually throws for non-2xx
            const errorMessage = response.data?.message || "Unexpected error occurred";
            throw new Error(`Error ${response.status}: ${errorMessage}`);
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || error.message || "Request failed";
            throw new Error(message);
        }
        throw error; // Re-throw if it's not an axios error
    }
}

export const postRequest = async (url: string, data = {}) => {

    const response = await axiosInstance.post(url, data);

    handleSuccess(response.data);
    return handleResponse(response);
};


export const patchRequest = async (url: string, data = {}) => {
    console.log("::: patch request :::");

    const response = await axiosInstance.patch(url, data,{withCredentials: true});

    console.log(response);
    return handleResponse(response);
};

export const putRequest = async (url: string, data = {}) => {
    const response = await axiosInstance.put(url, data);

    return handleResponse(response);
};

export const getRequest = async (url: string) => {
    const response = await axiosInstance.get(url,{withCredentials: true});

    return handleResponse(response);
}

export const deleteRequest = async (url: string) => {
    const response = await axiosInstance.delete(url, { withCredentials: true });
    return handleResponse(response);
};