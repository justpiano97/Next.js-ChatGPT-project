import React, { useCallback, useContext } from "react";
import { toast } from "react-toastify";
import { useDropzone } from "react-dropzone";
import UploadPattern from "../../../assets/svg/upload_pattern.svg";
import UploadIcon from "../../../assets/svg/upload.svg";
import { FileType, MainContext } from "../../../layout/MainContextProvider";
import { AuthContext } from "../../../layout/AuthContextProvider";

const MyDropzone = () => {
  const { user } = useContext(AuthContext);
  const { setShowPdf, setFiles } = useContext(MainContext);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if ((file?.size ?? 0) > (user?.Plan?.size ?? 10) * 1024 * 1024) {
      toast("File size is over, you should upgrate your plan!");
      return;
    }
    setFiles((prev: FileType[]) => {
      let newFiles = prev;
      const actived = newFiles.findIndex((item) => item.active);
      newFiles[actived].file = file;
      newFiles[actived].name = file.name;
      return newFiles;
    });
    setShowPdf(true);
  }, []);
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      className="flex items-center justify-center w-full bg-transparent border-none outline-none dark:bg-gradient-radial ring-0"
    >
      <input {...getInputProps()} className="border-none outline-none ring-0" />
      <div className="flex flex-col items-center justify-center">
        <UploadPattern />
        <button className="flex items-center justify-center gap-6 px-4 py-3 mt-2 font-base bg-third">
          <p className="text-white">UPLOAD YOUR FILE</p>
          <UploadIcon />
        </button>
        <p className="mt-2 text-sm text-center text-semiLightText">Click or drag file tothis area to upload</p>
      </div>
    </div>
  );
};

export default MyDropzone;
