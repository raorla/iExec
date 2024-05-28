import { iexec } from "./config.js";

const ownerAddress = await iexec.wallet.getAddress();

// replace with your app
const app = {
  name: "tee hello-world",
  type: "DOCKER", // always "DOCKER"
  owner: ownerAddress,
  multiaddr:
    "docker.io/iexechub/python-hello-world:8.0.0-sconify-5.7.5-v14-production",
  mrenclave: {
    // optional for tee apps only (see doc: https://protocol.docs.iex.ec/for-developers/confidential-computing/create-your-first-sgx-app)
    framework: "SCONE",
    version: "v5",
    entrypoint: "python /app/app.py",
    heapSize: 1073741824,
    fingerprint:
      "acf574009a4093846213a000039accaec90c8a242eb26a71063d967a74ac80ac", // scone fingerprint (from `docker run --rm -e SCONE_HASH=1 <app-image>`)
  },
  checksum:
    "0xe89eb32fe956d44ed582123b2259dec6ccd60f4b0f680e9b6e262a4734f66486", // docker image digest (from `docker pull <app-image> | grep "Digest: sha256:" | sed 's/.*sha256:/0x/'`)
};

console.log(`Deploying app: ${JSON.stringify(app, null, 2)}`);

const { address, txHash } = await iexec.app.deployApp(app);

console.log(`Deployed app address: ${address} (tx: ${txHash})`);

// // Inject a secret value in the app TEE runtime (this is a one time operation!)

// const secret = "SOME_SECRET_VALUE";

// const isSecretPushed = await iexec.app.pushAppSecret(address, secret);

// console.log(`App secret pushed: ${isSecretPushed}`);
