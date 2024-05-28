import { writeFile } from "node:fs/promises";
import { iexec, workerpool } from "./config.js";

const requester = await iexec.wallet.getAddress();

const APP = "tee-hello-world.apps.iexec.eth";
const TAG = ["tee", "scone"];

console.log("Fetching orders");

const { orders: apporders } = await iexec.orderbook.fetchAppOrderbook(APP, {
  requester,
  maxTag: TAG,
});
const apporder = apporders[0]?.order;
if (!apporder) {
  throw Error("Missing apporder");
}

const { orders: workerpoolorders } =
  await iexec.orderbook.fetchWorkerpoolOrderbook({
    workerpool: workerpool, // run on specified workerpool
    requester,
    minTag: TAG, // find orders that provide at least tee scone
  });
const workerpoolorder = workerpoolorders[0]?.order;
if (!workerpoolorder) {
  throw Error("Missing workerpoolorder");
}

console.log("Creating request order");

const requestorder = await iexec.order
  .createRequestorder({
    app: APP,
    category: workerpoolorder.category,
    volume: 1,
    params: {
      iexec_args: "demo", // pass the args to the app
      // check other params
    },
  })
  .then(iexec.order.signRequestorder);

console.log("Creating a deal onchain");

const { txHash, dealid } = await iexec.order.matchOrders({
  apporder,
  workerpoolorder,
  requestorder,
});

// the taskid is derived from the dealid ond the index of the task
const taskid = await iexec.deal.computeTaskId(dealid, 0);
console.log(
  `Order matched dealid ${dealid} (tx: ${txHash}) (taskid: ${taskid})`
);

await new Promise<void>((resolve, reject) => {
  iexec.task.obsTask(taskid, { dealid }).then((taskObservable) => {
    taskObservable.subscribe({
      complete: () => {
        resolve();
      },
      next: ({ message, task }) => {
        console.log(`${message} task: ${JSON.stringify(task, null, 2)}`);
      },
      error: (e) => {
        reject(e);
      },
    });
  });
});

console.log("Fetching result");

const result = await iexec.task
  .fetchResults(taskid)
  .then((response) => response.arrayBuffer())
  .then((arrayBuffer) => Buffer.from(arrayBuffer));

const resultFileName = `${taskid}.zip`;

await writeFile(resultFileName, result);

console.log(`Result downloaded in ${resultFileName}`);
