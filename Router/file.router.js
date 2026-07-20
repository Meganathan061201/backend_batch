const express = require("express");
const router = express.Router();

const fs = require("fs");
const path = require("path");
const multer = require("multer");

// =====================================================
// CREATE UPLOAD DIRECTORY
// =====================================================

const uploadDir = path.join(__dirname, "../storage/uploads");




if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// =====================================================
// MULTER STORAGE
// =====================================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {

        const uniqueName =Math.round(Math.random() * 1E9) +"-" +file.originalname.replace(/\s+/g, "-");

        cb(null, uniqueName);
    }

});

// =====================================================
// FILE FILTER
// =====================================================

const allowedMimeTypes = [

    // Images

    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",

    // Documents

    "application/pdf",
    "text/plain",
    "text/csv",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

];

const fileFilter = (req, file, cb) => {

    if (allowedMimeTypes.includes(file.mimetype)) {

        cb(null, true);

    } else {

        cb(new Error("Only Images & Documents are allowed."));

    }

};

// =====================================================
// MULTER
// =====================================================

const upload = multer({

    storage,

    fileFilter,

    limits: {

        fileSize: 5 * 1024 * 1024

    }

});

// =====================================================
// SINGLE FILE UPLOAD
// =====================================================

router.post("/upload-single", (req, res) => {

    upload.single("file")(req, res, (err) => {

        if (err instanceof multer.MulterError) {

            return res.status(400).json({

                success: false,
                message: err.message

            });

        }

        if (err) {

            return res.status(400).json({

                success: false,
                message: err.message

            });

        }

        if (!req.file) {

            return res.status(400).json({

                success: false,
                message: "Please select a file."

            });

        }

        res.status(201).json({

            success: true,

            message: "File uploaded successfully.",

            file: {

                originalName: req.file.originalname,

                savedName: req.file.filename

            }

        });

    });

});

// =====================================================
// MULTIPLE FILE UPLOAD
// =====================================================

router.post("/upload-multiple", (req, res) => {

    upload.array("files", 5)(req, res, (err) => {

        if (err instanceof multer.MulterError) {

            return res.status(400).json({

                success: false,

                message: err.message

            });

        }

        if (err) {

            return res.status(400).json({

                success: false,

                message: err.message

            });

        }

        if (!req.files || req.files.length === 0) {

            return res.status(400).json({

                success: false,

                message: "Please select files."

            });

        }

        const files = req.files.map(file => ({

            originalName: file.originalname,

            savedName: file.filename

            
        }));

        res.status(201).json({

            success: true,

            count: files.length,

            message: "Files uploaded successfully.",

            files

        });

    });

});

module.exports = router;