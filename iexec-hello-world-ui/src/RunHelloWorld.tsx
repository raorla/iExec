import { useEffect, useState } from "react";
import useIExec from "./useIExec";

function RunHelloWorld() {
  const { isConnected, iexec } = useIExec();

  const [isRunning, setIsRunning] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [dealid, setDealid] = useState<string | undefined>();
  const [taskid, setTaskid] = useState<string | undefined>();
  const [taskStatus, setTaskStatus] = useState<string | undefined>();
  const [taskCompleted, setTaskCompleted] = useState(false);

  const disabled = !isConnected || isRunning;

  const onclickRun = async () => {
    if (!disabled && iexec) {
      try {
        setIsRunning(true);
        setDealid(undefined);
        setTaskid(undefined);
        setStatusMessage("Fetching orders");

        const requester = await iexec.wallet.getAddress();
        const APP = "tee-hello-world.apps.iexec.eth";
        const TAG = ["tee", "scone"];
        // fetch apporder
        const { orders: apporders } = await iexec.orderbook.fetchAppOrderbook(
          APP,
          {
            requester,
            maxTag: TAG,
          }
        );
        const apporder = apporders[0]?.order;
        if (!apporder) {
          throw Error("Missing apporder");
        }
        // fetch workerpoolorder
        const { orders: workerpoolorders } =
          await iexec.orderbook.fetchWorkerpoolOrderbook({
            workerpool: "prod-v8-bellecour.main.pools.iexec.eth", // run on prod pool
            requester,
            minTag: TAG, // find orders that provide at least tee scone
          });
        const workerpoolorder = workerpoolorders[0]?.order;
        if (!workerpoolorder) {
          throw Error("Missing workerpoolorder");
        }
        // create requestorder
        setStatusMessage("Creating request order");
        const requestorder = await iexec.order
          .createRequestorder({
            app: APP,
            category: workerpoolorder.category,
            volume: 1,
            params: {
              iexec_args: "demo", // pass the args to the app
            },
          })
          .then(iexec.order.signRequestorder);
        // matching the orders creates a deal
        setStatusMessage("Creating a deal onchain");
        const { dealid } = await iexec.order.matchOrders({
          apporder,
          workerpoolorder,
          requestorder,
        });
        setStatusMessage("Task created");
        setDealid(dealid);
        // the taskid is derived from the dealid ond the index of the task
        const taskId = await iexec.deal.computeTaskId(dealid, 0);
        setTaskid(taskId);
      } catch (e) {
        console.error(e);
      }
      setIsRunning(false);
      setStatusMessage("");
    }
  };

  const onClickDownload = async () => {
    if (taskid && taskCompleted && iexec) {
      iexec.task
        .fetchResults(taskid)
        .then((res) => res.blob())
        .then((blob) => {
          // download blob
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = `${taskid}.zip`;
          document.body.appendChild(link);
          link.dispatchEvent(
            new MouseEvent("click", {
              bubbles: true,
              cancelable: true,
              view: window,
            })
          );
          document.body.removeChild(link);
        });
    }
  };

  useEffect(() => {
    if (iexec && taskid && dealid) {
      let abortTaskObservableSubscription: (() => void) | undefined;
      iexec.task.obsTask(taskid, { dealid }).then((taskObservable) => {
        abortTaskObservableSubscription = taskObservable.subscribe({
          complete: () => {
            setTaskCompleted(true);
          },
          next: ({ task }) => setTaskStatus(task.statusName.toLowerCase()),
          error: (e) => {
            console.error(e);
          },
        });
      });
      return () => {
        // abort the subscription in the cleanup method
        if (abortTaskObservableSubscription) {
          abortTaskObservableSubscription();
        }
      };
    } else {
      setTaskCompleted(false);
      setTaskStatus(undefined);
    }
  }, [iexec, taskid, dealid]);

  return (
    <div>
      <h2>Run Hello World app on iExec</h2>
      <button disabled={disabled} onClick={onclickRun}>
        {isRunning && statusMessage ? statusMessage : "Run hello-world app"}
      </button>
      <p>{taskid && `Task running ${taskid} ${taskStatus}`}</p>
      {taskid && taskCompleted && (
        <button onClick={onClickDownload}>Download result</button>
      )}
    </div>
  );
}

export default RunHelloWorld;
