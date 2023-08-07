const sharp = require('sharp')
const fs = require('fs')

module.exports={
    crop:(req)=>{
        for(let i =0;i<req.files.length;i++){
            const inputFilePath = req.files[i].path;
            const cropRegion = {
              left: 100,
              top: 100,
              width: 4000,
              height: 1000,
            };
            // Use sharp to read the input image
            sharp(inputFilePath)
              .extract(cropRegion)
              .toBuffer((err, processedImageBuffer) => {
                if (err) {
                  console.error('Error while cropping the image:', err);
                  return err;
                } else {
                  fs.writeFile(inputFilePath, processedImageBuffer, (writeErr) => {
                    if (writeErr) {
                      console.error('Error while saving the processed image:', writeErr);
                    } else {
                      console.log('Image cropped and saved successfully to:', inputFilePath);
                      return;
                    }
                  });
                }
              });
            
        }
    }
}