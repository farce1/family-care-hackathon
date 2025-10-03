"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

export function UploadMedicalRecordDialog() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles && selectedFiles.length > 0) {
      console.log("Selected files:", Array.from(selectedFiles).map(f => f.name))
      // TODO: Handle file upload logic here
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        onClick={handleButtonClick}
        className="flex items-center gap-2 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white"
      >
        <Upload className="w-5 h-5" />
        Upload Medical Record
      </Button>
    </>
  )
}
