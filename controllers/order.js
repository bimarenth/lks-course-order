const uuid = require("uuid");
const config = require("../config/aws");
const { ddbClient } = require("../config/database.js");
const {
   ScanCommand,
   GetItemCommand,
   PutItemCommand,
   DeleteItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

exports.get_all = async (req, res) => {
   try {
      const command = new ScanCommand({
         TableName: config.dynamodb_table,
      });

      const { Count, Items } = await ddbClient.send(command);
      if (Count > 0) {
         const result = Items.map((i) => {
            return unmarshall(i);
         });
         res.status(200).json({
            code: "200",
            status: "OK",
            data: result,
         });
      } else {
         res.status(404).json({
            code: "404",
            status: "NOT_FOUND",
            error: {
               message: "Data not found!",
            },
         });
      }
   } catch (e) {
      res.status(500).json({
         code: "500",
         status: "INTERNAL_SERVER_ERROR",
         error: {
            name: e.name,
            message: e.message,
         },
      });
   }
};

exports.get_by_id = async (req, res) => {
   try {
      const orderId = req.params.orderId;
      const command = new GetItemCommand({
         TableName: config.dynamodb_table,
         Key: {
            order_id: {
               S: orderId,
            },
         },
      });

      const { Item } = await ddbClient.send(command);
      if (Item != undefined) {
         const result = unmarshall(Item);
         res.status(200).json({
            code: "200",
            status: "OK",
            data: result,
         });
      } else {
         res.status(404).json({
            code: "404",
            status: "NOT_FOUND",
            error: {
               message: "Data not found!",
            },
         });
      }
   } catch (e) {
      res.status(500).json({
         code: "500",
         status: "INTERNAL_SERVER_ERROR",
         error: {
            name: e.name,
            message: e.message,
         },
      });
   }
};

exports.create = async (req, res) => {
   try {
      const { order_id, items, payment_method, bank } = req.body;
      const amount = items.reduce((accumulator, e) => {
         return accumulator + parseFloat(e.price);
      }, 0);

      const data = {
         order_id: order_id,
         item: items,
         payment_method: payment_method,
         bank: bank,
         amount: amount,
      };

      const command = new PutItemCommand({
         TableName: config.dynamodb_table,
         Item: marshall(data),
      });

      await ddbClient.send(command);

      res.status(404).json({
         code: "200",
         status: "OK",
         data: data,
      });
   } catch (e) {
      const errorName = e.name ? e.name : "";
      if (errorName === "TypeError") {
         res.status(500).json({
            code: "400",
            status: "BAD_REQUEST",
            error: {
               name: e.name,
               message: e.message,
            },
         });
      } else {
         res.status(500).json({
            code: "500",
            status: "INTERNAL_SERVER_ERROR",
            error: {
               name: e.name,
               message: e.message,
            },
         });
      }
   }
};

exports.update = async (req, res) => {
   try {
      const { order_id, items, payment_method, bank } = req.body;
      const amount = items.reduce((accumulator, e) => {
         return accumulator + parseFloat(e.price);
      }, 0);

      const data = {
         order_id: order_id,
         item: items,
         payment_method: payment_method,
         bank: bank,
         amount: amount,
      };

      const command = new PutItemCommand({
         TableName: config.dynamodb_table,
         Item: marshall(data),
      });

      await ddbClient.send(command);

      res.status(404).json({
         code: "200",
         status: "OK",
      });
   } catch (e) {
      const errorName = e.name ? e.name : "";
      if (errorName === "TypeError") {
         res.status(500).json({
            code: "400",
            status: "BAD_REQUEST",
            error: {
               name: e.name,
               message: e.message,
            },
         });
      } else {
         res.status(500).json({
            code: "500",
            status: "INTERNAL_SERVER_ERROR",
            error: {
               name: e.name,
               message: e.message,
            },
         });
      }
   }
};

exports.delete = async (req, res) => {
   try {
      const orderId = req.params.orderId;
      console.log(orderId);
      const command = new DeleteItemCommand({
         TableName: config.dynamodb_table,
         Key: {
            order_id: {
               S: orderId,
            },
         },
      });

      const { Item } = await ddbClient.send(command);
      res.status(200).json({
         code: "200",
         status: "OK",
         message: `Delete Item with id ${orderId} success.`,
      });
   } catch (e) {
      res.status(500).json({
         code: "500",
         status: "INTERNAL_SERVER_ERROR",
         error: {
            name: e.name,
            message: e.message,
         },
      });
   }
};