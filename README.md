# ✨ Build DotNet
📦 GitHub action to build, test, and package projects. Also handles pushing the built packages when packing to any nuget feeds as well.

## Usage
Create new `.github/workflows/build.yml` file:

```yml
name: .NET Core Build
on:
  push:
    branches:
      - main # Default release branch
    tags:
      - '*'

jobs:
  publish:
    name: build, pack, test & publish
    runs-on: ubuntu-latest
    env:
      DOTNET_SKIP_FIRST_TIME_EXPERIENCE: true
      DOTNET_CLI_TELEMETRY_OPTOUT: true
      DOTNET_NOLOGO: true
      NUGET_API_KEY: ${{ secrets.NUGET_API_KEY }}
    steps:
      - uses: actions/checkout@main

      - name: Install latest .NET SDK
        uses: Elskom/setup-latest-dotnet@main

      - name: Restore, Build, test, and pack
        uses: Elskom/build-dotnet@main
        with:
          TEST: true
          PACK: true
```

Project gets built, optionally tested, and packaged (packaging is default enabled).

## Inputs

Input | Default Value | Description
--- | --- | ---
SOLUTION_FILE_PATH | `''` | Filepath of the solution of which contains all the projects to be packed, relative to root of repository
RESTORE | `true` | Flag to toggle running restore for the projects about to be built, enabled by default
TEST | `false` | Flag to toggle running unit tests for the projects built, disabled by default
PACK | `true` | Flag to toggle packing the projects built, enabled by default
PUSH | `false` | Flag to toggle pushing the packages to a nuget feed, disabled by default
SOURCE_NAME  | `nuget.org` | The source to use when pushing, nuget.org by default

**FYI:**
- Unit testing code coverage would need to be set in the csproj or an ``Directory.Build.props`` file of the project that contains unit tests with these set:
  - ``<CollectCoverage>true</CollectCoverage>``
  - ``<CoverletOutputFormat>opencover</CoverletOutputFormat>`` (or any other output format required by the service where the coverage reports get reported to)
  - ``<CoverletOutput>$(MSBuildThisFileDirectory)</CoverletOutput>``
- When wanting to include symbols in an symbols package set these as well in the csproj or an ``Directory.Build.props`` file of the project:
  - ``<IncludeSymbols>true</IncludeSymbols>``
  - ``<SymbolPackageFormat>snupkg</SymbolPackageFormat>``
- When the project being built is set to generate package on build, the PACK option on this action must be disabled.

## License
[MIT](LICENSE)
