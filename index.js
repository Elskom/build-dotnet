const os = require("os"),
    fs = require("fs"),
    path = require("path"),
    spawnSync = require("child_process").spawnSync

class Action {

    constructor() {
        this.solutionFile = process.env.SOLUTION_FILE_PATH
        this.packagePath = process.env.PACKAGE_PATH
        this.test = process.env.TEST
        this.pack = process.env.PACK
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

    run() {
        if (!this.solutionFile || !fs.existsSync(this.solutionFile)) {
            this._printErrorAndExit("solution file not found")
        }

        if (!this.packagePath || !fs.existsSync(this.packagePath)) {
            this._printErrorAndExit("PACKAGE_PATH not provided.")
        }

        // nuke any normal .nupkg/.snupkg inside the user specified package path
        // and then build the packages for the resulting projects inside of the
        // solution file specified.
        fs.readdirSync(this.packagePath).filter(fn => /\.s?nupkg$/.test(fn)).forEach(fn => fs.unlinkSync(fn))
        console.log(this._executeCommand(`dotnet restore ${this.solutionFile}`).stdout)
        console.log(this._executeCommand(`dotnet build -c Release --no-restore ${this.solutionFile}`).stdout)
        if (this.test) {
            console.log(this._executeCommand(`dotnet test -c Release --no-build --no-restore ${this.solutionFile}`).stdout)
        }

        if (this.pack) {
            console.log(`Note: To package symbol packages as well as normal packages specify these msbuild properties inside of the project's csproj file or to an Directory.Build.props file that is automatically imported by the .NET SDK:`)
            console.log(`https://docs.microsoft.com/en-us/nuget/create-packages/symbol-packages-snupkg#creating-a-symbol-package`)
            console.log(`setting these will be honored when calling dotnet pack and dotnet nugget push.`)
            console.log(this._executeCommand(`dotnet pack --no-build --no-restore -c Release ${this.solutionFile} -o ${this.packagePath}`).stdout)
            const packages = fs.readdirSync(this.packagePath).filter(fn => fn.endsWith("nupkg"))
            console.log(`Generated Package(s): ${packages.join(", ")}`)
        }
    }
}

new Action().run()
