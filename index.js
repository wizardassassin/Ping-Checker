import { pingServer } from "./pingWrap.js";
import { addresses as addr } from "./data.js";
import { PrismaClient } from "@prisma/client";
import { RollingAverage } from "./avgWrap.js";

const prisma = new PrismaClient();

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const waitInterval = 60000;
const rollMax = 10;
const summarizeMax = Math.floor(rollMax / 2);

const addresses = structuredClone(addr).map((x) => ({
    ...x,
    avg: new RollingAverage(rollMax),
}));

async function fetchPing() {
    const storeData = [];
    for (const obj of addresses) {
        if (obj.offset === 0) {
            const data = await pingServer(obj.address);
            storeData.push({
                time: data.time,
                address: obj.address,
                ...(!data.failed && { ping: data.ping }),
            });
            obj.avg.addNumber(data.ping);
            obj.offset = obj.interval;
        }
        obj.offset--;
    }
    await prisma.pingLog.createMany({
        data: storeData,
    });
}

function summarizeData() {
    const summarize = addresses.map((x) => ({
        name: x.name,
        ...x.avg.getAvg(),
    }));
    console.log(summarize);
}

let summarizeCounter = summarizeMax;
async function run() {
    await fetchPing();
    if (summarizeCounter === 0) {
        summarizeData();
        summarizeCounter = summarizeMax;
    }
    summarizeCounter--;
    setTimeout(run, waitInterval); // Will drift
}

run();
