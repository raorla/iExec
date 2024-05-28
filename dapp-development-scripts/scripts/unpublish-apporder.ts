import { iexec } from "./config.js";

const orderHash = await iexec.order.unpublishApporder(
  "0xc71094f79a51abe7113afbfebab8a5b0fbb25cc0662d09e78655149a20ee8170" // replace with yours
);

console.log(`unpublished orderHash: ${orderHash}`);
