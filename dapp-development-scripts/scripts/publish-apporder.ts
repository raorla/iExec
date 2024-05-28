import { iexec } from "./config.js";

const apporder = await iexec.order
  .createApporder({
    app: "hello-world.apps.iexec.eth", // replace with app address or ens
    // appprice: 1
    // ...
  })
  .then((order) => iexec.order.signApporder(order));

console.log(`apporder: ${JSON.stringify(apporder, null, 2)}`);

const orderHash = await iexec.order.publishApporder(apporder);

console.log(`published orderHash: ${orderHash}`);
