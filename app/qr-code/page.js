
'use client';

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import CategorySelector from "../CategorySelector/page";
import VCardForm from "../VCardForm/page";
import WifiForm from "../WifiForm/page";
import ColorPicker from "../ColorPicker/page";
import SizeSlider from "../SizeSlider/page";
import FileUploader from "../FileUploader/page";
import DownloadButton from "../DownloadButton/page";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";

const QRCodeStyling = dynamic(() => import('qr-code-styling'), { ssr: false });

export default function QRCodeGenerator() {
  const [text, setText] = useState("");
  const [color, setColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [logoFile, setLogoFile] = useState(null);
  const [size, setSize] = useState(300);
  const [shape, setShape] = useState("square");
  const [frame, setFrame] = useState("square");
  const [eyeShape, setEyeShape] = useState("square");
  const [eyeColor, setEyeColor] = useState("#000000");
  const [category, setCategory] = useState("text");
  const [vCardDetails, setVCardDetails] = useState({
    fullName: "",
    organization: "",
    phone: "",
    email: "",
  });
  const [wifiDetails, setWifiDetails] = useState({
    ssid: "",
    encryption: "WPA",
    password: "",
  });

  const qrCodeRef = useRef(null);
  const qrCodeInstance = useRef(null);
  const [downloadFormat, setDownloadFormat] = useState("png");
  const [qrGenerated, setQrGenerated] = useState(false);

  if (!qrCodeInstance.current) {
    qrCodeInstance.current = new QRCodeStyling({
      width: size,
      height: size,
      data: "",
      dotsOptions: { color, type: shape },
      cornersSquareOptions: { type: frame },
      cornersDotOptions: { type: eyeShape, color: eyeColor },
      backgroundOptions: { color: bgColor },
    });
  }

  const handleGenerate = async () => {
    if (category === "vCard") {
      if (
        !vCardDetails.fullName ||
        !vCardDetails.organization ||
        !vCardDetails.phone ||
        !vCardDetails.email
      ) {
        toast.error("Please fill in all fields for vCard.");
        return;
      }
      setText(
        `BEGIN:VCARD\nVERSION:3.0\nFN:${vCardDetails.fullName}\nORG:${vCardDetails.organization}\nTEL:${vCardDetails.phone}\nEMAIL:${vCardDetails.email}\nEND:VCARD`
      );
    } else if (category === "wifi") {
      if (!wifiDetails.ssid || !wifiDetails.password) {
        toast.error("Please fill in the SSID and password for WiFi.");
        return;
      }
      setText(
        `WIFI:T:${wifiDetails.encryption};S:${wifiDetails.ssid};P:${wifiDetails.password};;`
      );
    } else if (category === "text" || category === "URL") {
      if (!text.trim()) {
        toast.error("Text field is empty. Please enter valid data.");
        return;
      }
    }

    setQrGenerated(false);
    if (qrCodeRef.current) {
      qrCodeRef.current.innerHTML = "";
    }

    const updateQRCode = (logoURL = "") => {
      qrCodeInstance.current.update({
        data: text,
        dotsOptions: { color, type: shape },
        cornersSquareOptions: { type: frame },
        cornersDotOptions: { type: eyeShape, color: eyeColor },
        backgroundOptions: { color: bgColor },
        image: logoURL,
      });

      qrCodeInstance.current.append(qrCodeRef.current);

      setTimeout(() => {
        setQrGenerated(true);
      }, 500);
    };

    if (logoFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const logoURL = event.target.result;
        updateQRCode(logoURL);
      };
      reader.readAsDataURL(logoFile);
    } else {
      updateQRCode();
    }
  };

  const handleDownload = () => {
    qrCodeInstance.current.download({
      name: "qr_code",
      extension: downloadFormat,
    });
  };

  const handleCategoryChange = (category) => {
    setCategory(category);
    setQrGenerated(false);
    setText("");

    if (qrCodeRef.current) {
      qrCodeRef.current.innerHTML = "";
    }

    if (category === "vCard") {
      setText(
        `BEGIN:VCARD\nVERSION:3.0\nFN:${vCardDetails.fullName}\nORG:${vCardDetails.organization}\nTEL:${vCardDetails.phone}\nEMAIL:${vCardDetails.email}\nEND:VCARD`
      );
    } else if (category === "URL") {
      setText("");
    } else if (category === "wifi") {
      setText(
        `WIFI:T:${wifiDetails.encryption};S:${wifiDetails.ssid};P:${wifiDetails.password};;`
      );
    } else if (category === "text") {
      setText("");
    }
  };

  return (
    <motion.div
      className="p-8 max-w-lg mx-auto bg-purple-100 dark:bg-indigo-950 rounded-xl shadow-lg mt-10"
      initial={{ opacity: 0, scale: 1 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1 }}
    >
      <motion.h1
        className="text-4xl font-bold mb-6 text-center text-gray-800 dark:text-gray-100"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
      >
        Generate QR Code
      </motion.h1>

      <CategorySelector
        category={category}
        handleCategoryChange={handleCategoryChange}
      />

      {category === "vCard" && (
        <VCardForm
          vCardDetails={vCardDetails}
          setVCardDetails={setVCardDetails}
          setText={setText}
        />
      )}
      {category === "wifi" && (
        <WifiForm
          wifiDetails={wifiDetails}
          setWifiDetails={setWifiDetails}
          setText={setText}
        />
      )}
      {(category === "text" || category === "URL") && (
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
        >
          <label className="block mb-2 text-gray-700 dark:text-gray-200 capitalize">
            {category} Input
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows="4"
            className="w-full dark:bg-[#2b2661] dark:text-gray-200 p-3 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-lg"
            placeholder={`Enter ${category}`}
          />
        </motion.div>
      )}

      <SizeSlider size={size} setSize={setSize} />
      <ColorPicker
        color={color}
        setColor={setColor}
        bgColor={bgColor}
        setBgColor={setBgColor}
        eyeColor={eyeColor}
        setEyeColor={setEyeColor}
        shape={shape}
        setShape={setShape}
        frame={frame}
        setFrame={setFrame}
        eyeShape={eyeShape}
        setEyeShape={setEyeShape}
      />
      <FileUploader handleLogoChange={(e) => setLogoFile(e.target.files[0])} />

      <motion.button
        onClick={handleGenerate}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 transition duration-300"
        whileTap={{ scale: 0.95 }}
      >
        Generate QR Code
      </motion.button>

      <div className="mt-6">
        <div className="text-center">
          <div ref={qrCodeRef} />
        </div>
        {qrGenerated && (
          <DownloadButton handleDownload={handleDownload} />
        )}
      </div>
    </motion.div>
  );
}
