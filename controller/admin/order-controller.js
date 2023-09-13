const orderModel = require('../../models/order-model')
const mongodb = require('mongodb');
const easyinvoice = require('easyinvoice');
const fs = require('fs');
const { Readable } = require("stream");
const user = require('../../models/user-model');
const userModel = require('../../models/user-model');
const invoice = require('../../config/invoice');
const moment = require('moment');

module.exports={
    invoice:async(req,res)=>{
      try{
        await invoice.invoice(req,res);
      }catch(err){
        console.log(err)
        res.send("Error while preparing the invoice");
      }
  },
    showOrders:async(req,res)=>{
        //let orders = await orderModel.find()
        //res.render('admin/view-orders' , {orders})
        try {
            const order = await orderModel.find({});
            const itemsperpage = 15;
            order.reverse()
            const currentpage = parseInt(req.query.page) || 1;
            const startindex = (currentpage - 1) * itemsperpage;
            const endindex = startindex + itemsperpage;
            const totalpages = Math.ceil(order.length / 5);
            const currentproduct = order.slice(startindex,endindex);
            console.log(currentproduct)
            res.render('admin/view-orders', { orders: currentproduct , totalpages , currentpage});
          } catch (error) {
            console.log(error);
          }
    },
    showOrderDetails:async(req,res)=>{
        console.log(req.params.orderId);
        let orderDetails = await orderModel.findById(req.params.orderId);
        console.log("Order detailsss",orderDetails)
        let oid = new mongodb.ObjectId(req.params.orderId)
        let productDetails = await orderModel.aggregate([
            {
                $match:{_id:oid}
            },
            {
                $unwind:'$items'
            },
            {$project:{
                proId:{'$toObjectId':'$items.ProductId'},
                // adress:'$adress',
                // GrandTotal:'$GrandTotal',
                // paymentstatus:'$paymentstatus',
                // userId:'$userId',
                // orderStatus:'$orderStatus',
                // payment:'$payment',
                // createdOnS:'$createdOnS',
                // createdOn:'$createdOn',
                // items:'$items'
            }},
            {$lookup:{
                from:'products',
                localField:'proId', 
                foreignField:'_id',
                as:'ProductDetails',
            }},
        ])
        console.log("productDetails :" , productDetails)
        res.render('admin/order-details' , {orderDetails , productDetails})
    },
    changeStatus:(req,res)=>{
      try{
          orderModel.findByIdAndUpdate(req.body.orderId , {orderStatus:req.body.status},{new:true}).then((status)=>{
            console.log("This is status : ",status);
            const discount = "+"+status.GrandTotal;
            if(status.orderStatus == 'cancled'){
              userModel.findByIdAndUpdate(status.userId , {$inc:{'wallet':status.GrandTotal},$push:{'history':discount}}).then((status)=>{console.log("Status : ",status)})
            }
            res.json(true);            
          }).catch((err)=>{
            console.log(err);
            res.json(false);
          })

      }catch(err){
        console.log(err)
        res.json(false);
      }
    },
    salesToday:async(req,res)=>{
      let todaysales = new Date()
      const startOfDay = new Date(
          todaysales.getFullYear(),
          todaysales.getMonth(),
          todaysales.getDate(),
          0,
          0,
          0,
          0
      );

      const endOfDay = new Date(
          todaysales.getFullYear(),
          todaysales.getMonth(),
          todaysales.getDate(),
          23,
          59,
          59,
          999
      );
        console.log(startOfDay)
      const order = await orderModel.find({
          createdOn: {
              $gte: startOfDay,
              $lt: endOfDay
            }
        }).sort({ createdOn: -1 });
         res.render('admin/sales-report',{order , salesToday:true})
      
  },
  salesWeekly:async(req,res)=>{
      const currentDate = new Date();

      const startOfWeek = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() - currentDate.getDay()
      );
      const endOfWeek = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() + (6 - currentDate.getDay()),
          23,
          59,
          59,
          999
      );
      console.log(currentDate<endOfWeek);
      console.log(endOfWeek);

      const order = await orderModel.find({
          
          createdOn: {
              $gte: startOfWeek,
              $lt: endOfWeek
          }
      }).sort({ createdOn: -1 });
          res.render('admin/sales-report',{order,salesToday:false,salesWeekly:true})
  },salesMonthly:async(req,res)=>{
      const thisMonth = new Date().getMonth() + 1;
      const startofMonth = new Date(
          new Date().getFullYear(),
          thisMonth - 1,
          1,
          0,
          0,
          0,
          0
      );
      const endofMonth = new Date(
          new Date().getFullYear(),
          thisMonth,
          0,
          23,
          59,
          59,
          999
      );

      const order = await orderModel.find({
          
          createdOn: {
              $gte: startofMonth,
              $lt: endofMonth
          }
      }).sort({ createdOn: -1 });
          res.render('admin/sales-report',{order,salesToday:false,salesWeekly:false , salesMonthly:true})
  },
  salesYearly:async(req,res)=>{
      const today = new Date().getFullYear();
      const startofYear = new Date(today, 0, 1, 0, 0, 0, 0);
      const endofYear = new Date(today, 11, 31, 23, 59, 59, 999);


      const order = await orderModel.find({
          
          createdOn: {
              $lt: endofYear,
              $gte: startofYear,
          }
      }).sort({ createdOn: -1 });
      res.render('admin/sales-report',{order,salesToday:false,salesWeekly:false , salesMonthly:false , salesYearly:true})
  },

  monthlyreport:async(req,res)=>{
    try {
      const start = moment().subtract(30, 'days').startOf('day'); // Data for the last 30 days
      const end = moment().endOf('day');
  
      const orderSuccessDetails = await orderModel.find({
        createdOn: { $gte: start, $lte: end },
        orderStatus: 'delivered' 
      });
      
      const monthlySales = {};
  
      orderSuccessDetails.forEach(order => {
        const monthName = moment(order.order_date).format('MMMM');
        if (!monthlySales[monthName]) {
          monthlySales[monthName] = {
            revenue: 0,
            productCount: 0,
            orderCount: 0,
            codCount: 0,
            razorpayCount: 0,
          };
        }
        console.log("ORder: ",order)
        monthlySales[monthName].revenue += order.GrandTotal;
        monthlySales[monthName].productCount += order.items.length;
        monthlySales[monthName].orderCount++;
  
        if (order.payment=== 'cod') {
          monthlySales[monthName].codCount++;
        } else if (order.payment === 'Razorpay') {
          monthlySales[monthName].razorpayCount++;
        } 
      });
  
      const monthlyData = {
        labels: [],
        revenueData: [],
        productCountData: [],
        orderCountData: [],
        codCountData: [],
        razorpayCountData: [],
      };
  
      for (const monthName in monthlySales) {
        if (monthlySales.hasOwnProperty(monthName)) {
          monthlyData.labels.push(monthName);
          monthlyData.revenueData.push(monthlySales[monthName].revenue);
          monthlyData.productCountData.push(monthlySales[monthName].productCount);
          monthlyData.orderCountData.push(monthlySales[monthName].orderCount);
          monthlyData.codCountData.push(monthlySales[monthName].codCount);
          monthlyData.razorpayCountData.push(monthlySales[monthName].razorpayCount);
        }
      }
      console.log(monthlyData);
      return res.json(monthlyData);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'An error occurred while generating the monthly report.' });
    }
  },

}