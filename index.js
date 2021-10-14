const fs = require("fs"),
    spawnSync = require("child_process").spawnSync

class Action {

    constructor() {
        this.solutionFile = process.env.INPUT_SOLUTION_FILE_PATH
        this.restore = process.env.INPUT_RESTORE
        this.test = process.env.INPUT_TEST
        this.pack = process.env.INPUT_PACK
        this.push = process.env.INPUT_PUSH
        this.NUGET_API_KEY = process.env.NUGET_API_KEY
        this.SOURCE_NAME = process.env.INPUT_SOURCE_NAME
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
        if (this.restore === "true") {
            this._executeInProcess(`dotnet restore${this.solutionFile === "" ? this.solutionFile : ` ${this.solutionFile}`}`, `restore failed`)
        }

        this._executeInProcess(`dotnet build -c Release ${this.restore === true ? "--no-restore" : ""}${this.solutionFile === "" ? this.solutionFile : ` ${this.solutionFile}`}`, `build failed`)
        if (this.test === "true") {
            this._executeInProcess(`dotnet test -c Release --no-build${this.solutionFile === "" ? this.solutionFile : ` ${this.solutionFile}`}`, `testing failed`)
        }

        if (this.pack === "true") {
            console.log(`Note: To package symbol packages as well as normal packages specify these msbuild properties inside of the project's csproj file or to an Directory.Build.props file that is automatically imported by the .NET SDK:`)
            console.log(`https://docs.microsoft.com/en-us/nuget/create-packages/symbol-packages-snupkg#creating-a-symbol-package`)
            console.log(`setting these will be honored when calling dotnet pack and dotnet nuget push.`)
            this._executeInProcess(`dotnet pack --no-build -c Release${this.solutionFile === "" ? this.solutionFile : ` ${this.solutionFile}`}`, `packing failed`)
        }

        if (this.push === "true") {
            console.log(`Note: In order to push packages to nuget.org set the "NUGET_API_KEY" environment variable for all GitHub actions repositories to your account or organization globally and also set it as an workflow environment variable as well.`)
            console.log(`see https://docs.github.com/en/actions/security-guides/encrypted-secrets for more details on this and for help setting it up.`)
            console.log(`Note: Only push when you are either wanting to deploy from commits made to the default branch or when a tag is pushed to the repository.`)
            console.log(`This is to avoid problems where people might try to inject code to the build scripts in a pull request that then will print the nuget api keys set in the CI.`)
            this._executeInProcess(`dotnet nuget push **/*.nupkg -s ${this.SOURCE_NAME} -k ${this.NUGET_API_KEY} --skip-duplicate`, `pushing failed`)
        }
    }
}

new Action().run()
