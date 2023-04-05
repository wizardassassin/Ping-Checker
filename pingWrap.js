import { exec } from "node:child_process";
import { promisify } from "node:util";

const promiseExec = promisify(exec);

const shellArgs = {
    shell: "bash",
    cwd: ".",
};

const pingData = {
    name: "linux",
    countFlag: "-c",
};

const platforms = [
    {
        name: "win32",
        countFlag: "-n",
        shell: "powershell",
    },
    {
        name: "linux",
        countFlag: "-c",
        shell: "bash",
    },
];

/**
 *
 * @param {typeof platforms[number]} plat
 */
export function setPlatform(plat) {
    pingData.name = plat.name;
    pingData.countFlag = plat.countFlag;
    shellArgs.shell = plat.shell;
}

const type = process.platform;

let supported = false;
for (const plat of platforms) {
    if (plat.name === type) {
        supported = true;
        setPlatform(plat);
        break;
    }
}

if (!supported) {
    console.error("Unsupported Platform:", type);
    console.error(
        "Supported Platforms: ",
        platforms.map((x) => x.name)
    );
    console.error("The program might not work as expected");
    console.error("Use setPlatform() to manually set the platform");
}

/**
 *
 * @param {string} address
 * @param {number} count
 * @returns
 */
export async function pingServer(address, count = 1) {
    const time = new Date();
    const start = performance.now();
    const data = await promiseExec(
        `ping ${address} ${pingData.countFlag} ${count}`,
        shellArgs
    ).catch((x) => {
        if (x.code !== 1 && x.code !== 2) throw x;
        // console.error(x);
        // return {
        //     stdout: x.stdout,
        //     stderr: x.stderr,
        // };
        return {
            stdout: "",
            stderr: "Failed",
        };
    });
    if (data.stdout.toLowerCase().includes("destination host unreachable")) {
        data.stdout = "";
        data.stderr = "Failed";
    }
    const stop = performance.now();
    const duration = stop - start;
    if (data.stdout.length === 0 && data.stderr === "Failed") {
        return {
            failed: true,
            time: time,
            ip: "",
            ping: NaN,
            elapsed: duration,
        };
    }
    // console.log(data);
    const ip = data.stdout.match(/\(?(\d{1,3}(?:\.\d{1,3}){3})\)?:/)[1];
    const pingTime = data.stdout.match(/time=(\d*(?:\.\d+)?)\s?ms/)[1];
    return {
        failed: false,
        time: time,
        ip: ip,
        ping: Number(pingTime),
        elapsed: Math.round(duration * 10) / 10,
    };
}

export function persistentPingServer(address) {}
