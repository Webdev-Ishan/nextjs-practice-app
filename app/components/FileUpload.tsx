"use client";

import {
  upload,
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  UploadResponse,
} from "@imagekit/next";
import axios from "axios";
import React, { useState } from "react";

interface FileUploadProps {
  onSuccess: (res:UploadResponse) => void;
  onProgress: (progress: number) => void;
  fileType?: "Image" | "video"; // fixed typo from "vedio"
}

const UploadExample = ({ onSuccess, onProgress, fileType }: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  const validateFile = (file: File) => {
    if (fileType === "video") {
      if (!file.type.startsWith("video/")) {
        setError("Please upload a valid video file");
        return false;
      }
      if (file.size > 100 * 1024 * 1024) {
        setError("File size should be less than 100MB");
        return false;
      }
    }
    return true;
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file = e.target.files?.[0];

    if (!file || !validateFile(file)) {
      return;
    }

    setUploading(true);
    setError("");
    setProgress(0);

    try {
      const authRes = await axios.get("/api/auth/imagekit-auth");
      const data = authRes.data as {
        signature: string;
        token: string;
        expire: number;
      };

      const uploadResponse = await upload({
        file,
        fileName: file.name,
        publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
        signature: data.signature,
        token: data.token,
        expire: data.expire,
        onProgress: (event) => {
          const percent = Math.round((event.loaded / event.total) * 100);
          setProgress(percent);
          onProgress(percent);
        },
      });

      onSuccess(uploadResponse);
    } catch (err) {
      if (
        err instanceof ImageKitAbortError ||
        err instanceof ImageKitInvalidRequestError ||
        err instanceof ImageKitUploadNetworkError ||
        err instanceof ImageKitServerError
      ) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <input
        type="file"
        accept={fileType === "video" ? "video/*" : "image/*"}
        onChange={handleChange}
        disabled={uploading}
      />
      <br />
      Upload progress:{" "}
      <progress value={progress} max={100}>
        {progress}%
      </progress>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </>
  );
};

export default UploadExample;

