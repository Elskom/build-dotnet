const fs = require("fs"),
    spawnSync = require("child_process").spawnSync

class Action {

    constructor() {
        this.solutionFile = process.env.INPUT_SOLUTION_FILE_PATH
        this.test = process.env.INPUT_TEST
        this.pack = process.env.INPUT_PACK
    }

    _printErrorAndExit(msg) {
        console.log(`##[error]😭 ${msg}`)
        throw new Error(msg)
    }

    _executeCommand(cmd, options) {
        console.log(`executing: [${cmd}]`)

        const INPUT = cmd.split(" "), TOOL = INPUT[0], ARGS = INPUT.slice(1)
        return spawnSync(TOOL, ARGS, options)
    }

    _executeInProcess(cmd, errmsg) {
        if (this._executeCommand(cmd, { encoding: "utf-8", stdio: [process.stdin, process.stdout, process.stderr] }).status > 0)
        {
            this._printErrorAndExit(errmsg)
        }
    }

    run() {
        this._executeInProcess(`dotnet restore${this.solutionFile === "" ? this.solutionFile : ` ${this.solutionFile}`}`, `restore failed`)
        this._executeInProcess(`dotnet build -c Release --no-restore${this.solutionFile === "" ? this.solutionFile : ` ${this.solutionFile}`}`, `build failed`)
        if (this.test) {
            this._executeInProcess(`dotnet test -c Release --no-build --no-restore${this.solutionFile === "" ? this.solutionFile : ` ${this.solutionFile}`}`, `testing failed`)
        }

        if (this.pack) {
            console.log(`Note: To package symbol packages as well as normal packages specify these msbuild properties inside of the project's csproj file or to an Directory.Build.props file that is automatically imported by the .NET SDK:`)
            console.log(`https://docs.microsoft.com/en-us/nuget/create-packages/symbol-packages-snupkg#creating-a-symbol-package`)
            console.log(`setting these will be honored when calling dotnet pack and dotnet nugget push.`)
            this._executeInProcess(`dotnet pack --no-build --no-restore -c Release${this.solutionFile === "" ? this.solutionFile : ` ${this.solutionFile}`}`, `packing failed`)
        }
    }
}

new Action().run()
