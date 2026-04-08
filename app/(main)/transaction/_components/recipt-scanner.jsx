// "use client";

// import { useRef, useEffect } from "react";
// import { Camera, Loader2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { toast } from "sonner";
// import useFetch from "@/hooks/use-fetch";
// import { scanReceipt } from "@/actions/transaction";

// export function ReceiptScanner({ onScanComplete }) {
//   const fileInputRef = useRef(null);

//   const {
//     loading: scanReceiptLoading,
//     fn: scanReceiptFn,
//     data: scannedData,
//   } = useFetch(scanReceipt);

//   const handleReceiptScan = async (file) => {
//     if (file.size > 5 * 1024 * 1024) {
//       toast.error("File size should be less than 5MB");
//       return;
//     }

//     await scanReceiptFn(file);
//   };

//   useEffect(() => {
//     if (scannedData && !scanReceiptLoading) {
//       onScanComplete(scannedData);
//       toast.success("Receipt scanned successfully");
//     }
//   }, [scanReceiptLoading, scannedData]);

//   return (
//     <div className="flex items-center gap-4">
//       <input
//         type="file"
//         ref={fileInputRef}
//         className="hidden"
//         accept="image/*"
//         capture="environment"
//         onChange={(e) => {
//           const file = e.target.files?.[0];
//           if (file) handleReceiptScan(file);
//         }}
//       />
//       <Button
//         type="button"
//         variant="outline"
//         className="w-full h-10 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 animate-gradient hover:opacity-90 transition-opacity text-white hover:text-white"
//         onClick={() => fileInputRef.current?.click()}
//         disabled={scanReceiptLoading}
//       >
//         {scanReceiptLoading ? (
//           <>
//             <Loader2 className="mr-2 animate-spin" />
//             <span>Scanning Receipt...</span>
//           </>
//         ) : (
//           <>
//             <Camera className="mr-2" />
//             <span>Scan Receipt with AI</span>
//           </>
//         )}
//       </Button>
//     </div>
//   );
// }

"use client";

import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Tesseract from "tesseract.js";

export function ReceiptScanner({ onScanComplete }) {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleReceiptScan = async (file) => {
    try {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }

      setLoading(true);
      toast.loading("Scanning receipt...");

      const {
        data: { text },
      } = await Tesseract.recognize(file, "eng");

      console.log("OCR TEXT:", text);

      // -------- SMART PARSING LOGIC --------

      const lowerText = text.toLowerCase();

      // Amount
      let amount = 0;

      const totalMatch = text.match(/total\s*[:\-]?\s*\$?(\d+[.,]?\d{0,2})/i);

      if (totalMatch) {
        let rawAmount = totalMatch[1];

        // 🔥 Fix OCR extra digit (552 → 52)
        if (parseFloat(rawAmount) > 100 && rawAmount.startsWith("5")) {
          rawAmount = rawAmount.slice(1);
        }

        amount = parseFloat(rawAmount);
      } else {
        const amountMatch = text.match(/\d+[.,]?\d{0,2}/g);

        if (amountMatch) {
          const numbers = amountMatch
            .map(Number)
            .filter((n) => n > 0 && n < 10000);

          amount = numbers.length ? Math.max(...numbers) : 0;
        }
      }

      // Date
      const dateMatch = text.match(/\b(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})\b/);
      let parsedDate = new Date();

      if (dateMatch) {
        const tempDate = new Date(dateMatch[0]);
        if (!isNaN(tempDate.getTime())) {
          parsedDate = tempDate;
        }
      }

      const date = parsedDate;

      // Merchant
      const lines = text.split("\n").filter(Boolean);
      const merchantName = lines[0] || "Unknown";

      // Description
      const description = lines.slice(0, 3).join(" ");

      // 🧠 TYPE DETECTION
      let type = "EXPENSE";

      // income keywords
      if (
        lowerText.includes("salary") ||
        lowerText.includes("credited") ||
        lowerText.includes("payment received") ||
        lowerText.includes("income")
      ) {
        type = "INCOME";
      }

      // 🧠 CATEGORY DETECTION
      let category = "other-expense";

      if (type === "EXPENSE") {
        if (
          lowerText.includes("burger") ||
          lowerText.includes("food") ||
          lowerText.includes("restaurant") ||
          lowerText.includes("chicken")
        ) {
          category = "food";
        } else if (
          lowerText.includes("amazon") ||
          lowerText.includes("store")
        ) {
          category = "shopping";
        } else if (
          lowerText.includes("hospital") ||
          lowerText.includes("medical")
        ) {
          category = "healthcare";
        } else if (lowerText.includes("uber") || lowerText.includes("taxi")) {
          category = "transportation";
        }
      } else {
        if (lowerText.includes("salary")) {
          category = "salary";
        } else if (lowerText.includes("freelance")) {
          category = "freelance";
        } else if (lowerText.includes("rent")) {
          category = "rental";
        } else {
          category = "other-income";
        }
      }

      // ✅ FINAL OUTPUT
      onScanComplete({
        amount,
        date,
        description,
        category,
        type,
        merchantName,
      });

      toast.dismiss();
      toast.success("Receipt scanned successfully");
    } catch (error) {
      console.error(error);
      toast.dismiss();
      toast.error("Failed to scan receipt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleReceiptScan(file);
        }}
      />

      <Button
        type="button"
        variant="outline"
        className="w-full h-10 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 animate-gradient hover:opacity-90 transition-opacity text-white hover:text-white"
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 animate-spin" />
            <span>Scanning Receipt...</span>
          </>
        ) : (
          <>
            <Camera className="mr-2" />
            <span>Scan Receipt</span>
          </>
        )}
      </Button>
    </div>
  );
}
