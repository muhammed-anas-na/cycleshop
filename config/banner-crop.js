const sharp = require("sharp");
const fs = require('fs')
exports.resizeImages = async (req, res, next) => {
  if (!req.file) return next();
  console.log("Resizing images ==========>>>>");
  console.log(req.file)
  req.body.images = [];
    const newFilename =  req.file.filename;
    const inputFilePath = req.file.path;
    console.log("Resizing image ----- " + newFilename);
    await sharp(req.file.path)
      .resize(1600, 530)
      .toFormat("png")
      .png({ quality: 90 })
      .toBuffer((err, processedImageBuffer) => {
        if (err) {
          console.error('Error while cropping the image:', err);
          // Handle the error as needed
        } else {
          // Save the processed image back to the same file path
          fs.writeFile(inputFilePath, processedImageBuffer, (writeErr) => {
            if (writeErr) {
              console.error('Error while saving the processed image:', writeErr);
              // Handle the error as needed
            } else {
              console.log('Image cropped and saved successfully to:', inputFilePath);
              // Handle success or return a response as needed
            }
          });
        }
      });

    req.body.images.push(newFilename);
    // req.file.map(async file => {
    // })
  console.log("Passing images to next middleware");
  next();
};


// const sharp = require('sharp')
// const fs = require('fs')

// module.exports={
//     bannerCrop:(req)=>{
//       const inputFilePath = req.file.path;
//       const cropRegion = {
//         top:0,
//         left:0,
//         width: 1600,
//         height: 530,
//       };
      
//       // Use sharp to read the input image
//       sharp(inputFilePath)
//         .extract(cropRegion)
        // .toBuffer((err, processedImageBuffer) => {
        //   if (err) {
        //     console.error('Error while cropping the image:', err);
        //     // Handle the error as needed
        //   } else {
        //     // Save the processed image back to the same file path
        //     fs.writeFile(inputFilePath, processedImageBuffer, (writeErr) => {
        //       if (writeErr) {
        //         console.error('Error while saving the processed image:', writeErr);
        //         // Handle the error as needed
        //       } else {
        //         console.log('Image cropped and saved successfully to:', inputFilePath);
        //         // Handle success or return a response as needed
        //       }
        //     });
        //   }
        // });
      
//     }
// }