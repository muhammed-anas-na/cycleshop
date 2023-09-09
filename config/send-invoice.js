
const orderModel = require('../models/order-model')
const mongodb = require('mongodb');
const easyinvoice = require('easyinvoice');
const fs = require('fs');
const { Readable } = require("stream");
const user = require('../models/user-model');
const nodemailer = require("nodemailer");
const mongoose = require('mongoose')

const generateAndSendInvoice = async (req, res,orderId,userEmail) => {
  try {
            const id = orderId;
            const result = await orderModel.findOne({ _id: id });
            console.log("Resultt" , result)
            const userData = await user.findOne({ _id: result.userId });
            console.log("User:",userData);
          
            const address = result.adress
            console.log(address);
            const order = {
              id: id,
              total: result.GrandTotal,
              date: result.createdOn, // Use the formatted date
              paymentMethod: result.payment,
              orderStatus: result.orderStatus,
              name: address.name,
              number: address.number,
              pincode: address.pinCode,
              town: address.town,
              state: address.state,
              items: result.items,
            };
            console.log("ORdersss:",order)
            let oid = new mongodb.ObjectId(order.id)
            let Pname =  await orderModel.aggregate([
              {$match:{_id:oid}},
              {$unwind:'$items'},
              {$project:{
                  proId:{$toObjectId:'$items.ProductId'},
                  quantity:'$items.quantity',
                  GrandTotal:'$GrandTotal'  
              }},
              {$lookup:{ 
                  from:'products',
                  localField:'proId',
                  foreignField:'_id',
                  as:'ProductDetails',
              }},
              {
                  $project: {
                      quantity: '$quantity',
                      description: { $arrayElemAt: ['$ProductDetails.name', 0] },
                      price: { $arrayElemAt: ['$ProductDetails.promotionalPrice', 0] },
                      total: '$GrandTotal',
                      "tax-rate": '1',
                      _id:0
                  }
              }
          ])
          console.log("Pnameee:" , Pname)
    
            //set up the product
            const products = order.items.map((product,i) => ({
              quantity: parseInt(product.quantity),
              description: Pname[i].description,
              price: parseInt(product.price),
              total: order.total,
              "tax-rate": 0,
            }));
            const isoDateString = order.date;
            const isoDate = new Date(isoDateString);
        
            const options = { year: "numeric", month: "long", day: "numeric" };
            const formattedDate = isoDate.toLocaleDateString("en-US", options);
            const data = {
              customize: {
                //  "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html
              },
              images: {
                // The invoice background
                background: "https://public.easyinvoice.cloud/img/watermark-draft.jpg",
              },
              // Your own data
              sender: {
                company: "Cycle Shop",
                address: "Kakkanad PO,Ernakulam",
                city: "Kochi",
                country: "India",
              },
              client: {
                company: "Customer Address",
                "zip": order.pincode,
                "city": order.town,
                "address": order.state,
                // "custom1": "custom value 1",
                // "custom2": "custom value 2",
                // "custom3": "custom value 3"
              },
              information: {
                // Invoice number
                number:  order.id,
                // ordered date
                date: formattedDate,
              },
              products: products,
              "bottom-notice": "Happy shoping and visit Cycle shop again",
            };
        
            const pdfResult = await easyinvoice.createInvoice(data);
            const pdfBuffer = Buffer.from(pdfResult.pdf, "base64");
            require('dotenv').config();
            const transporter = nodemailer.createTransport({
                service:'gmail',
                auth:{
                    user:process.env.email,
                    pass:process.env.password,
                }
            })

    const mailOptions = {
      from: process.env.email, // Sender's email address
      to: userEmail, // Recipient's email address
      subject: "Invoice", // Email subject
      text: "Please find the attached invoice.", // Email body text
      attachments: [
        {
          filename: "invoice.pdf", // Name of the attached file
          content: pdfBuffer, // The PDF content as buffer
        },
      ],
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Email error:", error);
        return false
      } else {
        console.log("Email sent:", info.response);
        return true
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { generateAndSendInvoice };
