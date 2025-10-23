// const multer = require("multer");
// const fs = require("fs");
// const path = require("path");

// class FileUploader {
//   constructor({
//     folderName = "uploads",
//     supportedFile = ["image/png", "image/jpeg", "image.jpg","image.pdf"],
//     feildSize = 1024 * 1024 * 3,
//   }) {
//     this.folderName = folderName;
//     this.supportedFile = supportedFile;
//     this.feildSize = feildSize;

//     if (!fs.existsSync(this.folderName)) {
//       fs.mkdirSync(this.folderName, { recursive: true });
//     }
//   }

//   storage() {
//     return multer.diskStorage({
//       destination: (req, file, cb) => {
//         cb(null, this.folderName);
//       },
//       filename: (req, file, cb) => {
//         let ext = path.extname(file.originalname);

//         cb(null, Date.now() + ext);
//       },
//     });
//   }

//   fileFilter() {
//     return (req, file, cb) => {
//       if (this.supportedFile.includes(file.mimetype)) {
//         cb(null, true);
//       } else {
//         console.log(
//           `Please a valid File Format supported file Form ${this.supportedFile.join(
//             ","
//           )}`
//         );
//         cb(null, false);
//       }
//     };
//   }
//   upload() {
//     return multer({
//       storage: this.storage(),
//       fileFilter: this.fileFilter(),
//       limits: { fileSize: this.feildSize },
//     });
//   }
// }

// module.exports= FileUploader;






const multer = require("multer");
const fs = require("fs");
const path = require("path");

class FileUploader {

  constructor({
    folderName = "uploads",
    supportedFiles = ["image/png", "image/jpeg", "image/jpg", "application/pdf"],
    fieldSize = 1024 * 1024 * 5, // 5MB default
  }) {
    this.folderName = folderName;
    this.supportedFiles = supportedFiles;
    this.fieldSize = fieldSize;

    // Ensure upload folder exists
    if (!fs.existsSync(this.folderName)) {
      fs.mkdirSync(this.folderName, { recursive: true });
    }
  }

  storage() {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.folderName);
      },
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
        cb(null, `${Date.now()}_${safeName}`);
      },
    });
  }

  fileFilter() {
    return (req, file, cb) => {
      if (this.supportedFiles.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
      }
    };
  }

  upload() {
    return multer({
      storage: this.storage(),
      fileFilter: this.fileFilter(),
      limits: { fileSize: this.fieldSize },
    });
  }
}

module.exports = FileUploader;
